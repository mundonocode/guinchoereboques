import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Mail, HelpCircle, Phone } from 'lucide-react-native';

export default function SupportScreen() {
    const router = useRouter();

    const openWhatsApp = () => {
        Linking.openURL('https://wa.me/5583991950841?text=Olá, preciso de suporte no app Guincho e Reboques');
    };

    const openEmail = () => {
        Linking.openURL('mailto:sac@guinchosereboques.com.br?subject=Suporte App Guincho');
    };

    const openInstagram = () => {
        Linking.openURL('https://www.instagram.com/guinchosireboques?igsh=ZXo2MTh4dDB3OTRo');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.heroSection}>
                    <HelpCircle size={64} color="#3B82F6" />
                    <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
                    <Text style={styles.heroSubtitle}>Nossa equipe está disponível para tirar suas dúvidas e resolver problemas.</Text>
                </View>

                <View style={styles.contactCard}>
                    <Text style={styles.cardTitle}>Canais de Atendimento</Text>

                    <TouchableOpacity style={styles.contactItem} onPress={openWhatsApp}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <MessageCircle size={24} color="#166534" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>WhatsApp</Text>
                            <Text style={styles.contactValue}>(83) 99195-0841</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
                        <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                            <Mail size={24} color="#1E40AF" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>E-mail</Text>
                            <Text style={styles.contactValue}>sac@guinchosereboques.com.br</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={openInstagram}>
                        <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
                            <HelpCircle size={24} color="#BE185D" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Instagram</Text>
                            <Text style={styles.contactValue}>@guinchosireboques</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.cardTitle}>Dúvidas Frequentes</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Como cadastrar um guincho?</Text>
                        <Text style={styles.faqAnswer}>Acesse seu perfil, vá em "Meus Veículos" e adicione os dados do caminhão.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Qual o prazo de pagamento?</Text>
                        <Text style={styles.faqAnswer}>Os pagamentos são processados semanalmente conforme o fechamento da fatura.</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>Atendimento de Segunda a Sexta, das 09h às 18h.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
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
    heroSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    faqSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    faqItem: {
        marginBottom: 16,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 40,
    },
});
