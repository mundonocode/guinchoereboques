import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CPFModal() {
    const { session, cpf, isLoading, refreshProfile, signOut } = useAuth();
    const [inputCpf, setInputCpf] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // O modal deve estar visível se o carregamento for concluído,
    // o usuário estiver logado mas não tiver CPF no perfil.
    const visible = !isLoading && !!session && cpf === null;

    if (!visible) return null;

    const handleCpfChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        // Aplica a máscara 000.000.000-00
        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }
        
        setInputCpf(value);
    };

    const validateCpf = (cpfStr: string) => {
        const cleanCpf = cpfStr.replace(/\D/g, '');
        return cleanCpf.length === 11;
    };

    const handleSave = async () => {
        if (!validateCpf(inputCpf)) {
            Alert.alert('CPF Inválido', 'Por favor, insira um CPF válido com 11 dígitos.');
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('perfis')
                .update({ cpf: inputCpf })
                .eq('id', session?.user.id);

            if (error) throw error;

            // Atualiza o estado global
            await refreshProfile();
            Alert.alert('Sucesso', 'Seu CPF foi cadastrado com sucesso!');
        } catch (error: any) {
            console.error('Error updating CPF:', error);
            Alert.alert('Erro', 'Não foi possível salvar o CPF. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <ShieldAlert size={48} color="#111" />
                        </View>
                        
                        <Text style={styles.title}>Documentação Necessária</Text>
                        <Text style={styles.subtitle}>
                            Para garantir a segurança de todos e processar pagamentos, precisamos que você cadastre seu CPF antes de continuar.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>NÚMERO DO CPF</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="000.000.000-00"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={inputCpf}
                                onChangeText={handleCpfChange}
                                maxLength={14}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.saveButton, isSaving && styles.disabledButton]} 
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <UserCheck size={20} color="#fff" style={{marginRight: 8}} />
                                    <Text style={styles.saveButtonText}>Cadastrar CPF</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.signOutButton} 
                            onPress={signOut}
                            disabled={isSaving}
                        >
                            <Text style={styles.signOutText}>Sair da conta</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Seus dados estão protegidos e são usados apenas para fins legais e fiscais.
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    saveButton: {
        backgroundColor: '#111827',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    signOutButton: {
        padding: 16,
        marginTop: 16,
    },
    signOutText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    }
});
