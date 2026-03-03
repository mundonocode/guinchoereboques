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
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

        const authHeader = req.headers.get("Authorization");
        const authClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader || '' } },
        });

        const { data: { user }, error: authError } = await authClient.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { data: adminProfile } = await supabaseAdmin.from('perfis').select('role').eq('id', user.id).single();
        if (adminProfile?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden. Admin privileges required.' }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const body = await req.json();
        const users = body.users || [];

        const results = { successful: 0, failed: 0, errors: [] as any[] };

        for (const u of users) {
            try {
                // Remove weird formatting if any
                const email = u.email?.trim();
                const cpf = u.cpf?.replace(/\D/g, '');
                if (!email) throw new Error("Email é obrigatório");

                // 1. Create Auth User
                const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: u.password || 'Mudar@123',
                    email_confirm: true,
                    user_metadata: { nome_completo: u.nome, cpf: cpf }
                });

                if (createError) throw new Error(`Auth Error: ${createError.message}`);
                const newUserId = newAuthUser.user.id;

                // Wait a tiny bit for the auth trigger to create the 'perfis' if one exists
                await new Promise(res => setTimeout(res, 500));

                // 2. Update Profile to set role = 'motorista'
                const { error: profileError } = await supabaseAdmin.from('perfis').upsert({
                    id: newUserId,
                    nome_completo: u.nome,
                    cpf: cpf,
                    telefone: u.telefone,
                    role: 'motorista',
                    is_active: true
                });

                if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

                // 3. Insert Vehicle if provided
                if (u.placa) {
                    const { error: vehicleError } = await supabaseAdmin.from('veiculos_guincho').insert({
                        perfil_id: newUserId,
                        placa: u.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                        marca_modelo: u.marca_modelo || 'Desconhecido',
                        tipo: u.tipo_veiculo || 'guincho_leve',
                        status: 'Offline'
                    });
                    if (vehicleError) throw new Error(`Vehicle Error: ${vehicleError.message}`);
                }

                results.successful++;
            } catch (err: any) {
                results.failed++;
                results.errors.push({ email: u.email, message: err.message });
            }
        }

        return new Response(JSON.stringify(results), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
