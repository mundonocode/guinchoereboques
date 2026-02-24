'use client';

import { ArrowLeft, HelpCircle, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AjudaPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-50">
            <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
                <button onClick={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="flex-1 text-center text-[18px] font-bold text-gray-900 pr-8">Ajuda e Contato</h1>
            </div>

            <div className="flex-1 flex flex-col p-6">
                <div className="flex flex-col items-center justify-center py-10">
                    <HelpCircle size={64} className="text-gray-200 mb-6" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Central de Ajuda</h2>
                    <p className="text-gray-500 mb-8 text-center max-w-xs">
                        Precisa de suporte? Entre em contato pelos canais abaixo:
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden shadow-sm">
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                            <Phone size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Telefone / WhatsApp</p>
                            <p className="text-sm text-gray-500">0800 123 4567</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                            <Mail size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">E-mail</p>
                            <p className="text-sm text-gray-500">suporte@guincho.pro</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => router.back()}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform mt-auto"
                >
                    Voltar para o Perfil
                </button>
            </div>
        </div>
    );
}
