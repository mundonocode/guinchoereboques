'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Briefcase, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

export default function RegisterPage() {
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'cliente' | 'motorista'>('cliente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!nomeCompleto || !email || !password) {
            setError('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nome_completo: nomeCompleto,
                        role: role,
                    },
                },
            });

            if (authError) throw authError;

            if (data.user) {
                // Insert into perfis table
                const { error: profileError } = await supabase.from('perfis').insert({
                    id: data.user.id,
                    nome_completo: nomeCompleto,
                    role: role,
                });

                if (profileError && profileError.code !== '23505') {
                    console.error('Error creating profile:', profileError);
                }

                setSuccess(true);
                // Redirect user after a short delay or based on role
                setTimeout(() => {
                    router.push(role === 'motorista' ? '/motorista' : '/cliente');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Erro ao realizar cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-amber-500 selection:text-black">
            {/* Left Side: Visual/Branding (Mirroring Login) */}
            <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-[-10%] -left-[10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] -right-[10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-xl text-center">
                    <div className="flex justify-center mb-10">
                        <img src="/logo-oficial.png.png" alt="Guinchos e Reboques" className="w-[200px] h-auto object-contain" />
                    </div>
                    <h2 className="text-[46px] font-poppins font-medium mb-8 leading-[1.1] tracking-tight text-white">
                        Junte-se à maior rede de <span className="font-bold text-amber-500">socorro veicular.</span>
                    </h2>
                    <p className="text-[17px] text-white/60 font-medium leading-relaxed max-w-lg mx-auto">
                        Crie sua conta agora e tenha acesso imediato aos melhores prestadores ou novos chamados em sua região.
                    </p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                <div className="max-w-[440px] w-full space-y-8">
                    <div className="space-y-3">
                        <Link href="/login" className="inline-flex items-center gap-2 text-[13px] font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-wider mb-4">
                            <ArrowLeft size={16} /> Voltar para login
                        </Link>
                        <h3 className="text-[32px] font-poppins font-bold tracking-tight text-black leading-tight">Criar nova conta</h3>
                        <p className="text-[15px] text-zinc-500 font-medium">Preencha os campos abaixo para começar.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-[13px] text-red-600 font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-[13px] text-green-600 font-bold leading-tight">Conta criada com sucesso! Redirecionando...</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-black flex items-center gap-2 uppercase tracking-wide" htmlFor="nome">
                                    <User size={14} className="text-zinc-400" /> Nome Completo
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Como quer ser chamado?"
                                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-medium text-[15px]"
                                    value={nomeCompleto}
                                    onChange={(e) => setNomeCompleto(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-black flex items-center gap-2 uppercase tracking-wide" htmlFor="email">
                                    <Mail size={14} className="text-zinc-400" /> E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@gmail.com"
                                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-medium text-[15px]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-black flex items-center gap-2 uppercase tracking-wide" htmlFor="password">
                                    <Lock size={14} className="text-zinc-400" /> Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-medium text-[15px]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Role Selection (Mobile Style) */}
                            <div className="space-y-3 pt-2">
                                <label className="text-[13px] font-bold text-black uppercase tracking-wide">Escolha seu perfil</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('cliente')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${role === 'cliente'
                                                ? 'bg-black border-black text-white'
                                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300'
                                            }`}
                                    >
                                        <User size={24} />
                                        <span className="text-[13px] font-bold">SOU CLIENTE</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('motorista')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${role === 'motorista'
                                                ? 'bg-black border-black text-white'
                                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300'
                                            }`}
                                    >
                                        <Briefcase size={24} />
                                        <span className="text-[13px] font-bold">SOU GUINCHEIRO</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 pr-5 pl-7 rounded-md font-black text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-black/10"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Criar minha conta
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-[14px] text-zinc-500 font-medium">
                            Já tem uma conta? <Link href="/login" className="text-black font-bold hover:underline">Entrar aqui</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
