import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArrowLeft, Truck, Plus, CheckCircle, Trash2 } from 'lucide-react-native';

interface Veiculo {
    id: string;
    placa: string;
    tipo: string;
    marca_modelo: string | null;
    ano: number | null;
    status: string | null;
}

export default function ManageVehiclesScreen() {
    const router = useRouter();
    const { session } = useAuth();

    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Add state Form
    const [isAdding, setIsAdding] = useState(false);
    const [placa, setPlaca] = useState('');
    const [tipo, setTipo] = useState('');
    const [marcaModelo, setMarcaModelo] = useState('');
    const [ano, setAno] = useState('');

    useEffect(() => {
        fetchVeiculos();
    }, []);

    const fetchVeiculos = async () => {
        if (!session?.user) return;
        try {
            const { data, error } = await supabase
                .from('veiculos_guincho')
                .select('*')
                .eq('perfil_id', session.user.id);

            if (error) throw error;
            setVeiculos(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            Alert.alert('Erro', 'Não foi possível carregar seus veículos.');
        } finally {
            setLoadingInit(false);
        }
    };

    const handleMarkActive = async (vehicleId: string) => {
        setIsProcessing(true);
        try {
            // First mark all vehicles of this user as inativo
            await supabase
                .from('veiculos_guincho')
                .update({ status: 'inativo' })
                .eq('perfil_id', session?.user.id);

            // Then mark the chosen one as ativo
            const { error } = await supabase
                .from('veiculos_guincho')
                .update({ status: 'ativo' })
                .eq('id', vehicleId);

            if (error) throw error;

            // Optimistic UI update
            setVeiculos(veiculos.map(v => ({
                ...v,
                status: v.id === vehicleId ? 'ativo' : 'inativo'
            })));
        } catch (error) {
            console.error('Error setting vehicle active:', error);
            Alert.alert('Erro', 'Falha ao definir como caminhão ativo. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = (vehicleId: string, isActive: boolean) => {
        if (veiculos.length === 1) {
            Alert.alert('Atenção', 'Você não pode excluir seu único veículo.');
            return;
        }

        Alert.alert(
            'Remover Veículo',
            'Tem certeza que deseja apagar este caminhão permanentemente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            const { error } = await supabase
                                .from('veiculos_guincho')
                                .delete()
                                .eq('id', vehicleId);

                            if (error) throw error;

                            const newList = veiculos.filter(v => v.id !== vehicleId);
                            setVeiculos(newList);

                            // If we deleted the active one, optionally set the first remaining as active
                            if (isActive && newList.length > 0) {
                                await handleMarkActive(newList[0].id);
                            }
                        } catch (error) {
                            console.error('Error deleting vehicle:', error);
                            Alert.alert('Erro', 'Não foi possível remover o veículo.');
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAddVehicle = async () => {
        if (!placa || !tipo) {
            Alert.alert('Atenção', 'Placa e Tipo do guincho são obrigatórios.');
            return;
        }

        setIsProcessing(true);
        try {
            const { data, error } = await supabase
                .from('veiculos_guincho')
                .insert([{
                    perfil_id: session?.user.id,
                    placa,
                    tipo,
                    marca_modelo: marcaModelo || null,
                    ano: ano ? parseInt(ano) : null,
                    status: 'inativo' // starts isolated
                }])
                .select()
                .single();

            if (error) throw error;

            setVeiculos([...veiculos, data]);

            // Clean
            setPlaca('');
            setTipo('');
            setMarcaModelo('');
            setAno('');
            setIsAdding(false);
        } catch (error) {
            console.error('Error saving new vehicle:', error);
            Alert.alert('Erro', 'Não foi possível salvar o veículo.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loadingInit) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.replace('/(motorista)/profile')} style={styles.backButton}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meus Veículos</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#111" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/(motorista)/profile')} style={styles.backButton} disabled={isProcessing}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meus Veículos</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {veiculos.map((v) => {
                        const isAtivo = v.status === 'ativo';
                        return (
                            <View key={v.id} style={[styles.vehicleCard, isAtivo && styles.vehicleCardActive]}>
                                <View style={styles.vehicleRow}>
                                    <View style={[styles.iconBox, isAtivo && styles.iconBoxActive]}>
                                        <Truck color={isAtivo ? '#FFF' : '#6B7280'} size={24} />
                                    </View>
                                    <View style={styles.vehicleInfo}>
                                        <Text style={styles.vehiclePlate}>{v.placa}</Text>
                                        <Text style={styles.vehicleType}>{v.tipo}</Text>
                                        {(v.marca_modelo || v.ano) && (
                                            <Text style={styles.vehicleDesc}>
                                                {v.marca_modelo} {v.ano ? `• ${v.ano}` : ''}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.actionsBox}>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(v.id, isAtivo)}
                                            style={styles.actionBtn}
                                            disabled={isProcessing}
                                        >
                                            <Trash2 size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.statusDivider} />

                                {isAtivo ? (
                                    <View style={styles.activePill}>
                                        <CheckCircle size={16} color="#111" />
                                        <Text style={styles.activeText}>Veículo Ativo e em uso hoje</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.makeActiveBtn}
                                        onPress={() => handleMarkActive(v.id)}
                                        disabled={isProcessing}
                                    >
                                        <Text style={styles.makeActiveBtnText}>Marcar como ativo agora</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {isAdding ? (
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Cadastrar Novo Caminhão</Text>

                            <Text style={styles.label}>Placa *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ABC-1234"
                                autoCapitalize="characters"
                                maxLength={7}
                                value={placa}
                                onChangeText={setPlaca}
                            />

                            <Text style={styles.label}>Tipo de Guincho *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Plataforma Prancha"
                                value={tipo}
                                onChangeText={setTipo}
                            />

                            <Text style={styles.label}>Marca / Modelo</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ford Cargo 815"
                                value={marcaModelo}
                                onChangeText={setMarcaModelo}
                            />

                            <Text style={styles.label}>Ano</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2015"
                                keyboardType="numeric"
                                maxLength={4}
                                value={ano}
                                onChangeText={setAno}
                            />

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setIsAdding(false)}
                                    disabled={isProcessing}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleAddVehicle}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveLocalButtonText}>Salvar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addMoreButton}
                            onPress={() => setIsAdding(true)}
                        >
                            <Plus color="#111" size={24} />
                            <Text style={styles.addMoreText}>Adicionar Caminhão</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
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
        flexGrow: 1,
        padding: 20,
    },
    vehicleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    vehicleCardActive: {
        borderColor: '#111',
        borderWidth: 2,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconBoxActive: {
        backgroundColor: '#111',
    },
    vehicleInfo: {
        flex: 1,
    },
    vehiclePlate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    vehicleType: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
        marginTop: 2,
    },
    vehicleDesc: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    actionsBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
    },
    statusDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DCFCE7',
        paddingVertical: 10,
        borderRadius: 8,
    },
    activeText: {
        color: '#166534',
        fontWeight: '600',
        marginLeft: 8,
    },
    makeActiveBtn: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    makeActiveBtnText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        height: 48,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#111827',
    },
    formActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginRight: 12,
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 8,
    },
    saveLocalButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#111',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    addMoreText: {
        color: '#111',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
