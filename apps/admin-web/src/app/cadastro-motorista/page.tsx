'use client';

import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Accordion } from '@/components/landing/Accordion';
import { Check, ArrowRight, Zap, Award, Download, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CadastroMotoristaPage() {
    const faqs = [
        {
            title: 'Como funciona o pagamento das corridas?',
            content: 'O pagamento é processado semanalmente diretamente na sua conta bancária cadastrada. Corridas feitas via cartão de crédito são repassadas integralmente após o desconto da taxa da plataforma, com pagamentos às quartas-feiras.'
        },
        {
            title: 'Qual a documentação necessária para me cadastrar?',
            content: 'Você precisará enviar: CNH válida (categoria apropriada), CRLV do veículo do ano vigente, comprovante de residência e dados bancários para repasse. O veículo deve ter seguro com cobertura a terceiros.'
        },
        {
            title: 'O aplicativo funciona em todo o Brasil?',
            content: 'Sim, operamos em rede nacional. Você receberá chamados de acordo com sua localização atual. Caso você se desloque para outro estado, o sistema atualizará sua base automaticamente.'
        },
        {
            title: 'Existe alguma taxa de adesão ou mensalidade?',
            content: 'Não. Nossa parceria é 100% gratuita para entrada. Nós retemos apenas uma porcentagem fixa sobre as viagens que você concluir pela plataforma.'
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
                <section className="relative pt-12 pb-20 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden">
                    <div className="max-w-[75rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-5 relative z-10 w-full max-w-2xl mx-auto lg:mx-0">
                            {/* Top Badge */}
                            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 mb-2 shadow-sm w-fit">
                                <span className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-full text-sm font-bold">
                                    Guinchos e Reboques
                                </span>
                                <span className="px-4 py-1.5 text-black text-[13px] font-semibold flex items-center gap-2">
                                    Para Profissionais
                                    <ArrowRight size={16} className="text-gray-400" />
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-[40px] font-bold text-black leading-[1.05] tracking-tight">
                                Pare de buscar clientes.<br />
                                Deixe eles encontrarem você
                            </h1>

                            <p className="text-[15px] text-zinc-500 font-medium leading-relaxed max-w-lg mb-2">
                                Nossa plataforma conecta você a milhares de motoristas que
                                precisam dos seus serviços, enquanto você mantém autonomia
                                total sobre sua agenda.
                            </p>

                            <div className="pt-2 space-y-4">
                                <Link
                                    href="/cadastro"
                                    className="inline-block px-10 py-4 lg:py-5 bg-[#222222] text-white rounded-lg font-bold tracking-wider text-sm hover:bg-black transition-colors"
                                >
                                    CADASTRE-SE AGORA
                                </Link>
                                <div className="flex items-center gap-2 text-[15px] font-medium text-zinc-800">
                                    <Download size={18} className="text-zinc-500" />
                                    <span>Mais de 8.000 Profissionais Ativos</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
                            <img
                                src="/hero-driver-cartoon.png"
                                alt="Motorista de guincho satisfeito"
                                className="w-full h-auto max-w-[500px] object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* IDEAL FOR SECTION */}
                <section id="para-profissionais" className="py-24 px-6 md:px-12 bg-[#F8F9FA] text-black">
                    <div className="max-w-[75rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                        <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start">
                            <img
                                src="/ideal-for-correct.png"
                                alt="Profissional com caminhão guincho"
                                className="w-full max-w-[500px] h-auto object-cover rounded-2xl shadow-sm"
                            />
                        </div>

                        <div className="order-1 lg:order-2 space-y-6">
                            <h2 className="text-[36px] font-bold leading-[1.2] text-black max-w-[500px]">
                                Para quais profissionais o Guinchos e Reboques é ideal?
                            </h2>

                            <p className="text-[14px] text-zinc-600 font-medium leading-relaxed max-w-md">
                                Se sua atividade envolve socorro veicular ou atendimento a motoristas em dificuldades, nossa plataforma é o canal perfeito para ampliar seu alcance.
                            </p>

                            <div className="pt-2 flex flex-col w-full max-w-md">
                                {[
                                    'Profissionais autônomos de reboque',
                                    'Companhias de socorro rodoviário',
                                    'Profissionais de plantão integral',
                                    'Socorristas versáteis'
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 py-4 border-b border-zinc-300">
                                        <Check size={20} className="text-amber-500 shrink-0" strokeWidth={2.5} />
                                        <span className="text-[15px] font-medium text-zinc-800">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* COVERAGE SECTION (Brutalist dark break) */}
                <section className="bg-zinc-950 border-y border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                    <div className="max-w-7xl mx-auto py-24 px-6 md:px-12 text-center relative z-10 space-y-6">
                        <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs block relative inline-block">
                            Cobertura Nacional Ativa
                            <span className="absolute -right-4 top-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        </span>
                        <h2 className="text-[36px] font-bold text-white max-w-4xl mx-auto leading-[1.2]">
                            Nossa rede já opera em múltiplas regiões, mas recebemos parceiros de <span className="text-amber-500">qualquer estado</span> brasileiro.
                        </h2>
                    </div>
                </section>

                {/* FEATURES GRID SECTION */}
                <section id="como-funciona" className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-[75rem] mx-auto">
                        <div className="mb-16">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/features-icon-orange.png" alt="Guincho" className="w-[124px] h-[38px] object-contain object-left block" />
                            </div>
                            <h2 className="text-[36px] font-bold text-black leading-tight max-w-xl mb-4 text-balance">
                                Crescimento para<br />autônomos e empresa
                            </h2>
                            <p className="text-[14px] font-medium text-zinc-600 max-w-2xl text-balance">
                                Benefícios de integrar nossa rede Diferentes perfis, mesma oportunidade de crescimento. Junte-se à maior rede de assistência veicular e descubra como tecnologia pode transformar seu trabalho.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: 'Controle completo do seu negócio',
                                    desc: 'Selecione quais especialidades ofertar\nEstabeleça sua própria precificação\nDetermine sua disponibilidade e agenda',
                                    img: '/feature-1.png'
                                },
                                {
                                    title: 'Pagamento direto e seguro',
                                    desc: 'Receba via Pix, cartão ou espécie\nValores justos e transparentes',
                                    img: '/feature-2.png'
                                },
                                {
                                    title: 'Ferramentas inteligentes',
                                    desc: 'Cotação automática usando seus valores\nAtivação apenas com aprovação do cliente\nNavegação integrada ao seu GPS preferido (Waze, Google Maps, etc.)',
                                    img: '/feature-3.png'
                                },
                                {
                                    title: 'Exposição constante',
                                    desc: 'Marketing contínuo através da plataforma\nPrioridade para profissionais disponíveis e qualificados\nExpansão para novas áreas, novas oportunidades',
                                    img: '/feature-4.png'
                                }
                            ].map((ft, idx) => (
                                <div key={idx} className="bg-transparent flex flex-col">
                                    <div className="aspect-[4/3] rounded-tl-[2rem] rounded-br-[2rem] overflow-hidden mb-4">
                                        <img src={ft.img} alt={ft.title} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-black mb-2 leading-tight tracking-tight">{ft.title}</h3>
                                    <div className="text-[12px] text-zinc-500 font-medium leading-[1.6] whitespace-pre-line">
                                        {ft.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* DOWNLOAD APP SECTION */}
                <section className="py-24 px-6 md:px-12 bg-white overflow-hidden">
                    <div className="max-w-6xl mx-auto p-8 md:p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                            {/* Phones visually on the Left */}
                            <div className="relative order-2 lg:order-1 flex justify-center lg:justify-end">
                                <img
                                    src="/phones-app.png"
                                    alt="Aplicativo Guinchos e Reboques"
                                    className="w-full max-w-[463px] max-h-[502px] object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Text on the Right */}
                            <div className="space-y-8 lg:pl-12 order-1 lg:order-2">
                                <h2 className="text-[36px] font-bold text-black leading-[1.1] tracking-tight">
                                    Não perca tempo e baixe agora.
                                </h2>
                                <p className="text-[16px] font-medium text-zinc-600 leading-relaxed max-w-lg">
                                    Chega de esperar em pontos ou ficar rodando vazio. Instale no seu smartphone.
                                    Com o Guinchos e Reboques seu celular é a sua central, recebendo chamados
                                    onde você estiver e na hora que quiser, pronto para qualquer emergência.
                                </p>
                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <button className="bg-black text-white hover:bg-zinc-800 transition-colors rounded-xl px-5 py-2.5 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[160px]">
                                        <img src="/apple-icon.png" className="w-[24px] h-[24px] object-contain" alt="Apple" />
                                        <div className="flex flex-col items-start leading-none text-left">
                                            <span className="text-[10px] text-zinc-300 mb-1">Baixar na</span>
                                            <span className="text-[16px] font-bold">App Store</span>
                                        </div>
                                    </button>
                                    <button className="bg-black text-white hover:bg-zinc-800 transition-colors rounded-xl px-5 py-2.5 flex items-center justify-center gap-3 w-full sm:w-auto min-w-[160px]">
                                        <img src="/google-play-icon.png" className="w-[24px] h-[24px] object-contain" alt="Google Play" />
                                        <div className="flex flex-col items-start leading-none text-left">
                                            <span className="text-[10px] text-zinc-300 mb-1">Disponível no</span>
                                            <span className="text-[16px] font-bold">Google Play</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="py-24 px-6 md:px-12 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-[32px] md:text-[36px] font-bold text-black text-center mb-16 tracking-tight">
                            Por que manter o Guinchos e Reboques sempre à mão?
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
