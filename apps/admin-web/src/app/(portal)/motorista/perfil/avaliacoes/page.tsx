'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Avaliacao {
    id: string;
    nota: number;
    comentario: string | null;
    created_at: string;
    avaliador_nome: string;
}

export default function AvaliacoesPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        const fetchAvaliacoes = async () => {
            setLoading(true);
            try {
                const { data, error } = await (supabase
                    .from('avaliacoes')
                    .select(`
                        id,
                        nota,
                        comentario,
                        created_at,
                        perfis!avaliacoes_avaliador_id_fkey ( nome_completo )
                    `)
                    .eq('avaliado_id', user.id)
                    .order('created_at', { ascending: false }) as any);

                if (error) throw error;

                const mapped = (data || []).map((a: any) => ({
                    id: a.id,
                    nota: a.nota,
                    comentario: a.comentario,
                    created_at: a.created_at,
                    avaliador_nome: a.perfis?.nome_completo || 'Cliente'
                }));

                setAvaliacoes(mapped);
                if (mapped.length > 0) {
                    const avg = mapped.reduce((sum: number, a: Avaliacao) => sum + a.nota, 0) / mapped.length;
                    setMedia(avg);
                }
            } catch (err) {
                console.error('Error fetching ratings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvaliacoes();
    }, [user]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderStars = (nota: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    size={14}
                    className={s <= nota ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24 overflow-y-auto">
            <div className="px-5 pt-16 pb-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/motorista/perfil"
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </Link>
                    <h1 className="text-[24px] font-bold text-gray-900">Minhas Avaliações</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Summary Card */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center mb-6">
                            <div className="flex-1 text-center">
                                <p className="text-[42px] font-extrabold text-gray-900 leading-tight">{media.toFixed(1)}</p>
                                <div className="flex justify-center mt-1">{renderStars(Math.round(media))}</div>
                            </div>
                            <div className="w-px h-16 bg-gray-200 mx-6" />
                            <div className="flex-1 text-center">
                                <p className="text-[32px] font-extrabold text-gray-900 leading-tight">{avaliacoes.length}</p>
                                <p className="text-[13px] text-gray-500 mt-1">avaliações recebidas</p>
                            </div>
                        </div>

                        {/* List */}
                        {avaliacoes.length === 0 ? (
                            <div className="text-center py-16">
                                <Star size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma avaliação ainda</h3>
                                <p className="text-sm text-gray-400">Suas avaliações de clientes aparecerão aqui após as corridas.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {avaliacoes.map(a => (
                                    <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                        <div className="flex items-center">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mr-3 shrink-0">
                                                <span className="text-sm font-bold text-blue-700">{a.avaliador_nome.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{a.avaliador_nome}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(a.created_at)}</p>
                                            </div>
                                            {renderStars(a.nota)}
                                        </div>
                                        {a.comentario && (
                                            <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-start gap-2">
                                                <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                <p className="text-[13px] text-gray-600 leading-relaxed">{a.comentario}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
