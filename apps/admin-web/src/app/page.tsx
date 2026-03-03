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

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* HERO SECTION */}
                <section ref={heroRef} className="relative py-12 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden">
                    <div className="max-w-[75rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
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

                            <h1 className="text-[40px] font-poppins font-medium text-black leading-[1.1] tracking-tight">
                                O app que encontra seu guincho mais próximo em instantes.
                            </h1>

                            <p className="text-[20px] text-zinc-500 font-inter font-normal leading-relaxed mb-6">
                                Acesse os melhores profissionais da sua região em segundos - compare preços, velocidade e avaliações para escolher exatamente o que precisa.
                            </p>

                            <div className="pt-2">
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <button className="bg-black text-white hover:bg-zinc-900 border border-white/10 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[170px]">
                                        <img src="/apple-icon.png" className="w-[28px] h-[28px] object-contain" alt="Apple" />
                                        <div className="flex flex-col items-start leading-tight text-left">
                                            <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Baixar na</span>
                                            <span className="text-[17px] font-semibold">App Store</span>
                                        </div>
                                    </button>
                                    <button className="bg-black text-white hover:bg-zinc-900 border border-white/10 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[170px]">
                                        <img src="/google-play-icon.png" className="w-[26px] h-[26px] object-contain" alt="Google Play" />
                                        <div className="flex flex-col items-start leading-tight text-left">
                                            <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Disponível no</span>
                                            <span className="text-[17px] font-semibold">Google Play</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full flex items-center justify-center lg:justify-end mt-4 lg:mt-0">

                            {/* The Phones Container with Parallax and nested Float */}
                            <motion.div
                                style={{ y: imageY }}
                                className="relative z-10 w-full max-w-[420px] flex justify-center"
                            >
                                <motion.img
                                    src="/hero-phones-new.png"
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-[75rem] mx-auto"
                    >
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
                                <h3 className="text-[17px] font-poppins font-semibold text-black mb-4 leading-snug">
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
                                <h3 className="text-[17px] font-poppins font-semibold text-black mb-3">Pagamento transparente e flexível</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Sem intermediários cobrando a mais. Escolha sua forma de pagamento preferida diretamente com o profissional no momento da contratação.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/tracking-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Tracking icon" />
                                <h3 className="text-[17px] font-poppins font-semibold text-black mb-3">Rastreamento completo</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Veja em tempo real onde está o profissional, tempo estimado de chegada e todas as informações de quem está vindo te socorrer.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/truck-hook-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Icon truck hook" />
                                <h3 className="text-[17px] font-poppins font-semibold text-black mb-3">Rede verificada de especialistas em ação</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    Nossa base conta com mais de 30 mil profissionais credenciados: reboque, desbloqueio de veículos, suporte para pneus, sistema elétrico, combustível... toda expertise necessária na sua região.
                                </p>
                            </div>
                            <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-zinc-100 flex flex-col">
                                <img src="/choice-icon.png" className="w-[48px] h-auto object-contain mb-6" alt="Choice icon" />
                                <h3 className="text-[17px] font-poppins font-semibold text-black mb-3">O poder da escolha é seu</h3>
                                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                    No app, você compara perfis, preços e avaliações reais, decidindo entre o atendimento mais econômico, mais rápido ou com maior qualidade comprovada.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* COMPLETE SOLUTIONS */}
                <section className="py-24 px-6 md:px-12 bg-white overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
                    >
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

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                                <button className="bg-black text-white hover:bg-zinc-900 border border-white/10 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]">
                                    <img src="/apple-icon.png" className="w-[26px] h-[26px] object-contain" alt="Apple" />
                                    <div className="flex flex-col items-start leading-tight text-left">
                                        <span className="text-[8px] text-zinc-400 uppercase">Baixar na</span>
                                        <span className="text-[16px] font-semibold">App Store</span>
                                    </div>
                                </button>
                                <button className="bg-black text-white hover:bg-zinc-900 border border-white/10 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]">
                                    <img src="/google-play-icon.png" className="w-[24px] h-[24px] object-contain" alt="Google Play" />
                                    <div className="flex flex-col items-start leading-tight text-left">
                                        <span className="text-[8px] text-zinc-400 uppercase">Disponível no</span>
                                        <span className="text-[16px] font-semibold">Google Play</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
                            <img
                                src="/solutions-phones-new.png.png"
                                alt="Celular demonstrando o app de guinchos"
                                className="w-full max-w-[420px] object-contain drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </section>

                {/* DARK BANNER BRUTALIST */}
                <section className="bg-zinc-950 border-y border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 pointer-events-none bg-repeat" style={{ backgroundImage: 'url("/dark-pattern.png")', backgroundSize: '1200px' }}></div>
                    <div className="max-w-6xl mx-auto py-32 px-6 md:px-12 text-center relative z-10 space-y-6">
                        <span className="text-amber-500 font-bold tracking-[0.2em] uppercase text-xs">
                            Solução em emergência pessoal
                        </span>
                        <h2 className="text-[36px] font-inter font-medium text-white max-w-4xl mx-auto leading-tight">
                            Livre de burocracias, não importa se você tem seguro o Guinchos e Reboques funciona para todos.
                        </h2>
                    </div>
                </section>

                {/* DOWNLOAD CTA & SERVICE SECTION */}
                <section className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
                        {/* Logo Block */}
                        <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-[2rem] aspect-square md:aspect-auto md:h-full min-h-[300px]">
                            <img src="/tow-truck-icon.png" className="w-[120px] h-auto mb-6" alt="Icon Truck" />
                            <div className="text-center">
                                <h3 className="text-[32px] font-poppins font-bold text-black leading-tight">
                                    Guinchos <br /> e Reboques
                                </h3>
                            </div>
                        </div>

                        {/* CTA Block */}
                        <div className="space-y-6">
                            <h2 className="text-[36px] font-poppins font-medium text-black leading-tight">
                                Não perca tempo e baixe agora.
                            </h2>
                            <p className="text-[16px] font-inter font-normal text-zinc-500 leading-relaxed">
                                Esteja sempre um passo à frente. Não deixe para instalar na hora do desespero. Com o Guinchos e Reboques no seu celular, você tem acesso imediato aos melhores profissionais para qualquer imprevisto.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <button className="bg-black text-white hover:bg-zinc-900 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2 min-w-[140px]">
                                    <img src="/apple-icon.png" className="w-[22px] h-[22px] object-contain" alt="Apple" />
                                    <div className="flex flex-col items-start leading-tight text-left">
                                        <span className="text-[7px] text-zinc-400 uppercase">Baixar na</span>
                                        <span className="text-[14px] font-semibold">App Store</span>
                                    </div>
                                </button>
                                <button className="bg-black text-white hover:bg-zinc-900 transition-colors rounded-lg px-4 py-2 flex items-center justify-center gap-2 min-w-[140px]">
                                    <img src="/google-play-icon.png" className="w-[20px] h-[20px] object-contain" alt="Google Play" />
                                    <div className="flex flex-col items-start leading-tight text-left">
                                        <span className="text-[7px] text-zinc-400 uppercase">Disponível no</span>
                                        <span className="text-[14px] font-semibold">Google Play</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Service Description Block */}
                        <div className="space-y-6">
                            <h2 className="text-[32px] font-poppins font-medium text-black leading-tight">
                                Serviço de guincho 24 horas pelo aplicativo ou pela web
                            </h2>
                            <p className="text-[16px] font-inter font-normal text-zinc-500 leading-relaxed">
                                Guinchos e Reboques faz o trabalho duro para você. Baixe nosso aplicativo gratuito na Google Play ou App Store e solicite guincho pela web. Chegamos para te proporcionar toda a comodidade que você precisa no momento mais inoportuno. Através tecnologia de ponta para realizar serviço de guincho. Você pode pagar com cartão de crédito/débito e pix pelo aplicativo.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-black font-bold text-sm tracking-widest uppercase hover:underline">
                                BAIXAR APP →
                            </a>
                        </div>

                        {/* Service Image Block */}
                        <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
                            <img
                                src="/feature-2.png"
                                alt="Caminhão de resgate carregando carro"
                                className="w-full h-full object-cover min-h-[300px]"
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-[32px] md:text-[36px] font-bold text-black text-center mb-16 tracking-tight">
                            Perguntas Comuns Respondidas
                        </h2>
                        <div className="border-t border-zinc-200">
                            {faqs.map((faq, idx) => (
                                <Accordion key={idx} title={faq.title} content={faq.content} />
                            ))}
                        </div>
                    </div>
                </section>
            </motion.main>

            <LandingFooter />
        </div>
    );
}
