import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkConfig() {
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching config:", error);
    } else {
        console.log("Config Data:", {
            id: data.id,
            asaas_api_key: data.asaas_api_key ? (data.asaas_api_key.substring(0, 10) + "...") : "MISSING",
            split_percentage: data.split_percentage,
            google_maps_api_key: data.google_maps_api_key ? "SET" : "MISSING"
        });
    }
}

checkConfig();
