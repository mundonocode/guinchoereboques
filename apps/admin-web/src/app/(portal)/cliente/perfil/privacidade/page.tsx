'use client';

import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacidadePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-50">
            <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
                <button onClick={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="flex-1 text-center text-[18px] font-bold text-gray-900 pr-8">Privacidade</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Shield size={64} className="text-gray-200 mb-6" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Termos e Privacidade</h2>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Nossas políticas de privacidade e termos de uso estarão disponíveis nesta tela em breve.
                </p>
                <button
                    onClick={() => router.back()}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform"
                >
                    Voltar para o Perfil
                </button>
            </div>
        </div>
    );
}
