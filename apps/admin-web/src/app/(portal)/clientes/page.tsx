'use client';

import React, { useEffect, useState } from 'react';
import { Search, History, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ClientesPage() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClientes() {
            setLoading(true);
            try {
                // Fetch profiles with their requests to calculate stats
                const { data, error } = await supabase
                    .from('perfis')
                    .select(`
                        id,
                        nome_completo,
                        foto_url,
                        telefone,
                        created_at,
                        solicitacoes!solicitacoes_cliente_id_fkey (
                            id,
                            preco_estimado,
                            created_at
                        )
                    `)
                    .eq('role', 'cliente');

                if (error) throw error;

                setClientes(data.map(c => {
                    const sortedRequests = [...c.solicitacoes].sort((a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    const lastRequest = sortedRequests.length > 0
                        ? new Date(sortedRequests[0].created_at).toLocaleDateString('pt-BR')
                        : 'Nunca';

                    const totalSpent = c.solicitacoes.reduce((acc: number, curr: any) => acc + (curr.preco_estimado || 0), 0);

                    return {
                        name: c.nome_completo,
                        email: c.telefone || 'Sem Telefone', // Using telefone as email is missing in profiles
                        phone: c.telefone || 'N/A',
                        totalSpent: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent),
                        lastRequest: lastRequest,
                        avatar: c.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome_completo)}&background=random`
                    };
                }));
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchClientes();
    }, []);

    return (
        <div className="p-10 space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
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
                    <h2 className="text-xl font-bold">Gestão de Clientes</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-10 text-center text-muted">Carregando clientes...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border">
                                    <th className="pb-4">CLIENTE</th>
                                    <th className="pb-4">CONTATO</th>
                                    <th className="pb-4">TOTAL GASTO</th>
                                    <th className="pb-4">ÚLTIMA SOLICITAÇÃO</th>
                                    <th className="pb-4 text-right">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {clientes.map((client, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <img src={client.avatar} className="w-10 h-10 rounded-full border border-border" alt={client.name} />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{client.name}</span>
                                                    <span className="text-[11px] text-muted font-medium">{client.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{client.phone}</span>
                                                <span className="text-[11px] text-muted font-medium italic">{client.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-sm font-bold">{client.totalSpent}</td>
                                        <td className="py-6 text-sm font-medium text-muted">{client.lastRequest}</td>
                                        <td className="py-6 text-right">
                                            <button className="p-2 text-muted hover:text-black transition-colors rounded-lg hover:bg-gray-100" title="Ver Histórico">
                                                <History size={18} />
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
