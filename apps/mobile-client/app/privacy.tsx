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
                        Ao aceitar a presente Política de Privacidade, você autoriza a Guinchos e Reboque a tratar seus dados pessoais constantes nos formulários disponibilizados (newsletter, contato ou conta), bem como dados relativos à relação comercial e contratual, em conformidade com a LGPD (Lei nº 13.709/2018).
                    </Text>
                    <Text style={[styles.paragraph, { marginTop: 12 }]}>
                        O tratamento engloba operações automatizadas ou não, com fins de: melhorar funcionalidades, personalização do serviço, processamento de transações, contato e marketing.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Finalidades e Base Legal</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Execução de contrato:</Text> Prestação dos serviços de reboque;</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Legítimo interesse:</Text> Melhoria de serviços e análises;</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Consentimento:</Text> Marketing e newsletters;</Text>
                        <Text style={styles.bulletItem}>• <Text style={styles.bold}>Obrigação legal:</Text> Exigências fiscais e regulatórias.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Coleta e Utilização</Text>
                    <Text style={styles.paragraph}>
                        Coletamos dados fornecidos voluntariamente: nome, e-mail, telefone, CPF, endereço e dados do veículo. Esses dados permitem personalizar sua experiência, processar pagamentos e cumprir obrigações legais.
                    </Text>
                    <Text style={[styles.paragraph, { marginTop: 12 }]}>
                        Não vendemos ou transferimos dados para terceiros não autorizados. Entidades subcontratadas seguem as mesmas regras de proteção.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Segurança e Retenção</Text>
                    <Text style={styles.paragraph}>
                        Empregamos medidas técnicas como criptografia e controles de acesso. Seus dados são mantidos pelo período necessário (contratual por até 5 anos, marketing por até 2 anos).
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Seus Direitos (LGPD)</Text>
                    <Text style={styles.paragraph}>
                        Você possui direito de: acesso, correção, anonimização, portabilidade, eliminação e revogação do consentimento.
                    </Text>
                    <Text style={[styles.paragraph, { marginTop: 12 }]}>
                        Para exercer seus direitos, contate: <Text style={styles.link}>contato@guinchosereboques.com.br</Text>.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Encarregado de Dados</Text>
                    <Text style={styles.paragraph}>
                        Questões sobre proteção de dados podem ser enviadas diretamente para o e-mail: <Text style={styles.bold}>contato@guinchosereboques.com.br</Text>.
                    </Text>
                </View>

                <Text style={styles.footerText}>
                    Ao utilizar este aplicativo, você concorda expressamente com esta Política de Privacidade.
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
