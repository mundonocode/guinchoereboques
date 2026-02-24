'use client';

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface MapProviderProps {
    apiKey: string | null;
    children: React.ReactNode;
}

export function MapProvider({ apiKey, children }: MapProviderProps) {
    if (!apiKey) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-8 text-center">
                <div className="max-w-md space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Mapa Indisponível</h2>
                    <p className="text-gray-500">A chave da API do Google Maps ainda não foi configurada. Acesse o painel Admin para inseri-la.</p>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey} language="pt-BR" region="BR">
            {children}
        </APIProvider>
    );
}
