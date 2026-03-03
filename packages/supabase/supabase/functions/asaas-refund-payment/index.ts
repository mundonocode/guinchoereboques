import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        console.log("Authorization Header (first 10 chars):", authHeader?.substring(0, 10));
        console.log("Authorization Header present:", !!authHeader);

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: authHeader || '' },
                },
            }
        );

        // Get the User ID from the Authorization header
        const {
            data: { user },
            error: authError,
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            console.error("Auth error:", authError);
            return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const bodyText = await req.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'Body required' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);
        console.log("Refund Request Body:", JSON.stringify(body));

        const { rideId, paymentId } = body;

        if (!rideId && !paymentId) {
            console.error("Missing rideId or paymentId");
            return new Response(JSON.stringify({ error: 'Missing rideId or paymentId' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // To securely access configuracoes and update status
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        let finalPaymentId = paymentId;

        // If only rideId is provided, fetch the paymentId from the database
        if (rideId && !finalPaymentId) {
            console.log("Fetching payment ID for ride:", rideId);
            const { data: rideData, error: rideError } = await supabaseAdmin
                .from("corridas")
                .select("asaas_payment_id")
                .eq("id", rideId)
                .single();

            if (rideError || !rideData?.asaas_payment_id) {
                console.error("Ride not found or no payment linked:", rideError);
                return new Response(JSON.stringify({ error: 'Ride not found or no payment linked', details: rideError }), {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            finalPaymentId = rideData.asaas_payment_id;
            console.log("Found Asaas Payment ID:", finalPaymentId);
        }

        // 1. Fetch Global Settings (Asaas API Key)
        const { data: configData, error: configError } = await supabaseAdmin
            .from("configuracoes")
            .select("asaas_api_key")
            .limit(1)
            .single();

        if (configError || !configData?.asaas_api_key) {
            console.error("Platform Asaas Setup is missing");
            return new Response(JSON.stringify({ error: 'Platform Asaas Setup is missing' }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ASAAS_API_KEY = configData.asaas_api_key;
        const ASAAS_BASE_URL = ASAAS_API_KEY.includes('YTU5YTE0M2M2N2I') ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';
        console.log("Using Asaas URL:", ASAAS_BASE_URL);

        // 2. Call Asaas Refund API
        console.log(`Refunding payment ${finalPaymentId}...`);
        const refundResponse = await fetch(`${ASAAS_BASE_URL}/payments/${finalPaymentId}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            }
        });

        const refundResult = await refundResponse.json();

        if (!refundResponse.ok) {
            console.error("Asaas Refund Error:", JSON.stringify(refundResult));
            // Return success even if refund fails due to "already refunded" or similar, to allow ride update
            if (refundResult.errors?.some((e: any) => e.code === 'PAYMENT_ALREADY_REFUNDED')) {
                console.log("Payment already refunded, proceeding to update ride status.");
            } else {
                return new Response(JSON.stringify({ error: 'Asaas API Error refunding payment', details: refundResult }), {
                    status: refundResponse.status,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
        }

        console.log("Refund processed successfully at Asaas.");

        // 3. Update Ride Record if rideId is provided
        if (rideId) {
            console.log("Updating ride status to cancelada_reembolsada for:", rideId);
            const { error: rideUpdateError } = await supabaseAdmin
                .from("corridas")
                .update({
                    asaas_payment_status: 'REFUNDED',
                    status: 'cancelada_reembolsada'
                })
                .eq("id", rideId);

            if (rideUpdateError) {
                console.error("Supabase Ride Update Error:", rideUpdateError);
            } else {
                console.log("Ride status updated successfully.");
            }
        }

        return new Response(JSON.stringify({
            success: true,
            refund: refundResult
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
