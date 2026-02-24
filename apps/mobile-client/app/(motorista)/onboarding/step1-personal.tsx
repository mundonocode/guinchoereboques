import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/contexts/AuthContext';
import { ArrowRight, User, Phone, FileText, Truck, Shield, CreditCard } from 'lucide-react-native';

export default function Step1Personal() {
    const router = useRouter();
    const { session } = useAuth();

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cnhEar, setCnhEar] = useState('');

    // Vehicle data
    const [placa, setPlaca] = useState('');
    const [modelo, setModelo] = useState('');
    const [tipoPlataforma, setTipoPlataforma] = useState('');
    const [antt, setAntt] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchInitialData() {
            if (!session?.user?.id) return;
            const { data: perfil } = await supabase
                .from('perfis')
                .select('nome_completo, cpf, telefone')
                .eq('id', session.user.id)
                .single();

            if (perfil) {
                setNome(perfil.nome_completo || '');
                setCpf(perfil.cpf || '');
                setTelefone(perfil.telefone || '');
            }
        }
        fetchInitialData();
    }, [session]);

    const handleCpfChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setCpf(value);
    };

    const handlePhoneChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        setTelefone(value);
    };

    const handleNext = async () => {
        if (!nome || !cpf || !telefone || !placa || !modelo) {
            Alert.alert('Atenção', 'Por favor, preencha os campos obrigatórios (Nome, CPF, Celular, Placa e Modelo).');
            return;
        }

        setLoading(true);

        try {
            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('perfis')
                .update({
                    nome_completo: nome,
                    cpf: cpf,
                    telefone: telefone,
                    cnh_com_ear: cnhEar // Assuming this column exists or will be saved
                })
                .eq('id', session?.user?.id);

            if (profileError) throw profileError;

            // 2. Upsert Vehicle
            // First check if a vehicle exists
            const { data: existingVehicles } = await supabase
                .from('veiculos_guincho')
                .select('id')
                .eq('perfil_id', session?.user?.id);

            const vehicleData = {
                perfil_id: session?.user?.id!,
                placa: placa.toUpperCase(),
                marca_modelo: modelo,
                tipo_plataforma_v2: tipoPlataforma, // Standardized column name
                registro_antt: antt,
                status: 'ativo'
            };

            if (existingVehicles && existingVehicles.length > 0) {
                const { error: vehError } = await supabase
                    .from('veiculos_guincho')
                    .update(vehicleData)
                    .eq('id', existingVehicles[0].id);
                if (vehError) throw vehError;
            } else {
                const { error: vehError } = await supabase
                    .from('veiculos_guincho')
                    .insert([vehicleData]);
                if (vehError) throw vehError;
            }

            // Move to Step 2: Recebimentos
            router.push('/(motorista)/onboarding/step2-recebimentos');
        } catch (error: any) {
            console.error('Error saving professional info:', error);
            // Graceful message in case of missing columns
            Alert.alert('Erro', 'Não foi possível salvar todos os seus dados. Verifique a conexão ou se algum campo é inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Truck color="#FFF" size={24} />
                    </View>
                    <Text style={styles.title}>Cadastro Profissional</Text>
                    <Text style={styles.subtitle}>Seja um parceiro Guinchos e Reboques.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.sectionHeader}>Dados Pessoais</Text>

                    <Text style={styles.label}>NOME</Text>
                    <View style={styles.inputContainer}>
                        <User color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            placeholderTextColor="#9CA3AF"
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>

                    <Text style={styles.label}>CPF</Text>
                    <View style={styles.inputContainer}>
                        <FileText color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="000.000.000-00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={cpf}
                            onChangeText={handleCpfChange}
                            maxLength={14}
                        />
                    </View>

                    <Text style={styles.label}>CELULAR</Text>
                    <View style={styles.inputContainer}>
                        <Phone color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="(00) 00000-0000"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                            value={telefone}
                            onChangeText={handlePhoneChange}
                            maxLength={15}
                        />
                    </View>

                    <Text style={styles.label}>CNH COM EAR</Text>
                    <View style={styles.inputContainer}>
                        <Shield color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Número da CNH"
                            placeholderTextColor="#9CA3AF"
                            value={cnhEar}
                            onChangeText={setCnhEar}
                        />
                    </View>

                    <Text style={styles.sectionHeader}>Dados do Veículo</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>PLACA</Text>
                            <TextInput
                                style={styles.inputBasic}
                                placeholder="ABC-1234"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                value={placa}
                                onChangeText={setPlaca}
                                maxLength={8}
                            />
                        </View>
                        <View style={{ flex: 1.5 }}>
                            <Text style={styles.label}>MODELO</Text>
                            <TextInput
                                style={styles.inputBasic}
                                placeholder="Ex: VW Delivery"
                                placeholderTextColor="#9CA3AF"
                                value={modelo}
                                onChangeText={setModelo}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>TIPO DE PLATAFORMA</Text>
                    <View style={styles.inputContainer}>
                        <Truck color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Hidráulica, Lança..."
                            placeholderTextColor="#9CA3AF"
                            value={tipoPlataforma}
                            onChangeText={setTipoPlataforma}
                        />
                    </View>

                    <Text style={styles.label}>REGISTRO ANTT / RNTRC</Text>
                    <View style={styles.inputContainer}>
                        <CreditCard color="#9CA3AF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Número do registro"
                            placeholderTextColor="#9CA3AF"
                            value={antt}
                            onChangeText={setAntt}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.nextButtonText}>Continuar</Text>
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
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
    sectionHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginTop: 8,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    form: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 52,
    },
    inputBasic: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 15,
        color: '#111827',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
