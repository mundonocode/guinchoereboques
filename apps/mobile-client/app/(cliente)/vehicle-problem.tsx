import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useRequestStore } from '../../store/useRequestStore';

export default function VehicleProblemScreen() {
    const router = useRouter();
    const { requestDetails, setRequestDetails } = useRequestStore();

    // Default to the first option or the previously selected one
    const [selectedProblem, setSelectedProblem] = useState(requestDetails.problemaTipo || '');

    const problemTypes = [
        'Parou de Funcionar',
        'Capotado',
        'Problema na Roda',
        'Câmbio Travado',
        'Sem Rodas (Furto)',
        'Nenhuma das Opções'
    ];

    const handleContinue = () => {
        if (!selectedProblem) return;
        setRequestDetails({ ...requestDetails, problemaTipo: selectedProblem });
        router.push('/(cliente)/location-type');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>O que houve com o veículo?</Text>

                <View style={styles.optionsContainer}>
                    {problemTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.optionButton,
                                selectedProblem === type && styles.optionButtonSelected
                            ]}
                            onPress={() => setSelectedProblem(type)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.optionText,
                                selectedProblem === type && styles.optionTextSelected
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !selectedProblem && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedProblem}
                >
                    <Text style={[styles.buttonText, !selectedProblem && styles.buttonTextDisabled]}>
                        Continuar
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#111',
    },
    backButton: {
        padding: 4,
        backgroundColor: 'transparent',
    },
    container: {
        padding: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: '500',
        color: '#111',
        marginBottom: 32,
    },
    optionsContainer: {
        width: '100%',
        gap: 12,
    },
    optionButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    optionButtonSelected: {
        borderWidth: 2,
        borderColor: '#111',
        backgroundColor: '#111',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    optionTextSelected: {
        color: '#FFF',
    },
    footer: {
        padding: 24,
        backgroundColor: '#F3F4F6',
    },
    button: {
        backgroundColor: '#111',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonTextDisabled: {
        color: '#9CA3AF',
    }
});
