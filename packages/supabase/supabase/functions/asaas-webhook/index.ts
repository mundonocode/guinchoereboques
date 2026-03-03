import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from asaas-webhook!");

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Security: Verify Asaas Access Token
        const asaasToken = req.headers.get("asaas-access-token");
        // In a production environment, you should store this token in Supabase Secrets
        // and fetch it using Deno.env.get("ASAAS_WEBHOOK_TOKEN")
        const EXPECTED_TOKEN = "whsec_Kkdw0CE8NU-m7fgbRMWZDbJltH3T-aG6WycEpGukxiQ";

        if (asaasToken !== EXPECTED_TOKEN) {
            console.error("Unauthorized webhook attempt. Invalid token.");
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const bodyText = await req.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: "Body required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);
        const { event, payment } = body;

        console.log(`Received Asaas Webhook event: ${event} for payment: ${payment?.id}`);

        if (!payment?.id) {
            return new Response(JSON.stringify({ error: "Payment ID missing in webhook body" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Update the 'corridas' table based on the Asaas payment ID
        const { data: rideData, error: rideError } = await supabaseAdmin
            .from("corridas")
            .select("id, status")
            .eq("asaas_payment_id", payment.id)
            .single();

        if (rideError || !rideData) {
            console.warn(`Ride not found for Asaas payment: ${payment.id}`);
            return new Response(JSON.stringify({ message: "Ride not found, but webhook received" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Map Asaas event/status to our internal ride/payment status
        let updatePayload: any = {
            asaas_payment_status: payment.status
        };

        // Handling specific events
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
            console.log(`Payment confirmed for ride ${rideData.id}. Updating status to buscando_motorista.`);
            updatePayload.status = 'buscando_motorista';
        } else if (event === "PAYMENT_OVERDUE") {
            console.log(`Payment overdue for ride ${rideData.id}.`);
            // Add business logic for overdue payments, e.g., notify user/admin
        }

        const { error: updateError } = await supabaseAdmin
            .from("corridas")
            .update(updatePayload)
            .eq("id", rideData.id);

        if (updateError) {
            console.error("Error updating ride status from webhook:", updateError);
            return new Response(JSON.stringify({ error: "Failed to update ride" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, rideId: rideData.id }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Internal Server Error in Webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
