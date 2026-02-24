import { Metadata } from 'next';
import { ClienteBottomNav } from '@/components/ClienteBottomNav';
import { getGoogleMapsApiKey } from '@/actions/getMapKey';
import { MapProvider } from '@/components/MapProvider';
import { ClientMapWrapper } from './ClientMapWrapper';

export const metadata: Metadata = {
    title: 'GuinchoPro - Portal do Cliente',
    description: 'Acompanhe seus chamados em tempo real',
};

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
    const apiKey = await getGoogleMapsApiKey();

    return (
        <MapProvider apiKey={apiKey}>
            <main className="flex flex-col min-h-[100dvh] bg-gray-50 relative">
                <ClientMapWrapper />
                <div className="flex-1 relative z-10 pointer-events-none">
                    <div className="pointer-events-auto h-full w-full">
                        {children}
                    </div>
                </div>
                <ClienteBottomNav />
            </main>
        </MapProvider>
    );
}
