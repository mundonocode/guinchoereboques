import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Truck, Car, Bike, AlertCircle } from 'lucide-react-native';

interface BottomSheetProps {
    onVehicleSelect: (type: string) => void;
    onConfirmRide: (type: string, finalPrice: number) => void;
    distanceKm?: number;
}

const PRICING_RULES = {
    MOTO: { base: 80, perKm: 3 },
    LEVE: { base: 100, perKm: 5 },
    PESADO: { base: 180, perKm: 8 },
};

export function BottomSheetGuincho({ onVehicleSelect, onConfirmRide, distanceKm = 0 }: BottomSheetProps) {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    // Calculate prices based on distance for each type
    const calculatePrice = (type: keyof typeof PRICING_RULES) => {
        const rules = PRICING_RULES[type];
        const total = rules.base + (rules.perKm * distanceKm);
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    const handleSelect = (type: string) => {
        setSelectedType(type);
        onVehicleSelect(type);
    };

    const handleConfirm = () => {
        if (selectedType) {
            const typeKey = selectedType.toUpperCase() as keyof typeof PRICING_RULES;
            const rules = PRICING_RULES[typeKey];
            const finalPrice = rules.base + (rules.perKm * distanceKm);
            onConfirmRide(selectedType, finalPrice);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Escolha o tipo de Guincho</Text>
                    <Text style={styles.subtitle}>Encontraremos o motorista mais próximo de você.</Text>
                </View>

                <ScrollView contentContainerStyle={styles.vehicleOptionsContainer}>
                    <TouchableOpacity
                        style={[styles.vehicleCard, selectedType === 'moto' && styles.selectedCard]}
                        onPress={() => handleSelect('moto')}
                    >
                        <Bike size={32} color={selectedType === 'moto' ? '#111827' : '#6B7280'} />
                        <Text style={[styles.vehicleType, selectedType === 'moto' && styles.selectedText]}>
                            Moto
                        </Text>
                        <Text style={styles.vehiclePrice}>{calculatePrice('MOTO')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.vehicleCard, selectedType === 'leve' && styles.selectedCard]}
                        onPress={() => handleSelect('leve')}
                    >
                        <Car size={32} color={selectedType === 'leve' ? '#111827' : '#6B7280'} />
                        <Text style={[styles.vehicleType, selectedType === 'leve' && styles.selectedText]}>
                            Leve
                        </Text>
                        <Text style={styles.vehicleDesc}>Carros de passeio</Text>
                        <Text style={styles.vehiclePrice}>{calculatePrice('LEVE')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.vehicleCard, selectedType === 'pesado' && styles.selectedCard]}
                        onPress={() => handleSelect('pesado')}
                    >
                        <Truck size={32} color={selectedType === 'pesado' ? '#111827' : '#6B7280'} />
                        <Text style={[styles.vehicleType, selectedType === 'pesado' && styles.selectedText]}>
                            Pesado
                        </Text>
                        <Text style={styles.vehicleDesc}>Caminhões, Vans</Text>
                        <Text style={styles.vehiclePrice}>{calculatePrice('PESADO')}</Text>
                    </TouchableOpacity>
                </ScrollView>

                <View style={styles.distanceBadge}>
                    <AlertCircle size={14} color="#6B7280" />
                    <Text style={styles.distanceText}>
                        Trajeto estipulado em {distanceKm.toFixed(1).replace('.', ',')} km
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, !selectedType && styles.disabledButton]}
                    onPress={handleConfirm}
                    disabled={!selectedType}
                >
                    <Text style={styles.confirmButtonText}>
                        Confirmar Guincho
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    vehicleOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 20,
    },
    vehicleCard: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 10,
        width: '30%', // Adjust width for 3 cards in a row
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#111827',
        backgroundColor: '#F3F4F6',
    },
    vehicleType: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    vehicleDesc: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
        textAlign: 'center',
    },
    vehiclePrice: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    selectedText: {
        color: '#111827',
    },
    confirmButton: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        borderRadius: 8,
    },
    distanceText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
        fontWeight: '500',
    }
});
