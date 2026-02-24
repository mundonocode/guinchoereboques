import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from asaas-create-account!");

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        // Get the User ID from the Authorization header to ensure they are authenticated
        const {
            data: { user },
            error: authError,
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Parse the request body
        const bodyText = await req.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'Body required' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);
        const { profileId, name, email, cpfCnpj, tipoPessoa, ...restParams } = body;

        if (!profileId || !name || !email || !cpfCnpj) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Note: To securely access the 'configuracoes' table (which is restricted to admins via RLS),
        // we need to use the Service Role Key to bypass RLS and fetch the Asaas API Key.
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: configData, error: configError } = await supabaseAdmin
            .from("configuracoes")
            .select("asaas_api_key")
            .limit(1)
            .single();

        if (configError || !configData?.asaas_api_key) {
            console.error("Config Error:", configError);
            return new Response(JSON.stringify({ error: 'Platform Asaas API Key not configured' }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ASAAS_API_KEY = configData.asaas_api_key;
        // Asaas sandbox URL vs Production. Hardcoding sandbox for now if it's test
        const ASAAS_BASE_URL = ASAAS_API_KEY.startsWith('$aact_YTU5YTE0M2M2N2I') ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

        // Call Asaas API to create Subaccount
        const asaasPayload = {
            name: name,
            email: email,
            cpfCnpj: cpfCnpj,
            companyType: tipoPessoa === 'PJ' ? 'MEI' : null, // Simplification, adjust based on your UI
            ...restParams,
        };

        const asaasResponse = await fetch(`${ASAAS_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(asaasPayload)
        });

        const asaasResult = await asaasResponse.json();

        if (!asaasResponse.ok) {
            console.error("Asaas API Error:", asaasResult);
            // Update profile status to REJECTED if it fails
            await supabaseAdmin.from('perfis').update({
                asaas_status: 'REJECTED'
            }).eq('id', profileId);

            return new Response(JSON.stringify({ error: 'Asaas API Error', details: asaasResult }), {
                status: asaasResponse.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Subaccount created successfully!
        const asaasWalletId = asaasResult.walletId || asaasResult.id;

        // Save the wallet ID to the profile
        const { error: updateError } = await supabaseAdmin.from('perfis').update({
            recebimento_asaas_id: asaasWalletId,
            asaas_status: 'ACTIVE'
        }).eq('id', profileId);

        if (updateError) {
            console.error("Supabase Update Error:", updateError);
            return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, walletId: asaasWalletId }), {
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
