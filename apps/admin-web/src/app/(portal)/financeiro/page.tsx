'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function FinanceiroPage() {
    const [stats, setStats] = useState({
        volumeBruto: 'R$ 0,00',
        comissao: 'R$ 0,00',
        pendentes: 'R$ 0,00'
    });
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFinanceData() {
            setLoading(true);
            try {
                const { data: rides, error } = await (supabase
                    .from('corridas' as any)
                    .select(`
                        id,
                        valor,
                        status,
                        created_at,
                        cliente:perfis!corridas_cliente_id_fkey (nome_completo),
                        motorista:perfis!corridas_motorista_id_fkey (nome_completo)
                    `) as any)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const finalizedRides = (rides as any[])?.filter(r => r.status === 'finalizada') || [];
                const bruto = finalizedRides.reduce((acc, r) => acc + (r.valor || 0), 0);
                const comissaoTotal = bruto * 0.20; // 20% platform fee
                const pendentes = (rides as any[])?.filter(r => r.status !== 'finalizada' && r.status !== 'cancelada')
                    .reduce((acc, r) => acc + (r.valor || 0), 0);

                setStats({
                    volumeBruto: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bruto),
                    comissao: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoTotal),
                    pendentes: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendentes)
                });

                // Flatten transactions for display
                const flatTrans = (rides as any[])?.slice(0, 10).map(r => ({
                    type: 'Corrida #' + r.id.slice(0, 4),
                    user: r.cliente?.nome_completo || 'N/A',
                    amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.valor || 0),
                    status: (r.status || 'PENDENTE').toUpperCase(),
                    positive: true,
                    icon: ArrowUpRight
                }));

                setTransacoes(flatTrans);

            } catch (error) {
                console.error('Error fetching finance data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFinanceData();
    }, []);

    return (
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-muted hover:text-black transition-colors">
                        <Bell size={24} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-border overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black text-white p-8 rounded-[2rem] shadow-soft min-h-[180px] flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">VOLUME BRUTO TOTAL</p>
                        <h3 className="text-3xl font-bold tracking-tight">{stats.volumeBruto}</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-border shadow-soft min-h-[180px] flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">COMISSÃO PLATAFORMA</p>
                        <h3 className="text-3xl font-bold tracking-tight">{stats.comissao}</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-black h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-border shadow-soft min-h-[180px] flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">PAGAMENTOS PENDENTES</p>
                        <h3 className="text-3xl font-bold tracking-tight">{stats.pendentes}</h3>
                    </div>
                    <button className="text-left text-xs font-bold underline decoration-2 hover:text-muted transition-colors font-sans">
                        Processar Repasses
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-border shadow-soft p-10">
                <h2 className="text-xl font-bold mb-10">Histórico de Transações</h2>
                <div className="space-y-8">
                    {loading ? (
                        <div className="text-center py-10 text-muted">Carregando transações...</div>
                    ) : (
                        transacoes.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                                        t.positive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"
                                    )}>
                                        <t.icon size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{t.type}</h4>
                                        <p className="text-[11px] text-muted font-medium">{t.user}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn("text-sm font-bold transition-transform group-hover:translate-x-[-4px]", t.positive ? "text-emerald-600" : "text-gray-900")}>
                                        {t.amount}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{t.status}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
