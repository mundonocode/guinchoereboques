import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacidade</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Política de Privacidade – Guinchos e Reboque</Text>
                <Text style={styles.lastUpdated}>Última atualização: 10 de Setembro de 2025</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Declaração e Consentimento</Text>
                    <Text style={styles.paragraph}>
                        Ao aceitar a presente Política de Privacidade, você autoriza a Guinchos e Reboque a tratar seus dados pessoais constantes nos formulários disponibilizados através de nossos websites (formulário de newsletter, contato ou conta), dos quais confirma ser titular, bem como dos dados relativos à sua relação comercial e contratual, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
                    </Text>
                    <Text style={[styles.paragraph, { marginTop: 12 }]}>
                        Você declara estar ciente de que o tratamento engloba todas as operações efetuadas sobre os dados transmitidos, podendo ser feito por meios automatizados ou não, com finalidades como: melhoria das funcionalidades, personalização dos serviços, processamento de transações e comunicações sobre atualizações de serviços.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Finalidades e Base Legal</Text>
                    <Text style={styles.paragraph}>
                        Tratamos seus dados com base nas seguintes justificativas:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Execução de contrato:</Text> Prestação dos serviços de guincho contratados.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Legítimo interesse:</Text> Melhoria de serviços e análise estatística.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Consentimento:</Text> Envio de marketing e newsletters.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Obrigação legal:</Text> Atendimento a exigências fiscais e regulatórias.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Coleta e Utilização</Text>
                    <Text style={styles.paragraph}>
                        Apenas coletamos dados fornecidos voluntariamente via formulários ou contato direto. Os dados podem incluir: nome, e-mail, telefone, CPF, endereço e informações do veículo necessárias para o atendimento.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Segurança das Informações</Text>
                    <Text style={styles.paragraph}>
                        Empregamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acessos não autorizados, alteração, divulgação ou destruição.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Retenção de Dados</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Dados contratuais:</Text> Durante o contrato e por até 5 anos após.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Dados de marketing:</Text> Até revogação ou 2 anos sem interação.</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Dados fiscais:</Text> Conforme prazos da legislação tributária.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Seus Direitos (LGPD)</Text>
                    <Text style={styles.paragraph}>
                        Você possui os seguintes direitos: Confirmação e acesso, Correção, Anonimização ou Bloqueio, Portabilidade e Revogação do consentimento.
                    </Text>
                    <Text style={[styles.paragraph, { marginTop: 12 }]}>
                        Solicitações podem ser feitas pelo e-mail: <Text style={styles.link}>contato@guinchosereboques.com.br</Text>. Você também tem o direito de reclamar à ANPD.
                    </Text>
                </View>

                <Text style={styles.footerText}>
                    Ao utilizar este aplicativo, você concorda expressamente com os termos da Guinchos e Reboque.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    bulletList: {
        marginTop: 8,
        paddingLeft: 4,
    },
    bulletItem: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 6,
    },
    bold: {
        fontWeight: '700',
        color: '#1F2937',
    },
    link: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    footerText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 32,
        marginBottom: 40,
        fontStyle: 'italic',
    },
});
