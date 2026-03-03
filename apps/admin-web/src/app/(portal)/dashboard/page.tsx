'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Car, Truck, Users, UserPlus, Bell, Info, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    faturamento: 'R$ 0,00',
    corridasHoje: '0',
    motoristasOnline: '0',
    novosClientes: '+0'
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Faturamento Total
        const { data: allFinalizedRides } = await (supabase
          .from('corridas' as any)
          .select('valor') as any)
          .eq('status', 'finalizada');

        const total = allFinalizedRides?.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0) || 0;

        // 2. Corridas Hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayRides } = await (supabase
          .from('corridas' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .gte('created_at', today.toISOString());

        // 3. Motoristas Online
        const { count: onlineDrivers } = await supabase
          .from('veiculos_guincho')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Online');

        // 4. Novos Clientes (total clientes for now)
        const { count: clientCount } = await supabase
          .from('perfis')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'cliente');

        // 5. Recent Requests
        const { data: requests } = await (supabase
          .from('corridas' as any)
          .select(`
            id, 
            status, 
            valor, 
            cliente:perfis!corridas_cliente_id_fkey(nome_completo), 
            motorista:perfis!corridas_motorista_id_fkey(nome_completo)
          `) as any)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          faturamento: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
          corridasHoje: String(todayRides || 0),
          motoristasOnline: String(onlineDrivers || 0),
          novosClientes: `+${clientCount || 0}`
        });

        setRecentRequests(requests?.map((r: any) => {
          const rawStatus = (r.status || 'pendente').toLowerCase();
          let formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
          if (rawStatus === 'a_caminho') formattedStatus = 'A Caminho';
          if (rawStatus === 'no_local') formattedStatus = 'No Local';

          return {
            id: `#${r.id.slice(0, 4)}`,
            client: r.cliente?.nome_completo || 'N/A',
            driver: r.motorista?.nome_completo || 'N/A',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.valor || 0),
            status: formattedStatus,
            rawStatus: rawStatus
          };
        }) || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const systemAlerts = [
    { title: 'Documento Pendente', desc: 'Motorista Marcos P. enviou CNH', icon: Info, color: '#F59E0B', bg: 'bg-amber-100' },
    { title: 'Novo Cadastro', desc: 'Guincho S.A solicitou parceria', icon: UserPlus, color: '#3B82F6', bg: 'bg-blue-100' },
    { title: 'Reclamação', desc: 'Cliente #829 reportou atraso', icon: AlertCircle, color: '#EF4444', bg: 'bg-red-100' },
  ];

  return (
    <div className="p-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Total" value={stats.faturamento} icon={DollarSign} iconColor="#10B981" iconBg="bg-emerald-50" />
        <StatCard title="Corridas Hoje" value={stats.corridasHoje} icon={Car} iconColor="#3B82F6" iconBg="bg-blue-50" />
        <StatCard title="Motoristas Online" value={stats.motoristasOnline} icon={Truck} iconColor="#F59E0B" iconBg="bg-amber-50" />
        <StatCard title="Novos Clientes" value={stats.novosClientes} icon={Users} iconColor="#8B5CF6" iconBg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-soft p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Solicitações Recentes</h2>
            <button className="text-muted hover:text-black text-sm font-medium transition-colors">Ver Tudo</button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-muted">Carregando...</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border pb-4">
                    <th className="pb-4">ID</th>
                    <th className="pb-4">CLIENTE</th>
                    <th className="pb-4">MOTORISTA</th>
                    <th className="pb-4">VALOR</th>
                    <th className="pb-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentRequests.map((req, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-medium text-muted">{req.id}</td>
                      <td className="py-4 text-sm font-bold">{req.client}</td>
                      <td className="py-4 text-sm font-medium text-muted">{req.driver}</td>
                      <td className="py-4 text-sm font-bold">{req.value}</td>
                      <td className="py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap",
                          req.rawStatus === 'pendente' && "bg-amber-50 text-amber-600",
                          req.rawStatus === 'aceita' && "bg-blue-50 text-blue-600",
                          req.rawStatus === 'a_caminho' && "bg-indigo-50 text-indigo-600",
                          req.rawStatus === 'no_local' && "bg-purple-50 text-purple-600",
                          req.rawStatus === 'iniciada' && "bg-cyan-50 text-cyan-600",
                          (req.rawStatus === 'finalizada' || req.rawStatus === 'concluida') && "bg-emerald-50 text-emerald-600",
                          req.rawStatus === 'cancelada' && "bg-red-50 text-red-600",
                          !['pendente', 'aceita', 'a_caminho', 'no_local', 'iniciada', 'finalizada', 'concluida', 'cancelada'].includes(req.rawStatus) && "bg-gray-50 text-gray-600"
                        )}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-soft p-8">
          <h2 className="text-xl font-bold mb-8">Alertas do Sistema</h2>
          <div className="space-y-6">
            {systemAlerts.map((alert, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:border-border transition-colors group cursor-pointer">
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", alert.bg === 'bg-amber-100' ? 'bg-amber-500' : alert.bg === 'bg-blue-100' ? 'bg-blue-500' : 'bg-red-500')} />
                <div>
                  <h4 className="text-sm font-bold mb-1">{alert.title}</h4>
                  <p className="text-xs text-muted font-medium">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
