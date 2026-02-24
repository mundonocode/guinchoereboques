const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/mobile-client/.env' }); // Make sure we load the env

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateRide() {
    console.log('Fetching an online motorista...');

    // Get the first motorista (ignoring online status just to force a test)
    const { data: motoristas, error: motoristaError } = await supabase
        .from('perfis')
        .select('*')
        .eq('role', 'motorista')
        .limit(1);

    if (motoristaError || !motoristas || motoristas.length === 0) {
        console.error('Could not find any motorista to test with.', motoristaError);
        process.exit(1);
    }

    const targetMotoristaId = motoristas[0].id;
    console.log(`Found motorista: ${targetMotoristaId} (${motoristas[0].nome_completo})`);

    // Force approve them so they can go online on the app if they haven't been approved yet
    await supabase.from('perfis').update({ is_active: true, is_online: true }).eq('id', targetMotoristaId);
    console.log('Forcefully approved motorista and set online status to true for testing.');

    console.log('Inserting a test ride...');

    // Insert a dummy ride
    const { data: ride, error: rideError } = await supabase
        .from('corridas')
        .insert([
            {
                motorista_id: targetMotoristaId,
                origem_endereco: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
                origem_lat: -23.5615,
                origem_lng: -46.6560,
                destino_endereco: 'R. Funchal, 418 - Vila Olímpia, São Paulo - SP',
                destino_lat: -23.5932,
                destino_lng: -46.6859,
                valor: 154.50,
                distancia_km: 8.2,
                status: 'buscando_motorista'
            }
        ])
        .select()
        .single();

    if (rideError) {
        console.error('Error inserting ride:', rideError);
        process.exit(1);
    }

    console.log('✅ TEST RIDE INSERTED SUCCESSFULLY!');
    console.log('The app should now show the Incoming Ride Modal.');
    console.log(ride);
}

simulateRide();
