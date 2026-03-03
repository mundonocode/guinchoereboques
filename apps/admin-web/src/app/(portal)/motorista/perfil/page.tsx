'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { LogOut, User, Settings, Shield, HelpCircle, ChevronRight, Truck, Star } from 'lucide-react';
import Link from 'next/link';

export default function MotoristaProfilePage() {
    const router = useRouter();
    const { signOut, userRole, user, session } = useAuth();
    const supabase = createClient();

    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('nome_completo')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setNome(data.nome_completo);
                }
            } catch (err) {
                console.error('Error fetching driver profile name', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user, supabase]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const MenuItem = ({ icon: Icon, title, href, isDestructive = false, onClick }: any) => {
        const content = (
            <div className={`flex items-center px-4 py-4 border-b border-gray-50 last:border-b-0 ${isDestructive ? 'active:bg-red-50' : 'active:bg-gray-50'} transition-colors`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-green-50 text-gray-900'}`}>
                    <Icon size={20} className={isDestructive ? 'text-red-500' : 'text-gray-900'} />
                </div>
                <span className={`flex-1 text-[16px] font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
                    {title}
                </span>
                {!isDestructive && <ChevronRight size={20} className="text-gray-300" />}
            </div>
        );

        if (href) {
            return <Link href={href} className="block">{content}</Link>;
        }

        return (
            <button onClick={onClick} className="block w-full text-left">
                {content}
            </button>
        );
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24 overflow-y-auto">
            <div className="px-5 pt-16 pb-10">
                <h1 className="text-[26px] font-bold text-gray-900 mb-6">Meu Perfil Profissional</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                        <Truck size={30} className="text-white" />
                    </div>
                    <div className="flex-1 justify-center">
                        {loading ? (
                            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-1" />
                        ) : (
                            <h2 className="text-[19px] font-bold text-gray-900 mb-0.5">{nome || 'Motorista Parceiro'}</h2>
                        )}
                        <p className="text-[14px] text-gray-500 mb-2 truncate">{user?.email}</p>
                        <div className="bg-green-100 px-2 py-1 rounded inline-flex self-start">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">
                                CONTA {userRole}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Seção de Ferramentas */}
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-500 mb-3 px-1 uppercase tracking-wide">Ferramentas de Trabalho</h3>
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={Truck} title="Meus Veículos" href="/motorista/perfil/veiculos" />
                            <MenuItem icon={Shield} title="Documentos e CNH" href="/motorista/perfil/documentos" />
                            <MenuItem icon={Star} title="Minhas Avaliações" href="/motorista/perfil/avaliacoes" />
                        </div>
                    </div>

                    {/* Seção de Configurações */}
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-500 mb-3 px-1 uppercase tracking-wide">Configurações</h3>
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={User} title="Editar Dados Pessoais" href="/cliente/perfil/editar" />
                            <MenuItem icon={Settings} title="Ajustes do App" onClick={() => alert('Configurações em breve')} />
                        </div>
                    </div>

                    {/* Seção de Suporte */}
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-500 mb-3 px-1 uppercase tracking-wide">Suporte</h3>
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={HelpCircle} title="Central de Ajuda" href="/cliente/perfil/ajuda" />
                            <MenuItem icon={Shield} title="Privacidade e Termos" href="/cliente/perfil/privacidade" />
                            <MenuItem icon={LogOut} title="Desconectar do App" isDestructive={true} onClick={handleSignOut} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
