'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Accordion } from '@/components/landing/Accordion';
import { Check, ArrowRight, Car, CreditCard, MapPin, ShieldCheck, MousePointerClick } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    // Parallax effect settings: circle moves down faster, image moves down slower
    const circleY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const imageY = useTransform(scrollYProgress, [0, 1], [0, 50]);

    const faqs = [
        {
            title: "O serviço está disponível na minha cidade?",
            content: "Atualmente operamos nas principais capitais e rodovias do Brasil, com expansão contínua para novas regiões todos os meses. Basta abrir o aplicativo para verificar a cobertura instantânea."
        },
        {
            title: "Como funciona o pagamento pelo aplicativo?",
            content: "Aceitamos todos os cartões de crédito, Pix e carteiras digitais. O valor é transparente e travado no momento da solicitação, sendo descontado apenas quando o serviço é efetivamente iniciado/concluído."
        },
        {
            title: "E se o meu carro for blindado ou rebaixado?",
            content: "Não tem problema! Em nosso sistema você detalha as especificações do seu veículo (como blindagem, se está rebaixado ou longo demais). Enviaremos exatamente o guincho adequado para essa necessidade (prancha, asa delta, plataforma longa, etc)."
        },
        {
            title: "Quanto tempo demora para o guincho chegar?",
            content: "O tempo de chegada varia conforme a distância do prestador validado, mas nosso sistema garante a oferta apenas aos que estão num raio otimizado para que a espera não passe de 25 a 40 minutos em áreas urbanas."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-black">
            <LandingHeader />

            <main>
                {/* HERO SECTION */}
                <section ref={heroRef} className="relative pt-24 pb-32 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden">
                    <div className="max-w-[75rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 relative z-10 w-full max-w-[500px] mx-auto lg:mx-0">
                            {/* Top Badge */}
                            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 mb-2 shadow-sm w-fit">
                                <span className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-full text-sm font-bold">
                                    Guinchos e Reboques
                                </span>
                                <span className="px-4 py-1.5 text-black text-[13px] font-semibold flex items-center gap-2">
                                    Para Usuários
                                    <ArrowRight size={16} className="text-gray-400" />
                                </span>
                            </div>

                            <h1 className="text-[40px] md:text-[46px] font-poppins font-medium text-black leading-[1.1] tracking-tight">
                                O app que encontra seu guincho mais próximo <span className="font-bold">em instantes.</span>
                            </h1>

                            <p className="text-[15px] text-zinc-500 font-medium leading-relaxed mb-6">
                                Localize o socorro ideal para qualquer problema do seu veículo
                                em apenas alguns minutos e na palma da sua mão.
                            </p>

                            <div className="pt-2">
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-6 py-3 flex items-center justify-center gap-3 w-full sm:w-[190px]">
                                        <img src="/apple-icon.png" className="w-[18px] object-contain" alt="Apple" />
                                        <div className="flex flex-col items-start leading-[1.1]">
                                            <span className="text-[9px] text-zinc-300 font-medium tracking-widest mb-0.5">Download on the</span>
                                            <span className="font-bold text-[13px]">APPLE STORE</span>
                                        </div>
                                    </button>
                                    <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-6 py-3 flex items-center justify-center gap-3 w-full sm:w-[190px]">
                                        <img src="/google-play-icon.png" className="w-[18px] object-contain" alt="Google Play" />
                                        <div className="flex flex-col items-start leading-[1.1]">
                                            <span className="text-[9px] text-zinc-300 font-medium tracking-widest mb-0.5">Download on the</span>
                                            <span className="font-bold text-[13px]">Google Play</span>
                                        </div>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 mt-6">
                                    <span className="flex text-zinc-400 shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    </span>
                                    <span>Mais de 20.000 Downloads este mês</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
                            {/* The Yellow Circle */}
                            <motion.div
                                style={{ y: circleY, x: '-50%' }}
                                className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[480px] md:h-[480px] bg-amber-400 rounded-full z-0"
                            ></motion.div>

                            {/* The Phones Container with Parallax and nested Float */}
                            <motion.div
                                style={{ y: imageY }}
                                className="relative z-10 w-full max-w-[420px] flex justify-center"
                            >
                                <motion.img
                                    src="/phones-app.png"
                                    alt="Celular com app de guinchos"
                                    animate={{ y: [0, -18, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* WHY CHOOSE US GRID */}
                <section className="py-24 px-6 md:px-12 bg-[#F8F9FA]">
                    <div className="max-w-[75rem] mx-auto">
                        <div className="text-center mb-16 max-w-4xl mx-auto">
                            <h2 className="text-[36px] font-poppins font-medium text-black leading-tight mb-4">
                                Por que manter o Guinchos e Reboques sempre à mão?
                            </h2>
                            <p className="text-[15px] font-medium text-zinc-600 max-w-2xl mx-auto">
                                Acesso aos melhores profissionais da sua região em segundos — compare preços,
                                tempo de chegada e avaliações para escolher exatamente o que precisa.
                            </p>
                        </div>

                        {/* Top Large Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] overflow-hidden mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 min-h-[460px]">
                            <div className="p-10 md:p-14 flex flex-col justify-center order-2 md:order-1">
                                <div className="flex items-center gap-3 text-black mb-6">
                                    <img src="/tow-truck-icon.png" className="w-[56px] h-auto object-contain" alt="Tow Truck Icon" />
                                </div>
                                <h3 className="text-[22px] font-poppins font-medium text-black mb-4 leading-snug">
                                    Socorro 24/7: Assistência sempre ao seu alcance
                                </h3>
                                <p className="text-[15px] font-medium text-zinc-600 mb-8 max-w-sm">
                                    Tenha a tranquilidade de contar com nossa rede nacional de profissionais qualificados, funcionando ininterruptamente, em qualquer lugar do país.
                                </p>
                                <Link
                                    href="/login"
                                    className="bg-gradient-to-r from-[#F4980D] to-[#E46C21] text-white font-bold tracking-wide uppercase text-[12px] px-8 py-4 rounded-lg self-start hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    SOLICITAR GUINCHO AGORA
                                </Link>
                            </div>
                            <div className="h-[300px] md:h-auto order-1 md:order-2 w-full overflow-hidden relative">
                                <img
                                    src="/truck-resgate.png"
                                    className="w-full h-full object-cover md:object-right"
                                    alt="Guincho Resgate Caminhonete"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-white/60 md:to-white"></div>
                            </div>
                        </div>

                        {/* 4 Bottom Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/payment-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Payment icon" />
                                <h3 className="text-[18px] font-bold text-black mb-3">Pagamento transparente e flexível</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Sem intermediários cobrando a mais. Escolha sua forma de pagamento preferida diretamente com o profissional no momento da contratação.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/tracking-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Tracking icon" />
                                <h3 className="text-[18px] font-bold text-black mb-3">Rastreamento completo</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Veja em tempo real onde está o profissional, tempo estimado de chegada e todas as informações de quem está vindo te socorrer.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/truck-hook-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Icon truck hook" />
                                <h3 className="text-[18px] font-bold text-black mb-3">Rede verificada de especialistas em ação</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Nossa base conta com mais de 30 mil profissionais credenciados: reboque, desbloqueio de veículos, suporte para pneus, sistema elétrico, combustível... toda expertise necessária na sua região.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/choice-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Choice icon" />
                                <h3 className="text-[18px] font-bold text-black mb-3">O poder da escolha é seu</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    No app, você compara perfis, preços e avaliações reais, decidindo entre o atendimento mais econômico, mais rápido ou com maior qualidade comprovada.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COMPLETE SOLUTIONS */}
                <section className="py-24 px-6 md:px-12 bg-white overflow-hidden">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="space-y-8 order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="space-y-4">
                                <h2 className="text-[36px] font-poppins font-medium text-black leading-tight">
                                    Soluções completas no aplicativo
                                </h2>
                                <p className="text-[16px] font-medium text-zinc-500 leading-relaxed max-w-sm">
                                    O Guinchos e Reboques resolve muito mais que apenas reboque. Na plataforma, você tem acesso a:
                                </p>
                            </div>

                            <div className="w-full max-w-sm mx-auto lg:mx-0">
                                <div className="flex items-start gap-4 justify-center lg:justify-start">
                                    <div className="mt-1 shrink-0">
                                        <Check size={20} className="text-[#F59E0B]" strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[20px] font-bold text-black leading-tight">Guinchos 24h Horas</span>
                                        <span className="text-[14px] font-medium text-zinc-400 mt-1">Reboque e transporte veicular 24h</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-5 py-2.5 flex items-center justify-center gap-2.5 w-[170px]">
                                    <img src="/apple-icon.png" className="w-[16px] object-contain" alt="Apple" />
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[7px] text-zinc-300 font-medium tracking-widest mb-0.5 uppercase">Download on the</span>
                                        <span className="font-bold text-[11px]">APPLE STORE</span>
                                    </div>
                                </button>
                                <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-5 py-2.5 flex items-center justify-center gap-2.5 w-[170px]">
                                    <img src="/google-play-icon.png" className="w-[16px] object-contain" alt="Google Play" />
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[7px] text-zinc-300 font-medium tracking-widest mb-0.5 uppercase">Download on the</span>
                                        <span className="font-bold text-[11px]">Google Play</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
                            <img
                                src="/phone-solucoes.png"
                                alt="Celular demonstrando o app de guinchos"
                                className="w-full max-w-[420px] object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* DARK BANNER BRUTALIST */}
                <section className="bg-zinc-950 border-y border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 pointer-events-none bg-repeat" style={{ backgroundImage: 'url("/dark-pattern.png")', backgroundSize: '1200px' }}></div>
                    <div className="max-w-6xl mx-auto py-32 px-6 md:px-12 text-center relative z-10 space-y-6">
                        <span className="text-amber-500 font-bold tracking-[0.2em] uppercase text-xs">
                            Solução em emergência pessoal
                        </span>
                        <h2 className="text-[22px] sm:text-[28px] md:text-[36px] font-poppins font-medium text-white max-w-none mx-auto leading-tight">
                            Livre de burocracia, não importa se você tem seguro o <br /> Guinchos e Reboques funciona para todos.
                        </h2>
                    </div>
                </section>

                {/* DOWNLOAD CTA MOTORISTA/SMILING MAN */}
                <section className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-[85rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-2 lg:order-1 relative overflow-hidden w-full max-w-xl mx-auto">
                            <img
                                src="/smiling-man.png"
                                alt="Motorista sorrindo usando celular no carro"
                                className="w-full h-auto object-contain"
                            />
                        </div>

                        <div className="space-y-8 order-1 lg:order-2 lg:pl-12">
                            <h2 className="text-[36px] font-poppins font-medium text-black leading-tight tracking-tight">
                                Não perca tempo e baixe agora.
                            </h2>
                            <p className="text-[16px] font-medium text-zinc-600 leading-relaxed max-w-lg">
                                Esteja sempre um passo à frente. Não deixe para instalar na hora do desespero. Com o Guinchos e Reboques no seu celular, você tem acesso imediato aos melhores profissionais para qualquer imprevisto.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-6 py-3 flex items-center justify-center gap-3 w-full sm:w-[190px]">
                                    <img src="/apple-icon.png" className="w-[18px] object-contain" alt="Apple" />
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[9px] text-zinc-300 font-medium tracking-widest mb-0.5 uppercase">Download on the</span>
                                        <span className="font-bold text-[13px]">APPLE STORE</span>
                                    </div>
                                </button>
                                <button className="bg-black text-white hover:bg-zinc-800 transition-all border border-transparent rounded-[10px] px-6 py-3 flex items-center justify-center gap-3 w-full sm:w-[190px]">
                                    <img src="/google-play-icon.png" className="w-[18px] object-contain" alt="Google Play" />
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[9px] text-zinc-300 font-medium tracking-widest mb-0.5 uppercase">Download on the</span>
                                        <span className="font-bold text-[13px]">GOOGLE PLAY</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-[32px] md:text-[36px] font-poppins font-medium text-black text-center mb-16 tracking-tight">
                            Perguntas Comuns Respondidas
                        </h2>
                        <div className="border-t border-zinc-200">
                            {faqs.map((faq, idx) => (
                                <Accordion key={idx} title={faq.title} content={faq.content} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
