'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, XCircle, ChevronRight, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClienteHistoricoPage() {
    const { user } = useAuth();
    const supabase = createClient();
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoading(true);

            try {
                const { data, error } = await supabase
                    .from('corridas')
                    .select('*')
                    .eq('cliente_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRides(data || []);
            } catch (err) {
                console.error('Error fetching client history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, supabase]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'finalizada':
                return { label: 'Finalizada', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16} className="text-green-600" /> };
            case 'cancelada':
                return { label: 'Cancelada', color: 'text-red-500', bg: 'bg-red-50', icon: <XCircle size={16} className="text-red-500" /> };
            case 'buscando_motorista':
            case 'aceita':
            case 'a_caminho':
            case 'no_local':
            case 'em_rota_destino':
                return { label: 'Em Andamento', color: 'text-blue-500', bg: 'bg-blue-50', icon: <Clock size={16} className="text-blue-500" /> };
            default:
                return { label: 'Desconhecido', color: 'text-gray-500', bg: 'bg-gray-50', icon: <Clock size={16} className="text-gray-500" /> };
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-[100dvh]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-24">
            <div className="px-6 pt-8 mb-5 bg-white pb-5 border-b border-gray-200">
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">Minhas Corridas</h1>
                <p className="text-[15px] text-gray-500">Confira o histórico dos guinchos solicitados</p>
            </div>

            <div className="px-5 flex-1">
                {rides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                        <Truck size={64} className="text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700">Nenhuma corrida ainda</h3>
                        <p className="text-sm text-gray-500 mt-2">Quando você solicitar um guincho, ele aparecerá aqui.</p>
                    </div>
                ) : (
                    rides.map((item) => {
                        const dateFormatted = format(new Date(item.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
                        const priceFormatted = `R$ ${item.valor?.toFixed(2).replace('.', ',') || '0,00'}`;
                        const statusInfo = getStatusInfo(item.status);

                        return (
                            <button
                                key={item.id}
                                className="w-full bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-500 font-medium">{dateFormatted}</span>
                                    <span className="text-base font-bold text-gray-900">{priceFormatted}</span>
                                </div>

                                <div className="flex mb-4">
                                    <div className="flex flex-col items-center mr-3 mt-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        <div className="w-0.5 h-5 bg-gray-200 my-1" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    </div>
                                    <div className="flex flex-col justify-between flex-1 py-0.5">
                                        <span className="text-sm text-gray-700 truncate block">{item.origem_endereco || "Origem desconhecida"}</span>
                                        <span className="text-sm text-gray-700 truncate block mt-4">{item.destino_endereco || "Destino desconhecido"}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className={`flex items-center px-3 py-1.5 rounded-full ${statusInfo.bg}`}>
                                        {statusInfo.icon}
                                        <span className={`ml-1.5 text-[13px] font-semibold ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300" />
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
