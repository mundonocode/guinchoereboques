import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car } from 'lucide-react-native';
import { useRequestStore } from '../../store/useRequestStore';

export default function RequestDetailsScreen() {
    const router = useRouter();
    const { requestDetails, setRequestDetails } = useRequestStore();

    const [placa, setPlaca] = useState(requestDetails.placa || '');
    const [cor, setCor] = useState(requestDetails.cor || '');
    const [marcaModelo, setMarcaModelo] = useState(requestDetails.marcaModelo || '');
    const [problemaDescricao, setProblemaDescricao] = useState(requestDetails.problemaDescricao || '');
    const [problemaTipo, setProblemaTipo] = useState(requestDetails.problemaTipo || '');

    const problemTypes = ['Pane Mecânica', 'Colisão', 'Pneu Furado', 'Falta de Combustível'];

    const handleConfirm = () => {
        setRequestDetails({
            placa,
            cor,
            marcaModelo,
            problemaDescricao,
            problemaTipo
        });
        router.push('/(cliente)/request-payment');
    };

    const isFormValid = placa && cor && marcaModelo && problemaTipo;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes do Veículo</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.infoBanner}>
                    <View style={styles.iconCircle}>
                        <Car size={32} color="#9CA3AF" />
                    </View>
                    <Text style={styles.infoBannerText}>Informações do veículo em pane</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>PLACA</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ABC-1234"
                            value={placa}
                            onChangeText={setPlaca}
                            autoCapitalize="characters"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>COR</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Prata"
                            value={cor}
                            onChangeText={setCor}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>MARCA/MODELO</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Toyota Corolla"
                        value={marcaModelo}
                        onChangeText={setMarcaModelo}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>DESCRIÇÃO DO PROBLEMA</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Ex: O carro parou de funcionar do nada, fumaça no motor..."
                        value={problemaDescricao}
                        onChangeText={setProblemaDescricao}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.chipsContainer}>
                    {problemTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                problemaTipo === type && styles.chipSelected
                            ]}
                            onPress={() => setProblemaTipo(type)}
                        >
                            <Text style={[
                                styles.chipText,
                                problemaTipo === type && styles.chipTextSelected
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !isFormValid && styles.buttonDisabled]}
                    onPress={handleConfirm}
                    disabled={!isFormValid}
                >
                    <Text style={styles.buttonText}>Confirmar Detalhes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    infoBanner: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoBannerText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#111827',
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
        marginBottom: 40,
    },
    chip: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    chipSelected: {
        backgroundColor: '#F3F4F6',
        borderColor: '#111827',
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#111827',
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    button: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    }
});
