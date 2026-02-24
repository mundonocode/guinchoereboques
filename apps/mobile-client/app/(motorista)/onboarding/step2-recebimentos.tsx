import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/contexts/AuthContext';
import { CreditCard, Mail, User, Wallet, Briefcase } from 'lucide-react-native';

export default function Step2Recebimentos() {
    const router = useRouter();
    const { session } = useAuth();

    const [loading, setLoading] = useState(false);
    const [loadingInit, setLoadingInit] = useState(true);

    // Form states
    const [possuiAsaas, setPossuiAsaas] = useState(false);
    const [walletId, setWalletId] = useState('');
    const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
    const [nomeRazao, setNomeRazao] = useState('');
    const [email, setEmail] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [dadosBancarios, setDadosBancarios] = useState('');

    // Fleet state
    const [empresaId, setEmpresaId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchInitialData() {
            if (!session?.user?.id) return;
            try {
                const { data: perfil } = await supabase
                    .from('perfis')
                    .select('possui_conta_asaas, asaas_wallet_id, tipo_pessoa, recebimento_nome, recebimento_email, recebimento_cnpj, dados_bancarios, nome_completo, empresa_id')
                    .eq('id', session.user.id)
                    .single();

                if (perfil) {
                    setPossuiAsaas(perfil.possui_conta_asaas || false);
                    setWalletId(perfil.asaas_wallet_id || '');
                    setTipoPessoa(perfil.tipo_pessoa === 'PJ' ? 'PJ' : 'PF');
                    setNomeRazao(perfil.recebimento_nome || perfil.nome_completo || '');
                    setEmail(perfil.recebimento_email || session.user.email || '');
                    setCnpj(perfil.recebimento_cnpj || '');
                    setDadosBancarios(perfil.dados_bancarios || '');
                    setEmpresaId(perfil.empresa_id || null);
                }
            } finally {
                setLoadingInit(false);
            }
        }
        fetchInitialData();
    }, [session]);

    const handleCnpjChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        // Basic CNPJ mask: 00.000.000/0000-00
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        setCnpj(value);
    };

    const handleNext = async () => {
        // Se pertencer a uma frota, apenas avançamos sem validar ou salvar dados financeiros
        if (empresaId) {
            router.push('/(motorista)/onboarding/step3-documents');
            return;
        }

        if (possuiAsaas && !walletId) {
            Alert.alert('Atenção', 'Informe o seu Wallet ID do Asaas.');
            return;
        }
        if (!possuiAsaas) {
            if (!nomeRazao || !email || !dadosBancarios) {
                Alert.alert('Atenção', 'Preencha todos os dados bancários para recebimento.');
                return;
            }
            if (tipoPessoa === 'PJ' && !cnpj) {
                Alert.alert('Atenção', 'Informe o CNPJ da empresa.');
                return;
            }
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('perfis')
                .update({
                    possui_conta_asaas: possuiAsaas,
                    asaas_wallet_id: possuiAsaas ? walletId : null,
                    tipo_pessoa: tipoPessoa,
                    recebimento_nome: nomeRazao,
                    recebimento_email: email,
                    recebimento_cnpj: tipoPessoa === 'PJ' ? cnpj : null,
                    dados_bancarios: dadosBancarios,
                })
                .eq('id', session?.user?.id);

            if (error) throw error;

            // Assincronamente cria a subconta no Asaas (não trava a tela)
            if (!possuiAsaas && session?.user?.id) {
                supabase.functions.invoke('asaas-create-account', {
                    body: {
                        profileId: session.user.id,
                        name: nomeRazao,
                        email: email,
                        cpfCnpj: tipoPessoa === 'PJ' ? cnpj : '00000000000', // Update later if PF needs CPF
                        tipoPessoa,
                    }
                }).catch(err => console.error("Falha ao invocar edge function Asaas", err));
            }

            // Move to Step 3: Documents
            router.push('/(motorista)/onboarding/step3-documents');
        } catch (error: any) {
            console.error('Error saving payment info:', error);
            Alert.alert('Erro', 'Não foi possível salvar as configurações de recebimento.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingInit) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#111" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recebimentos</Text>
                    <Text style={styles.subtitle}>Configure como você deseja receber.</Text>
                </View>

                {empresaId ? (
                    <View style={styles.fleetCard}>
                        <Briefcase color="#111" size={32} style={{ marginBottom: 16 }} />
                        <Text style={styles.fleetTitle}>Perfil de Frota</Text>
                        <Text style={styles.fleetDescription}>
                            Você está vinculado a uma transportadora/empresa. Seus recebimentos são gerenciados diretamente pelo dono da frota.
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.card, { paddingBottom: 8 }]}>
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Já possui conta Asaas?</Text>
                            <Switch
                                value={possuiAsaas}
                                onValueChange={setPossuiAsaas}
                                trackColor={{ false: '#E5E7EB', true: '#111' }}
                                thumbColor="#FFF"
                            />
                        </View>

                        {possuiAsaas ? (
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>WALLET ID</Text>
                                <View style={styles.inputContainer}>
                                    <Wallet color="#9CA3AF" size={20} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Seu ID da carteira Asaas"
                                        placeholderTextColor="#9CA3AF"
                                        value={walletId}
                                        onChangeText={setWalletId}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.inputSection}>
                                <View style={styles.toggleRow}>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, tipoPessoa === 'PF' && styles.toggleButtonActive]}
                                        onPress={() => setTipoPessoa('PF')}
                                    >
                                        <Text style={[styles.toggleText, tipoPessoa === 'PF' && styles.toggleTextActive]}>Pessoa Física</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleButton, tipoPessoa === 'PJ' && styles.toggleButtonActive]}
                                        onPress={() => setTipoPessoa('PJ')}
                                    >
                                        <Text style={[styles.toggleText, tipoPessoa === 'PJ' && styles.toggleTextActive]}>Pessoa Jurídica</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>NOME / RAZÃO SOCIAL</Text>
                                <View style={styles.inputContainer}>
                                    <User color="#9CA3AF" size={20} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nome completo"
                                        placeholderTextColor="#9CA3AF"
                                        value={nomeRazao}
                                        onChangeText={setNomeRazao}
                                    />
                                </View>

                                <Text style={styles.label}>E-MAIL</Text>
                                <View style={styles.inputContainer}>
                                    <Mail color="#9CA3AF" size={20} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@exemplo.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                {tipoPessoa === 'PJ' && (
                                    <>
                                        <Text style={styles.label}>CNPJ</Text>
                                        <View style={styles.inputContainer}>
                                            <Briefcase color="#9CA3AF" size={20} style={styles.icon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="00.000.000/0000-00"
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="numeric"
                                                value={cnpj}
                                                onChangeText={handleCnpjChange}
                                                maxLength={18}
                                            />
                                        </View>
                                    </>
                                )}

                                <Text style={styles.label}>DADOS BANCÁRIOS</Text>
                                <View style={styles.inputContainer}>
                                    <CreditCard color="#9CA3AF" size={20} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Banco, Agência, Conta"
                                        placeholderTextColor="#9CA3AF"
                                        value={dadosBancarios}
                                        onChangeText={setDadosBancarios}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.nextButtonText}>{empresaId ? 'Continuar' : 'Finalizar Configuração'}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
        marginTop: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    fleetCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fleetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    fleetDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    inputSection: {
        marginTop: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 20,
        paddingHorizontal: 16,
        height: 52,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: '#111',
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    toggleTextActive: {
        color: '#FFF',
    },
    nextButton: {
        backgroundColor: '#111',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: Platform.OS === 'ios' ? 24 : 0,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
