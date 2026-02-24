'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { format, startOfDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wallet, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function CarteiraPage() {
    const { user } = useAuth();
    const supabase = createClient();

    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dailyEarnings, setDailyEarnings] = useState(0);
    const [weeklyEarnings, setWeeklyEarnings] = useState(0);

    useEffect(() => {
        const fetchEarningsAndHistory = async () => {
            if (!user?.id) return;
            setLoading(true);

            try {
                const { data, error } = await supabase
                    .from('corridas')
                    .select('*')
                    .eq('motorista_id', user.id)
                    .eq('status', 'finalizada')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setRides(data || []);

                const now = new Date();
                const todayStart = startOfDay(now);
                const weekStart = startOfWeek(now, { weekStartsOn: 1 });

                let sumToday = 0;
                let sumWeek = 0;

                data?.forEach(ride => {
                    const rideDate = new Date(ride.created_at);
                    const value = ride.valor || 0;

                    if (rideDate >= weekStart) sumWeek += value;
                    if (rideDate >= todayStart) sumToday += value;
                });

                setDailyEarnings(sumToday);
                setWeeklyEarnings(sumWeek);
            } catch (err) {
                console.error('Error fetching earnings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsAndHistory();
    }, [user, supabase]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center h-[100dvh] bg-gray-50 pb-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-500 font-medium">Calculando seus ganhos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24 overflow-y-auto">
            {/* Header */}
            <div className="pt-16 px-6 pb-6 bg-white border-b border-gray-100">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sua Carteira</h1>
                <p className="text-[15px] text-gray-500 mt-1 font-medium">Acompanhe seu desempenho na plataforma</p>
            </div>

            {/* Métricas */}
            <div className="flex gap-4 p-5">
                <div className="flex-1 bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="w-12 h-12 rounded-[14px] bg-sky-50 flex items-center justify-center mb-4 text-sky-600">
                        <Wallet size={24} />
                    </div>
                    <p className="text-sm text-gray-500 font-bold mb-1">Hoje</p>
                    <p className="text-[26px] font-black text-gray-900 tracking-tight">
                        R$ {dailyEarnings.toFixed(2).replace('.', ',')}
                    </p>
                </div>

                <div className="flex-1 bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="w-12 h-12 rounded-[14px] bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-sm text-gray-500 font-bold mb-1">Esta Semana</p>
                    <p className="text-[26px] font-black text-gray-900 tracking-tight">
                        R$ {weeklyEarnings.toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>

            {/* Histórico Header */}
            <div className="flex justify-between items-center px-6 mb-4 mt-2">
                <h2 className="text-[19px] font-black text-gray-900 tracking-tight">Histórico de Corridas</h2>
                <span className="text-sm text-gray-500 font-bold">{rides.length} finalizadas</span>
            </div>

            {/* Listagem */}
            <div className="px-5 space-y-3">
                {rides.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <DollarSign size={40} />
                        </div>
                        <p className="text-[17px] font-bold text-gray-700">Nenhum ganho registrado.</p>
                        <p className="text-[15px] text-gray-400 mt-1 max-w-[250px] text-center font-medium">Conecte-se e aceite chamados para começar a lucrar.</p>
                    </div>
                ) : (
                    rides.map((item) => (
                        <div key={item.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                            {/* Header do Card */}
                            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-50">
                                <div className="flex items-center text-gray-500">
                                    <Calendar size={16} />
                                    <span className="ml-2 text-[15px] font-bold">
                                        {format(new Date(item.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                <span className="text-[17px] font-black text-emerald-600">
                                    R$ {item.valor.toFixed(2).replace('.', ',')}
                                </span>
                            </div>

                            {/* Addresses Timeline */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 z-10" />
                                    <div className="w-[2px] h-8 bg-gray-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 z-10" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5 space-y-3">
                                    <p className="text-[15px] text-gray-900 leading-tight line-clamp-1 font-medium">
                                        <span className="text-gray-500 font-bold mr-1">Origem:</span>
                                        {item.origem_endereco || item.endereco_origem || 'Endereço não disponível'}
                                    </p>
                                    <p className="text-[15px] text-gray-900 leading-tight line-clamp-1 font-medium">
                                        <span className="text-gray-500 font-bold mr-1">Destino:</span>
                                        {item.destino_endereco || item.endereco_destino || 'Endereço não disponível'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
