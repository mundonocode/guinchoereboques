import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from asaas-create-payment!");

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

        // Get the User ID from the Authorization header
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

        const bodyText = await req.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'Body required' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);
        // Motorista Wallet ID, Amount of the ride, billingType (PIX, CREDIT_CARD), description, customer params
        const {
            motoristaProfileId,
            value,
            billingType = 'PIX',
            description,
            customerName,
            customerCpfCnpj,
            customerEmail,
            dueDate,
            ...restParams
        } = body;

        if (!motoristaProfileId || !value || !customerName || !customerCpfCnpj) {
            return new Response(JSON.stringify({ error: 'Missing required payment fields' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // To securely access configuracoes and motorista profile
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Fetch Global Settings (Asaas API Key and Split %)
        const { data: configData, error: configError } = await supabaseAdmin
            .from("configuracoes")
            .select("asaas_api_key, split_percentage")
            .limit(1)
            .single();

        if (configError || !configData?.asaas_api_key) {
            return new Response(JSON.stringify({ error: 'Platform Asaas Setup is missing' }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ASAAS_API_KEY = configData.asaas_api_key;
        const ASAAS_BASE_URL = ASAAS_API_KEY.startsWith('$aact_YTU5YTE0M2M2N2I') ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

        // 2. Fetch Motorista Wallet ID
        const { data: motoristaData, error: motoristaError } = await supabaseAdmin
            .from("perfis")
            .select("recebimento_asaas_id, asaas_status")
            .eq("id", motoristaProfileId)
            .single();

        if (motoristaError || !motoristaData?.recebimento_asaas_id) {
            return new Response(JSON.stringify({ error: 'Motorista does not have an active Asaas Wallet' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (motoristaData.asaas_status !== 'ACTIVE') {
            return new Response(JSON.stringify({ error: 'Motorista account is not ACTIVE yet' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Create or get customer for the payer (the user)
        // Since we don't store Asaas Customer ID for the client yet, we create it dynamically.
        // In a real app, you can search if the CPF/CNPJ exists on Asaas and reuse the customer ID.
        const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers?cpfCnpj=${customerCpfCnpj}`, {
            headers: {
                'access_token': ASAAS_API_KEY
            }
        });
        const customerResult = await customerResponse.json();
        let customerId = '';

        if (customerResult.data && customerResult.data.length > 0) {
            customerId = customerResult.data[0].id;
        } else {
            // Create customer
            const newCustomerReq = await fetch(`${ASAAS_BASE_URL}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': ASAAS_API_KEY
                },
                body: JSON.stringify({
                    name: customerName,
                    cpfCnpj: customerCpfCnpj,
                    email: customerEmail,
                })
            });
            const newCustomerRes = await newCustomerReq.json();
            if (!newCustomerReq.ok) {
                return new Response(JSON.stringify({ error: 'Failed to create Customer', details: newCustomerRes }), {
                    status: newCustomerReq.status,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            customerId = newCustomerRes.id;
        }

        // 4. Calculate Split
        const platformPercentage = Number(configData.split_percentage || 15);
        const motoristaPercentage = 100 - platformPercentage;

        // 5. Create Payment with Split
        const paymentPayload = {
            customer: customerId,
            billingType: billingType,
            value: value,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            description: description || 'Corrida Guincho',
            split: [
                {
                    walletId: motoristaData.recebimento_asaas_id,
                    percentualValue: motoristaPercentage
                }
            ],
            ...restParams
        };

        const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(paymentPayload)
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResponse.ok) {
            console.error("Asaas Payment Error:", paymentResult);
            return new Response(JSON.stringify({ error: 'Asaas API Error generating payment', details: paymentResult }), {
                status: paymentResponse.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // If it's a PIX payment, fetch the PIX QR Code payload to return it explicitly
        let pixData = null;
        if (billingType === 'PIX') {
            const pixReq = await fetch(`${ASAAS_BASE_URL}/payments/${paymentResult.id}/pixQrCode`, {
                headers: { 'access_token': ASAAS_API_KEY }
            });
            if (pixReq.ok) {
                pixData = await pixReq.json();
            }
        }

        return new Response(JSON.stringify({
            success: true,
            payment: paymentResult,
            pix: pixData
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
