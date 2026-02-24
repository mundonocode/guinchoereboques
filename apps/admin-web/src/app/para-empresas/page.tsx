'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Accordion } from '@/components/landing/Accordion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParaEmpresasPage() {
    const infoSectionRef = useRef<HTMLElement>(null);
    const valueGridRef = useRef<HTMLElement>(null);

    const { scrollYProgress: infoScroll } = useScroll({
        target: infoSectionRef,
        offset: ["start end", "end start"]
    });

    const { scrollYProgress: valueScroll } = useScroll({
        target: valueGridRef,
        offset: ["start end", "end start"]
    });

    const circleY = useTransform(infoScroll, [0, 1], [0, 100]);
    const phoneY = useTransform(infoScroll, [0, 1], [0, -50]);
    const patternY = useTransform(valueScroll, [0, 1], [-50, 50]);

    const faqs = [
        {
            title: "Como minha empresa pode se tornar parceira?",
            content: "O processo é simples: clique no botão de parceria estratégica, preencha os dados básicos da sua empresa e nossa equipe de contas corporativas entrará em contato em até 24h úteis para configurar sua conta e integrações."
        },
        {
            title: "Existem custos fixos ou mensalidades?",
            content: "Nossas parcerias são flexíveis. Oferecemos modelos baseados em volume de chamados ou taxas fixas reduzidas para parceiros de longo prazo. Não há custo de adesão para configurar sua central."
        },
        {
            title: "O sistema pode ser integrado ao nosso software atual?",
            content: "Sim, possuímos APIs robustas para integração com sistemas de gestão de frotas, seguradoras e concessionárias. Nossa documentação técnica permite uma integração rápida e segura."
        },
        {
            title: "Como é garantido o padrão de atendimento nacional?",
            content: "Todos os nossos prestadores passam por um rigoroso processo de verificação e treinamento. Além disso, monitoramos em tempo real cada atendimento para garantir que o seu cliente receba a mesma qualidade em qualquer lugar do Brasil."
        }
    ];

    const valueCards = [
        {
            title: "Seguradoras",
            description: "Assistência premium diferenciada para seus segurados"
        },
        {
            title: "Concessionárias",
            description: "Suporte pós-venda que fideliza e tranquiliza clientes"
        },
        {
            title: "Locadoras de veículos",
            description: "Cobertura 24h para locações sem dor de cabeça"
        },
        {
            title: "Gestores de frotas",
            description: "Continuidade operacional garantida para seus veículos"
        },
        {
            title: "Oficinas",
            description: "Suporte emergencial para clientes fora do horário comercial"
        },
        {
            title: "Apps de mobilidade",
            description: "Suporte técnico para motoristas parceiros"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-black">
            <LandingHeader />

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-24 pb-32 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden">
                    <div className="max-w-[75rem] mx-auto w-full flex flex-col items-center text-center space-y-8">
                        {/* Top Badge */}
                        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 mb-2 shadow-sm w-fit">
                            <span className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-full text-sm font-bold">
                                Guinchos e Reboques
                            </span>
                            <span className="px-4 py-1.5 text-black text-[13px] font-semibold flex items-center gap-2">
                                Para Empresas
                                <ArrowRight size={16} className="text-gray-400" />
                            </span>
                        </div>

                        <h1 className="text-[40px] md:text-[52px] font-poppins font-medium text-black leading-[1.1] tracking-tight max-w-4xl">
                            Guinchos e Reboques para parceiros corporativos
                        </h1>

                        <p className="text-[15px] text-zinc-500 font-medium leading-relaxed max-w-2xl">
                            O Guinchos e Reboques transforma a <span className="text-black font-semibold">assistência veicular em diferencial competitivo para seu negócio</span>, através de tecnologia avançada, rede nacional de profissionais e integração completa com seus sistemas.
                        </p>

                        <Link
                            href="/login"
                            className="bg-[#111111] text-white font-bold tracking-wide uppercase text-[12px] px-10 py-5 rounded-lg hover:bg-black transition-all shadow-xl shadow-zinc-200"
                        >
                            Torne-se nosso parceiro estratégico
                        </Link>
                    </div>
                </section>

                {/* VALUE GRID SECTION (Dark) */}
                <section ref={valueGridRef} className="bg-zinc-950 py-32 px-6 md:px-12 relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0 opacity-[0.2] pointer-events-none"
                        style={{
                            backgroundImage: 'url("/dark-pattern.png")',
                            backgroundSize: '1200px',
                            backgroundRepeat: 'repeat',
                            y: patternY
                        }}
                    ></motion.div>

                    <div className="max-w-[75rem] mx-auto relative z-10">
                        <div className="text-center mb-20 space-y-4">
                            <span className="text-amber-500 font-bold uppercase text-xs tracking-widest">
                                Para quais empresas nossa parceria gera valor real?
                            </span>
                            <h2 className="text-[28px] md:text-[36px] font-poppins font-medium text-white max-w-4xl mx-auto leading-tight">
                                Se seus clientes dependem de mobilidade ou seu negócio está conectado ao setor automotivo, temos a solução ideal para agregar valor aos seus serviços.
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {valueCards.map((card, idx) => (
                                <div key={idx} className="bg-zinc-900/50 backdrop-blur-sm p-10 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all group">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all">
                                        <Sparkles size={24} className="text-white group-hover:text-amber-500 transition-all" />
                                    </div>
                                    <h3 className="text-xl font-poppins font-semibold text-white mb-4">
                                        {card.title}
                                    </h3>
                                    <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* INFO SECTION WITH PHONES */}
                <section ref={infoSectionRef} className="py-24 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden">
                    <div className="max-w-[75rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <img src="/tow-truck-icon.png" className="w-[84px] h-auto object-contain" alt="Logo" />
                            </div>
                            <h2 className="text-[36px] md:text-[42px] font-poppins font-medium text-black leading-tight tracking-tight">
                                Brasil inteiro, um só <br /> padrão de atendimento
                            </h2>
                            <p className="text-[16px] font-medium text-zinc-600 leading-relaxed max-w-lg">
                                Nossa plataforma conecta sua empresa a milhares de profissionais distribuídos estrategicamente em todo território nacional. Cobertura unificada que permite aos seus clientes receber o mesmo nível de serviço, independente de estarem no centro financeiro ou no interior mais distante.
                            </p>
                            <Link
                                href="/login"
                                className="bg-[#111111] text-white font-bold tracking-wide uppercase text-[12px] px-10 py-5 rounded-lg hover:bg-black transition-all shadow-xl shadow-zinc-200"
                            >
                                Torne-se nosso parceiro estratégico
                            </Link>
                        </div>

                        <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
                            {/* Circle visual background with Parallax */}
                            <motion.div
                                style={{ y: circleY }}
                                className="absolute top-1/2 left-1/2 lg:left-auto lg:right-0 -translate-y-1/2 -translate-x-1/2 lg:translate-x-0 w-[320px] h-[320px] md:w-[450px] md:h-[450px] bg-amber-400 rounded-full z-0 opacity-100"
                            ></motion.div>

                            {/* Phones mockup with Parallax and Float */}
                            <div className="relative z-10 w-full max-w-[480px] flex justify-center">
                                <motion.img
                                    src="/phones-app.png"
                                    alt="Plataforma Guinchos e Reboques"
                                    style={{ y: phoneY }}
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="py-24 px-6 md:px-12 bg-[#FBFBFB]">
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
