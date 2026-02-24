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

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Política de Privacidade e Termos de Uso</Text>
                <Text style={styles.lastUpdated}>Última atualização: 23 de Fevereiro de 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Coleta de Dados</Text>
                    <Text style={styles.paragraph}>
                        Coletamos informações básicas como nome, telefone, CPF e localização para possibilitar a prestação de serviços de guincho e reboque. Sua localização é compartilhada com o motorista apenas após a aceitação do serviço.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Uso das Informações</Text>
                    <Text style={styles.paragraph}>
                        Seus dados são utilizados exclusivamente para a operação do aplicativo, incluindo o despacho de chamados, processamento de pagamentos e suporte técnico.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Segurança</Text>
                    <Text style={styles.paragraph}>
                        Empregamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Seus Direitos</Text>
                    <Text style={styles.paragraph}>
                        Você pode solicitar a exclusão de seus dados a qualquer momento através da nossa central de suporte.
                    </Text>
                </View>

                <Text style={styles.footerText}>
                    Ao utilizar este aplicativo, você concorda com os termos aqui descritos.
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
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
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
