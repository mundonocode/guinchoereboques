import { createClient } from '@/utils/supabase/server';

export async function getGoogleMapsApiKey() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('get_google_maps_key' as any);

        if (error) {
            console.error('Erro ao buscar chave do Google Maps:', error);
            return null;
        }

        return data || null;
    } catch (error) {
        console.error('Erro de servidor ao buscar chave do Google Maps:', error);
        return null;
    }
}
