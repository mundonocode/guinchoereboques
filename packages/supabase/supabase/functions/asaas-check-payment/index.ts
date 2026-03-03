import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: authHeader || '' } },
            }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

        const { rideId } = JSON.parse(bodyText);

        if (!rideId) {
            return new Response(JSON.stringify({ error: 'rideId is required' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Fetch ride to get asaas_payment_id and verify ownership
        const { data: rideData, error: rideError } = await supabaseAdmin
            .from("corridas")
            .select("id, cliente_id, asaas_payment_id, status")
            .eq("id", rideId)
            .single();

        if (rideError || !rideData) {
            return new Response(JSON.stringify({ error: 'Ride not found' }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Basic authorization: user must be the client of the ride
        if (rideData.cliente_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!rideData.asaas_payment_id) {
            return new Response(JSON.stringify({ error: 'No payment ID found for this ride' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Fetch API Key
        const { data: configData, error: configError } = await supabaseAdmin
            .from("configuracoes")
            .select("asaas_api_key")
            .limit(1)
            .single();

        if (configError || !configData?.asaas_api_key) {
            return new Response(JSON.stringify({ error: 'Platform Asaas Setup is missing' }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ASAAS_API_KEY = configData.asaas_api_key;
        const ASAAS_BASE_URL = ASAAS_API_KEY.includes('YTU5YTE0M2M2N2I') ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

        // Check payment status on Asaas
        const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments/${rideData.asaas_payment_id}`, {
            method: 'GET',
            headers: {
                'access_token': ASAAS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error("Asaas API Error:", errorText);
            return new Response(JSON.stringify({ error: 'Failed to verify payment with Asaas' }), {
                status: 502,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const paymentData = await paymentResponse.json();
        const paymentStatus = paymentData.status;

        console.log(`Manual check: Payment ${rideData.asaas_payment_id} status is ${paymentStatus}`);

        let newRideStatus = rideData.status;

        if (paymentStatus === 'CONFIRMED' || paymentStatus === 'RECEIVED') {
            newRideStatus = 'buscando_motorista';

            if (rideData.status !== newRideStatus) {
                const { error: updateError } = await supabaseAdmin
                    .from("corridas")
                    .update({
                        status: newRideStatus,
                        asaas_payment_status: paymentStatus
                    })
                    .eq("id", rideId);

                if (updateError) {
                    console.error("Failed to update ride status in DB:", updateError);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            asaas_status: paymentStatus,
            ride_status: newRideStatus
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Check payment edge function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
