const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/admin-web/.env.local' }); // Load web env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function acceptLatestRide() {
    console.log('Fetching latest pending ride...');

    const { data: rides, error: rideError } = await supabase
        .from('corridas')
        .select('*')
        .eq('status', 'buscando_motorista')
        .order('created_at', { ascending: false })
        .limit(1);

    if (rideError || !rides || rides.length === 0) {
        console.error('No pending rides found with status "buscando_motorista".', rideError);
        process.exit(1);
    }

    const ride = rides[0];
    console.log(`Found ride ID: ${ride.id} for client: ${ride.cliente_id}`);

    if (!ride.motorista_id) {
        console.log('Ride has no motorista_id assigned yet. Finding an available motorista...');
        const { data: motoristas } = await supabase
            .from('perfis')
            .select('id')
            .eq('role', 'motorista')
            .limit(1);

        if (!motoristas || motoristas.length === 0) {
            console.error('No motoristas found in database to assign.');
            process.exit(1);
        }

        ride.motorista_id = motoristas[0].id;
        console.log(`Assigning motorista: ${ride.motorista_id}`);
    }

    console.log(`Accepting ride ${ride.id} as motorista ${ride.motorista_id}...`);

    const { error: updateError } = await supabase
        .from('corridas')
        .update({
            status: 'aceita',
            motorista_id: ride.motorista_id
        })
        .eq('id', ride.id);

    if (updateError) {
        console.error('Error accepting ride:', updateError);
        process.exit(1);
    }

    console.log('✅ RIDE ACCEPTED SUCCESSFULLY!');
}

acceptLatestRide();
