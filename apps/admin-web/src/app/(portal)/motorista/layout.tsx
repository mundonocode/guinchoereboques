import { Metadata } from 'next';
import { MotoristaBottomNav } from '@/components/MotoristaBottomNav';
import { getGoogleMapsApiKey } from '@/actions/getMapKey';
import { MapProvider } from '@/components/MapProvider';
import { MotoristaMapWrapper } from './MotoristaMapWrapper';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'GuinchoPro - Parceiro',
    description: 'Aplicativo do Motorista Parceiro',
};

export default async function MotoristaLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: perfil } = await supabase
        .from('perfis')
        .select('onboarding_completo')
        .eq('id', user.id)
        .single();

    const heads = await headers();
    const pathname = heads.get('x-pathname') || '';
    const isOnboardingPage = pathname.includes('/motorista/onboarding');

    // Se o onboarding for falso ou nulo, é considerado incompleto
    const onboardingIncompleto = (perfil as any)?.onboarding_completo === false || (perfil as any)?.onboarding_completo === null;

    // Se o onboarding não estiver completo e não estivermos já na página de onboarding, redireciona
    if (onboardingIncompleto && !isOnboardingPage) {
        redirect('/motorista/onboarding');
    }

    const apiKey = await getGoogleMapsApiKey();

    return (
        <MapProvider apiKey={apiKey}>
            <main className="flex flex-col min-h-[100dvh] bg-gray-50 relative">
                {/* O mapa e o menu inferior só aparecem para motoristas com onboarding completo */}
                {!onboardingIncompleto && (
                    <>
                        <MotoristaMapWrapper />
                        <MotoristaBottomNav />
                    </>
                )}

                <div className="flex-1 relative z-10 pointer-events-none">
                    <div className="pointer-events-auto h-full w-full">
                        {children}
                    </div>
                </div>
            </main>
        </MapProvider>
    );
}
