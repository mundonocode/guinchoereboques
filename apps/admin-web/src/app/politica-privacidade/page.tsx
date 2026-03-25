'use client';

import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PoliticaPrivacidadePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white font-sans">
            <LandingHeader />

            <main className="max-w-4xl mx-auto py-24 px-6 md:px-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <Shield className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-black tracking-tight">Política de Privacidade</h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">Última atualização: 10/09/2025</p>
                    </div>
                </div>

                <div className="prose prose-zinc max-w-none space-y-8 text-zinc-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">DECLARAÇÃO E CONSENTIMENTO PRÉVIOS À POLÍTICA DE PRIVACIDADE</h2>
                        <p>
                            Ao aceitar a presente Política de Privacidade, você autoriza a Guinchos e Reboque a tratar seus dados pessoais constantes nos formulários disponibilizados através de nossos websites (formulário de newsletter, contato ou conta), dos quais confirma ser titular, bem como dos dados relativos à sua relação comercial e contratual, e respectiva gestão, nos termos aqui descritos, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
                        </p>
                        <p className="mt-4">
                            Você declara: – que está consciente e informado(a) de que o tratamento de seus dados pessoais engloba todas as operações efetuadas sobre os dados por você transmitidos.
                        </p>
                        <p className="mt-4">
                            Tal tratamento pode ser feito por meios automatizados ou não, com finalidades como: melhorar o funcionamento e funcionalidades do website da Guinchos e Reboque, incluindo agregação e tratamento estatístico dos dados (sem identificação pessoal), personalização dos serviços prestados, processamento de transações, contato por e-mail, mensagens ou telefone para envio de informações e atualizações sobre serviços ou produtos, e interação através de plataformas digitais ou redes sociais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">FINALIDADES E BASE LEGAL PARA O TRATAMENTO</h2>
                        <p>A Guinchos e Reboque trata seus dados pessoais com base nas seguintes finalidades e bases legais previstas na LGPD:</p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li><strong>Execução de contrato:</strong> Para prestação dos serviços de guincho e reboque contratados;</li>
                            <li><strong>Legítimo interesse:</strong> Para melhorar nossos serviços, realizar análises estatísticas e personalizar sua experiência;</li>
                            <li><strong>Consentimento:</strong> Para envio de comunicações de marketing, newsletters e promoções;</li>
                            <li><strong>Cumprimento de obrigação legal:</strong> Para atender exigências fiscais, trabalhistas e regulatórias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">COLETA E UTILIZAÇÃO DE DADOS</h2>
                        <p>
                            A Guinchos e Reboque apenas coleta dados pessoais fornecidos voluntariamente. Isso acontece quando você preenche um formulário, nos contata diretamente, ou participa em alguma atividade promovida por nós.
                        </p>
                        <p className="mt-4">
                            Os dados coletados poderão incluir: nome, e-mail, telefone, CPF, endereço, dados do veículo, entre outros necessários para a prestação dos serviços. A coleta de dados permite:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Personalizar sua experiência com nossos serviços;</li>
                            <li>Melhorar nossos canais digitais e atendimento ao cliente;</li>
                            <li>Processar transações e pagamentos;</li>
                            <li>Enviar informações sobre serviços e novidades;</li>
                            <li>Cumprir obrigações legais e regulatórias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">SEGURANÇA DAS INFORMAÇÕES</h2>
                        <p>
                            Empregamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acessos não autorizados, alteração, divulgação ou destruição. Utilizamos práticas de segurança reconhecidas no mercado, incluindo criptografia, controles de acesso e monitoramento de segurança.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">SEUS DIREITOS COMO TITULAR DE DADOS</h2>
                        <p>Conforme a LGPD, você possui os seguintes direitos:</p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Confirmação e acesso aos seus dados;</li>
                            <li>Correção de dados incompletos ou inexatos;</li>
                            <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                            <li>Portabilidade dos dados e revogação do consentimento.</li>
                        </ul>
                        <p className="mt-4 font-bold">
                            Para exercer seus direitos, entre em contato através do e-mail: contato@guinchosereboques.com.br
                        </p>
                    </section>

                    <section className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                        <h2 className="text-xl font-bold text-black mb-4">CONSENTIMENTO E ACEITE</h2>
                        <p>
                            Ao utilizar o website e serviços da Guinchos e Reboque, você concorda com esta Política de Privacidade. Em caso de dúvidas ou reclamações sobre o tratamento de dados, você pode entrar em contato conosco através de <strong>contato@guinchosereboques.com.br</strong> ou apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
                        </p>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
