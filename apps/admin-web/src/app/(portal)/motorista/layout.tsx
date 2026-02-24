import { Metadata } from 'next';
import { MotoristaBottomNav } from '@/components/MotoristaBottomNav';
import { getGoogleMapsApiKey } from '@/actions/getMapKey';
import { MapProvider } from '@/components/MapProvider';
import { MotoristaMapWrapper } from './MotoristaMapWrapper';

export const metadata: Metadata = {
    title: 'GuinchoPro - Parceiro',
    description: 'Aplicativo do Motorista Parceiro',
};

export default async function MotoristaLayout({ children }: { children: React.ReactNode }) {
    const apiKey = await getGoogleMapsApiKey();

    return (
        <MapProvider apiKey={apiKey}>
            <main className="flex flex-col min-h-[100dvh] bg-gray-50 relative">
                <MotoristaMapWrapper />
                <div className="flex-1 relative z-10 pointer-events-none">
                    <div className="pointer-events-auto h-full w-full">
                        {children}
                    </div>
                </div>
                <MotoristaBottomNav />
            </main>
        </MapProvider>
    );
}
