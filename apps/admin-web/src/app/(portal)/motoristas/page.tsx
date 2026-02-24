'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Star, Settings, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function MotoristasPage() {
    const [motoristas, setMotoristas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMotoristas() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select(`
                        id,
                        nome_completo,
                        foto_url,
                        veiculos_guincho (
                            marca_modelo,
                            placa,
                            status,
                            documento_url
                        )
                    `)
                    .eq('role', 'motorista');

                if (error) throw error;

                // For now, let's fetch ratings separately or use a default
                // Calculating average rating would require another query to 'avaliacoes'

                setMotoristas(data.map(m => ({
                    name: m.nome_completo,
                    vehicle: m.veiculos_guincho ? `${(m.veiculos_guincho as any).marca_modelo} (${(m.veiculos_guincho as any).placa})` : 'Sem Veículo',
                    doc: (m.veiculos_guincho as any)?.documento_url ? 'Aprovado' : 'Pendente',
                    rating: 5.0, // Placeholder for now
                    status: (m.veiculos_guincho as any)?.status || 'Offline',
                    avatar: m.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nome_completo)}&background=random`
                })));
            } catch (error) {
                console.error('Error fetching drivers:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMotoristas();
    }, []);

    return (
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Motoristas</h1>
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

            <div className="bg-card rounded-xl border border-border shadow-soft p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Gestão de Motoristas</h2>
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar motorista..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
                            />
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                            <Plus size={18} />
                            Adicionar Novo
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-10 text-center text-muted text-sm font-medium">Carregando motoristas...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
                                    <th className="pb-4">MOTORISTA</th>
                                    <th className="pb-4">VEÍCULO</th>
                                    <th className="pb-4">DOCUMENTAÇÃO</th>
                                    <th className="pb-4 text-center">AVALIAÇÃO</th>
                                    <th className="pb-4">STATUS</th>
                                    <th className="pb-4 text-right">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {motoristas.map((driver, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <img src={driver.avatar} className="w-10 h-10 rounded-full border border-border" alt={driver.name} />
                                                <span className="text-sm font-bold text-gray-900">{driver.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-sm font-medium text-muted">{driver.vehicle}</td>
                                        <td className="py-6">
                                            <span className={cn(
                                                "text-[10px] font-bold px-3 py-1 rounded-full",
                                                driver.doc === 'Aprovado' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {driver.doc}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center justify-center gap-1">
                                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                                <span className="text-sm font-bold">{driver.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", driver.status === 'Online' ? "bg-emerald-500" : "bg-gray-400")} />
                                                <span className="text-sm font-medium text-muted">{driver.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right">
                                            <button className="p-2 text-muted hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                                                <Settings size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
