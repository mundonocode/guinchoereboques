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
        const authHeader = req.headers.get("Authorization");
        console.log("Authorization Header present:", !!authHeader);
        if (authHeader) {
            console.log("Auth header start:", authHeader.substring(0, 15));
        }

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
            console.error("Auth error details:", JSON.stringify(authError));
            return new Response(JSON.stringify({
                error: 'Unauthorized',
                message: 'Failed to authenticate user from JWT. Check if the Authorization header is a valid Bearer token.',
                details: authError
            }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Authenticated User:", user.id);

        const bodyText = await req.text();
        if (!bodyText) {
            return new Response(JSON.stringify({ error: 'Body required' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);
        console.log("Payment Body Request:", JSON.stringify(body));

        const {
            motoristaProfileId,
            clienteId,
            rideId,
            value,
            billingType = 'PIX',
            description,
            customerName: providedCustomerName,
            customerCpfCnpj: providedCustomerCpfCnpj,
            customerEmail: providedCustomerEmail,
            dueDate,
            ...restParams
        } = body;

        if (!value || (!clienteId && (!providedCustomerName || !providedCustomerCpfCnpj))) {
            console.error("Missing fields. Value:", value, "ClienteId:", clienteId);
            return new Response(JSON.stringify({ error: 'Missing required payment fields (value and customer info)' }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Fetch Cliente info if clienteId is provided
        let customerName = providedCustomerName;
        let customerCpfCnpj = providedCustomerCpfCnpj;
        let customerEmail = providedCustomerEmail;

        if (clienteId) {
            console.log("Fetching cliente data for:", clienteId);
            const { data: clienteData, error: clienteError } = await supabaseAdmin
                .from("perfis")
                .select("nome_completo, cpf, recebimento_email")
                .eq("id", clienteId)
                .single();

            if (clienteError) {
                console.error("Error fetching cliente profile:", clienteError);
            }

            if (clienteData) {
                customerName = customerName || clienteData.nome_completo;
                customerCpfCnpj = customerCpfCnpj || clienteData.cpf;
                customerEmail = customerEmail || clienteData.recebimento_email;
                console.log("Cliente data found:", { customerName, hasCpf: !!customerCpfCnpj });
            }
        }

        // Ensure value is a number and rounded to 2 decimal places
        const finalValue = Number(Number(value).toFixed(2));
        console.log("Final rounded value:", finalValue);

        if (!customerName || !customerCpfCnpj) {
            console.error("Customer missing Name or CPF:", { customerName, customerCpfCnpj });
            return new Response(JSON.stringify({
                error: 'Customer name and CPF/CNPJ are required',
                details: { name: customerName, cpf: customerCpfCnpj }
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 1. Fetch Global Settings
        const { data: configData, error: configError } = await supabaseAdmin
            .from("configuracoes")
            .select("asaas_api_key, split_percentage, dev_split_percentage, dev_wallet_id, dev_split_enabled, dev_cumulative_revenue, dev_revenue_limit")
            .limit(1)
            .single();

        if (configError || !configData?.asaas_api_key) {
            console.error("Config Error: Asaas API Key is missing in 'configuracoes' table.", configError);
            return new Response(JSON.stringify({
                error: 'Platform Asaas Setup is missing',
                message: 'A chave de API do Asaas não foi encontrada na tabela de configurações.'
            }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const ASAAS_API_KEY = configData.asaas_api_key;
        // Improved logic: If it starts with sandbox prefix or doesn't start with production pattern, it's sandbox.
        // For security, only log a small portion
        console.log("Using API Key prefix:", ASAAS_API_KEY.substring(0, 15) + "...");

        const ASAAS_BASE_URL = ASAAS_API_KEY.includes('YTU5YTE0M2M2N2I') ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';
        console.log("Using Asaas URL:", ASAAS_BASE_URL);

        // 2. Fetch Motorista Wallet ID (handling both column names)
        let motoristaWalletId = null;
        if (motoristaProfileId) {
            console.log("Fetching motorista wallet for:", motoristaProfileId);
            const { data: motoristaData, error: motoristaError } = await supabaseAdmin
                .from("perfis")
                .select("recebimento_asaas_id, asaas_wallet_id, asaas_status")
                .eq("id", motoristaProfileId)
                .single();

            if (!motoristaError && motoristaData) {
                const walletId = motoristaData.recebimento_asaas_id || motoristaData.asaas_wallet_id;
                if (walletId && (motoristaData.asaas_status === 'ACTIVE' || motoristaData.asaas_status === 'PENDING')) {
                    motoristaWalletId = walletId;
                    console.log(`Setting split for motorista wallet: ${motoristaWalletId}`);
                }
            }
        }

        // 3. Create or get customer for the payer
        console.log("Lookup customer at Asaas for CPF:", customerCpfCnpj);
        const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers?cpfCnpj=${customerCpfCnpj}`, {
            headers: { 'access_token': ASAAS_API_KEY }
        });
        const customerResult = await customerResponse.json();
        let customerId = '';

        if (customerResult.data && customerResult.data.length > 0) {
            customerId = customerResult.data[0].id;
            console.log("Found existing customer ID:", customerId);
        } else {
            console.log("Creating new customer at Asaas...");
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
                console.error("Error creating customer at Asaas:", newCustomerRes);
                return new Response(JSON.stringify({ error: 'Failed to create Customer', details: newCustomerRes }), {
                    status: newCustomerReq.status,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }
            customerId = newCustomerRes.id;
            console.log("Created new customer ID:", customerId);
        }

        // 4. Calculate Split
        let split = [];
        if (motoristaWalletId) {
            // Check if Dev Fix is enabled and under limit
            const devEnabled = configData.dev_split_enabled && 
                             (Number(configData.dev_cumulative_revenue || 0) < Number(configData.dev_revenue_limit || 50000));
            
            const devPercentage = devEnabled ? Number(configData.dev_split_percentage || 5) : 0;
            const platformPercentage = Number(configData.split_percentage || 10);
            
            // Total Platform + Dev fee (e.g. 10 + 5 = 15)
            // Motorista gets the rest (e.g. 100 - 15 = 85)
            const motoristaPercentage = 100 - (platformPercentage + devPercentage);
            
            // Main Motorista Split
            split.push({
                walletId: motoristaWalletId,
                percentualValue: motoristaPercentage
            });

            // Dev Split (if applicable)
            if (devEnabled && configData.dev_wallet_id) {
                split.push({
                    walletId: configData.dev_wallet_id,
                    percentualValue: devPercentage
                });
                console.log(`Included Dev Split: ${devPercentage}% to ${configData.dev_wallet_id}`);
            }

            console.log("Split configuration done:", split);
        }

        // 5. Create Payment
        let remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
        // Provide a fallback IP for local testing/environments since Asaas requires it for Credit Card
        if (!remoteIp || remoteIp === "127.0.0.1" || remoteIp === "::1" || remoteIp.startsWith("192.168.")) {
            remoteIp = "177.100.100.100";
        }

        const paymentPayload = {
            customer: customerId,
            billingType: billingType,
            value: finalValue,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            description: description || 'Corrida Guincho',
            split: split.length > 0 ? split : undefined,
            remoteIp: billingType === 'CREDIT_CARD' ? remoteIp : undefined,
            ...restParams
        };

        console.log("Creating payment at Asaas with payload:", JSON.stringify(paymentPayload));
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

        console.log("Payment created successfully:", paymentResult.id);

        // 6. Update Ride Record
        if (rideId) {
            const { error: rideUpdateError } = await supabaseAdmin
                .from("corridas")
                .update({
                    asaas_payment_id: paymentResult.id,
                    asaas_payment_status: paymentResult.status
                })
                .eq("id", rideId);

            if (rideUpdateError) {
                console.error("Supabase Ride Update Error:", rideUpdateError);
            }
        }

        // 7. PIX QR Code
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
