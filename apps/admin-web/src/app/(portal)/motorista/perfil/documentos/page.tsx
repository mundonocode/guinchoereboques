'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Camera, ShieldCheck } from 'lucide-react';

export default function MotoristaDocumentsPage() {
    const router = useRouter();
    const { session, user } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);

    const handleReuploadDocument = async () => {
        const wantsToProceed = window.confirm(
            'Atenção: Reanálise de Perfil\n\nAtualizar a foto do seu documento mudará o status da sua conta para EM ANÁLISE e você não poderá receber corridas temporariamente. Deseja continuar?'
        );

        if (!wantsToProceed) return;

        // Simulando fluxo de escolha de arquivo na web
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            setLoading(true);
            try {
                // Suspende a conta alterando is_active = false
                const { error } = await supabase
                    .from('perfis')
                    .update({
                        is_active: false
                    })
                    .eq('id', user?.id);

                if (error) throw error;

                alert('Sucesso: Documento enviado. Sua conta está em análise novamente pela nossa equipe.');
                router.replace('/motorista/perfil');
            } catch (error) {
                console.error('Error updating document:', error);
                alert('Erro: Houve um problema ao enviar seu documento.');
            } finally {
                setLoading(false);
            }
        };

        input.click();
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[72px] pb-4 bg-white border-b border-gray-100 sticky top-0 z-10 transition-colors">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push('/motorista/perfil')}
                        className="p-2 -ml-2 rounded-full active:bg-gray-100"
                        disabled={loading}
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-[18px] font-bold text-gray-900 ml-2">Documentos Protegidos</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-24">

                {/* Banner de Status Ativo */}
                <div className="flex items-center bg-green-50 p-4 rounded-xl border border-green-200 mb-8 shadow-sm">
                    <ShieldCheck size={28} className="text-green-800 shrink-0 mr-3" />
                    <div>
                        <h2 className="text-[16px] font-bold text-green-800 mb-0.5">Conta Aprovada e Ativa</h2>
                        <p className="text-[13px] text-green-700 leading-snug">
                            Seus documentos atuais já foram validados pela nossa equipe. Qualquer alteração exigirá uma nova avaliação administrativa.
                        </p>
                    </div>
                </div>

                {/* Section: CNH */}
                <h3 className="text-[14px] font-bold text-gray-600 mb-3 px-1">CNH do Motorista</h3>
                <div className="flex items-center bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex-1 mr-4">
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                            Sua Carteira Nacional de Habilitação oficial vinculada ao seu cadastro e liberada.
                        </p>
                    </div>
                    <button
                        onClick={handleReuploadDocument}
                        disabled={loading}
                        className="flex flex-col items-center justify-center py-3 px-4 bg-gray-50 rounded-xl min-w-[90px] active:bg-gray-100 transition-colors border border-gray-100 shrink-0"
                    >
                        <Camera size={20} className="text-gray-900 mb-1" />
                        <span className="text-[12px] font-bold text-gray-900">Trocar Foto</span>
                    </button>
                </div>

                {/* Section: Placa do Caminhão */}
                <h3 className="text-[14px] font-bold text-gray-600 mb-3 px-1">Foto do Caminhão (Placa)</h3>
                <div className="flex items-center bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex-1 mr-4">
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                            Foto traseira mostrando a placa legível do veículo de trabalho principal ou reboque.
                        </p>
                    </div>
                    <button
                        onClick={handleReuploadDocument}
                        disabled={loading}
                        className="flex flex-col items-center justify-center py-3 px-4 bg-gray-50 rounded-xl min-w-[90px] active:bg-gray-100 transition-colors border border-gray-100 shrink-0"
                    >
                        <Camera size={20} className="text-gray-900 mb-1" />
                        <span className="text-[12px] font-bold text-gray-900">Trocar Foto</span>
                    </button>
                </div>

            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-[16px] font-bold text-gray-900">Enviando documento de forma segura...</p>
                </div>
            )}
        </div>
    );
}
