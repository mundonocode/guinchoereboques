'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Car, Truck, Users, UserPlus, Bell, Info, AlertCircle, Activity, CreditCard, XCircle, UserCheck } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SystemAlert {
  title: string;
  desc: string;
  bg: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    faturamento: 'R$ 0,00',
    corridasHoje: '0',
    motoristasOnline: '0',
    novosClientes: '+0'
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // 1. Faturamento Total
        const { data: allFinalizedRides } = await (supabase
          .from('corridas' as any)
          .select('valor') as any)
          .eq('status', 'finalizada');

        const total = allFinalizedRides?.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0) || 0;

        // 2. Corridas Hoje
        const { count: todayRides } = await (supabase
          .from('corridas' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .gte('created_at', todayISO);

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

        // === ALERTAS DINÂMICOS ===
        const alerts: SystemAlert[] = [];

        // A) Corridas canceladas hoje
        const { count: cancelledToday } = await (supabase
          .from('corridas' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .eq('status', 'cancelada')
          .gte('created_at', todayISO);
        if (cancelledToday && cancelledToday > 0) {
          alerts.push({ title: 'Corridas Canceladas Hoje', desc: `${cancelledToday} corrida(s) cancelada(s) hoje`, bg: 'bg-red-100' });
        }

        // B) Pagamentos pendentes/falhos
        const { count: pendingPayments } = await (supabase
          .from('corridas' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .not('asaas_payment_id', 'is', null)
          .not('asaas_payment_status', 'in', '("CONFIRMED","RECEIVED","RECEIVED_IN_CASH")');
        if (pendingPayments && pendingPayments > 0) {
          alerts.push({ title: 'Pagamentos Pendentes', desc: `${pendingPayments} pagamento(s) aguardando confirmação`, bg: 'bg-red-100' });
        }

        // C) Corridas em andamento agora
        const { count: activeRides } = await (supabase
          .from('corridas' as any)
          .select('*', { count: 'exact', head: true }) as any)
          .in('status', ['a_caminho', 'no_local', 'em_andamento', 'buscando_motorista']);
        if (activeRides && activeRides > 0) {
          alerts.push({ title: 'Corridas Ativas Agora', desc: `${activeRides} corrida(s) em andamento`, bg: 'bg-blue-100' });
        }

        // D) Novos clientes hoje
        const { count: newClientsToday } = await supabase
          .from('perfis')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'cliente')
          .gte('created_at', todayISO);
        if (newClientsToday && newClientsToday > 0) {
          alerts.push({ title: 'Novos Clientes Hoje', desc: `${newClientsToday} novo(s) cliente(s) cadastrado(s)`, bg: 'bg-blue-100' });
        }

        // E) Motoristas offline (não online)
        const { count: offlineDrivers } = await supabase
          .from('veiculos_guincho')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'Online');
        if (offlineDrivers && offlineDrivers > 0) {
          alerts.push({ title: 'Guincheiros Offline', desc: `${offlineDrivers} guincheiro(s) offline`, bg: 'bg-amber-100' });
        }

        // F) Motoristas pendentes de aprovação
        const { count: pendingDrivers } = await supabase
          .from('perfis')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'motorista')
          .eq('aprovado', false);
        if (pendingDrivers && pendingDrivers > 0) {
          alerts.push({ title: 'Guincheiros Pendentes', desc: `${pendingDrivers} guincheiro(s) aguardando aprovação`, bg: 'bg-amber-100' });
        }

        if (alerts.length === 0) {
          alerts.push({ title: 'Tudo certo!', desc: 'Nenhum alerta no momento', bg: 'bg-blue-100' });
        }

        setSystemAlerts(alerts);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
        <StatCard title="Guincheiros Online" value={stats.motoristasOnline} icon={Truck} iconColor="#F59E0B" iconBg="bg-amber-50" />
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
                    <th className="pb-4">GUINCHEIRO</th>
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
