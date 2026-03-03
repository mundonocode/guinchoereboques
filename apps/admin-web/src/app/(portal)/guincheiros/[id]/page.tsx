'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    ArrowLeft, User, Truck, Star, MapPin, Phone, Mail, Shield, Calendar,
    FileText, CheckCircle2, XCircle, Clock, DollarSign, MessageSquare, Activity
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type TabKey = 'geral' | 'veiculo' | 'avaliacoes' | 'corridas';

export default function GuincheiroDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [activeTab, setActiveTab] = useState<TabKey>('geral');
    const [perfil, setPerfil] = useState<any>(null);
    const [veiculo, setVeiculo] = useState<any>(null);
    const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
    const [corridas, setCorridas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Perfil
            const { data: p } = await supabase
                .from('perfis')
                .select('*')
                .eq('id', id)
                .single();
            setPerfil(p);

            // Veículo
            const { data: v } = await supabase
                .from('veiculos_guincho')
                .select('*')
                .eq('perfil_id', id)
                .limit(1)
                .single();
            setVeiculo(v);

            // Avaliações
            const { data: a } = await (supabase
                .from('avaliacoes')
                .select(`*, perfis!avaliacoes_avaliador_id_fkey ( nome_completo )`)
                .eq('avaliado_id', id)
                .order('created_at', { ascending: false })
                .limit(50) as any);
            setAvaliacoes(a || []);

            // Corridas
            const { data: c } = await (supabase
                .from('corridas' as any)
                .select('*')
                .eq('motorista_id', id)
                .order('created_at', { ascending: false })
                .limit(50) as any);
            setCorridas(c || []);
        } catch (err) {
            console.error('Error loading driver detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const mediaAvaliacoes = avaliacoes.length > 0
        ? (avaliacoes.reduce((s: number, a: any) => s + a.nota, 0) / avaliacoes.length)
        : 0;

    const totalFaturado = corridas
        .filter((c: any) => c.status === 'finalizada')
        .reduce((s: number, c: any) => s + (c.valor_final || c.valor || 0), 0);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderStars = (nota: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} className={s <= nota ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
            ))}
        </div>
    );

    const statusColor = (status: string) => {
        const map: Record<string, string> = {
            finalizada: 'bg-emerald-50 text-emerald-700',
            cancelada: 'bg-red-50 text-red-600',
            a_caminho: 'bg-blue-50 text-blue-600',
            em_andamento: 'bg-blue-50 text-blue-600',
            buscando_motorista: 'bg-amber-50 text-amber-600',
            aceita: 'bg-sky-50 text-sky-600',
            pendente_pagamento: 'bg-orange-50 text-orange-600',
        };
        return map[status] || 'bg-gray-100 text-gray-600';
    };

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'geral', label: 'Visão Geral', icon: User },
        { key: 'veiculo', label: 'Veículo', icon: Truck },
        { key: 'avaliacoes', label: 'Avaliações', icon: Star },
        { key: 'corridas', label: 'Corridas', icon: Activity },
    ];

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="p-10 text-center">
                <p className="text-muted">Guincheiro não encontrado.</p>
                <button onClick={() => router.back()} className="mt-4 text-sm font-bold text-blue-600 hover:underline">Voltar</button>
            </div>
        );
    }

    return (
        <div className="p-10 space-y-8">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{perfil.nome_completo}</h1>
                    <p className="text-sm text-muted">ID: {perfil.id?.slice(0, 8)}...</p>
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Nota Média</p>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-extrabold">{mediaAvaliacoes.toFixed(1)}</span>
                        {renderStars(Math.round(mediaAvaliacoes))}
                    </div>
                    <p className="text-xs text-muted mt-1">{avaliacoes.length} avaliação(ões)</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Total Corridas</p>
                    <span className="text-3xl font-extrabold">{corridas.length}</span>
                    <p className="text-xs text-muted mt-1">{corridas.filter((c: any) => c.status === 'finalizada').length} finalizadas</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Faturamento</p>
                    <span className="text-3xl font-extrabold">{formatCurrency(totalFaturado)}</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={cn("w-3 h-3 rounded-full", perfil.is_online ? "bg-emerald-500" : "bg-gray-400")} />
                        <span className="text-lg font-bold">{perfil.is_online ? 'Online' : 'Offline'}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">Asaas: {perfil.asaas_status || 'N/A'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-0 border-b border-gray-100">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors relative",
                                activeTab === tab.key ? "text-black" : "text-muted hover:text-black"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* TAB: Visão Geral */}
                    {activeTab === 'geral' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Dados Pessoais</h3>
                                <InfoRow icon={User} label="Nome Completo" value={perfil.nome_completo} />
                                <InfoRow icon={Mail} label="E-mail" value={perfil.id} />
                                <InfoRow icon={Phone} label="Telefone" value={perfil.telefone || 'Não informado'} />
                                <InfoRow icon={FileText} label="CPF" value={perfil.cpf || 'Não informado'} />
                                <InfoRow icon={Calendar} label="Data Nascimento" value={perfil.data_nascimento ? formatDate(perfil.data_nascimento) : 'N/A'} />
                                <InfoRow icon={MapPin} label="Endereço" value={perfil.endereco_completo || 'Não informado'} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Informações do Sistema</h3>
                                <InfoRow icon={Calendar} label="Cadastrado em" value={formatDate(perfil.created_at)} />
                                <InfoRow icon={Shield} label="Onboarding" value={perfil.onboarding_completo ? 'Completo' : 'Incompleto'} />
                                <InfoRow icon={Shield} label="CNH com EAR" value={perfil.cnh_com_ear ? 'Sim' : 'Não'} />
                                <InfoRow icon={CheckCircle2} label="Verificação" value={perfil.status_verificacao || 'Pendente'} />
                                <InfoRow icon={DollarSign} label="Conta Asaas" value={perfil.possui_conta_asaas ? `Ativa (${perfil.asaas_status || ''})` : 'Não possui'} />
                                <InfoRow icon={User} label="Tipo Pessoa" value={perfil.tipo_pessoa || 'N/A'} />
                            </div>
                        </div>
                    )}

                    {/* TAB: Veículo */}
                    {activeTab === 'veiculo' && (
                        <div>
                            {veiculo ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Dados do Veículo</h3>
                                        <InfoRow icon={Truck} label="Marca/Modelo" value={veiculo.marca_modelo || 'N/A'} />
                                        <InfoRow icon={FileText} label="Placa" value={veiculo.placa} />
                                        <InfoRow icon={FileText} label="Tipo" value={veiculo.tipo} />
                                        <InfoRow icon={Calendar} label="Ano" value={veiculo.ano?.toString() || 'N/A'} />
                                        <InfoRow icon={Activity} label="Capacidade (kg)" value={veiculo.capacidade_peso_kg?.toString() || 'N/A'} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Status & Documentos</h3>
                                        <InfoRow icon={Shield} label="Status" value={veiculo.status || 'Indefinido'} />
                                        {veiculo.documento_url && (
                                            <a href={veiculo.documento_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline">
                                                <FileText size={16} />
                                                Ver Documento do Veículo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Truck size={48} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-muted text-sm">Nenhum veículo cadastrado para este guincheiro.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Avaliações */}
                    {activeTab === 'avaliacoes' && (
                        <div>
                            {avaliacoes.length > 0 ? (
                                <div className="space-y-3">
                                    {avaliacoes.map((a: any) => (
                                        <div key={a.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-4">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-blue-700">
                                                    {(a.perfis?.nome_completo || 'C').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-gray-800">{a.perfis?.nome_completo || 'Cliente'}</span>
                                                    {renderStars(a.nota)}
                                                </div>
                                                <p className="text-[11px] text-muted">{formatDate(a.created_at)}</p>
                                                {a.comentario && (
                                                    <div className="mt-2 flex items-start gap-2 bg-white rounded-lg p-3">
                                                        <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                        <p className="text-[13px] text-gray-600 leading-relaxed">{a.comentario}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Star size={48} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-muted text-sm">Nenhuma avaliação recebida ainda.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Corridas */}
                    {activeTab === 'corridas' && (
                        <div className="overflow-x-auto">
                            {corridas.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-3">DATA</th>
                                            <th className="pb-3">ORIGEM</th>
                                            <th className="pb-3">DESTINO</th>
                                            <th className="pb-3 text-center">VALOR</th>
                                            <th className="pb-3 text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {corridas.map((c: any) => (
                                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 text-muted font-medium">{formatDate(c.created_at)}</td>
                                                <td className="py-4 max-w-[200px] truncate text-gray-700">{c.origem_endereco || '—'}</td>
                                                <td className="py-4 max-w-[200px] truncate text-gray-700">{c.destino_endereco || '—'}</td>
                                                <td className="py-4 text-center font-bold">{formatCurrency(c.valor_final || c.valor || 0)}</td>
                                                <td className="py-4 text-center">
                                                    <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full", statusColor(c.status))}>
                                                        {c.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12">
                                    <Activity size={48} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-muted text-sm">Nenhuma corrida registrada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-gray-500" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}
