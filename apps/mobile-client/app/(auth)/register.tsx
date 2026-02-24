import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ArrowLeft, ArrowRight, Mail, Lock, User, Briefcase } from 'lucide-react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'cliente' | 'motorista'>('cliente');
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        if (!nomeCompleto || !email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nome_completo: nomeCompleto,
                        role: role,
                    },
                },
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // Fallback: If no database trigger exists, explicitly insert into perfis.
                // If there's a trigger, this might fail with a duplicate key error which we can safely ignore or handle.
                const { error: profileError } = await supabase.from('perfis').insert({
                    id: data.user.id,
                    nome_completo: nomeCompleto,
                    role: role,
                });

                if (profileError && profileError.code !== '23505') { // 23505 = unique violation mapping triggered
                    console.error('Error creating profile manually', profileError);
                }
            }

            Alert.alert('Sucesso', 'Conta criada com sucesso!');

        } catch (error: any) {
            Alert.alert('Erro no Cadastro', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.contentHolder}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft color="#111" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Criar Conta</Text>
                        <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

                        <View style={styles.inputContainer}>
                            <User color="#666" size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nome Completo"
                                placeholderTextColor="#999"
                                value={nomeCompleto}
                                onChangeText={setNomeCompleto}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail color="#666" size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock color="#666" size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Text style={styles.labelRole}>Tipo de Conta</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[styles.roleOption, role === 'cliente' && styles.roleOptionActive]}
                                onPress={() => setRole('cliente')}
                            >
                                <User color={role === 'cliente' ? '#fff' : '#666'} size={24} />
                                <Text style={[styles.roleText, role === 'cliente' && styles.roleTextActive]}>Sou Cliente</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleOption, role === 'motorista' && styles.roleOptionActive]}
                                onPress={() => setRole('motorista')}
                            >
                                <Briefcase color={role === 'motorista' ? '#fff' : '#666'} size={24} />
                                <Text style={[styles.roleText, role === 'motorista' && styles.roleTextActive]}>Sou Guincheiro</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.registerButtonContent}>
                                    <Text style={styles.registerButtonText}>Cadastrar</Text>
                                    <ArrowRight color="#fff" size={20} />
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.loginLinkText}>
                                Já tem uma conta? <Text style={styles.loginLinkHighlight}>Entrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    contentHolder: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    labelRole: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        marginBottom: 12,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    roleOption: {
        flex: 1,
        height: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    roleOptionActive: {
        backgroundColor: '#111', // You could use '#F97316' for Guincho app theme if needed later
        borderColor: '#111',
    },
    roleText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    roleTextActive: {
        color: '#fff',
    },
    registerButton: {
        backgroundColor: '#111',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    loginLink: {
        marginTop: 32,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 14,
        color: '#666',
    },
    loginLinkHighlight: {
        color: '#111',
        fontWeight: '600',
    },
});
