import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, SafeAreaView } from 'react-native';

const { width, height } = Dimensions.get('window');
const TIMER_SECONDS = 30;

interface IncomingRideModalProps {
    ride: {
        id: string;
        origem_endereco: string;
        destino_endereco: string;
        valor: number;
        distancia_km: number;
        veiculo_modelo?: string;
    } | null;
    onAccept: (rideId: string) => void;
    onReject: (rideId: string) => void;
}

export default function IncomingRideModal({ ride, onAccept, onReject }: IncomingRideModalProps) {
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!ride) return;

        setTimeLeft(TIMER_SECONDS);
        scaleAnim.setValue(1);

        // Pulse animation for the timer circle
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
            ])
        ).start();

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onReject(ride.id); // Auto-reject on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [ride]);

    if (!ride) return null;

    return (
        <View style={styles.overlay}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Timer */}
                    <Animated.View style={[styles.timerCircle, { transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.timerText}>{timeLeft}s</Text>
                    </Animated.View>

                    <Text style={styles.title}>Nova Chamada!</Text>
                    <Text style={styles.subtitle}>Você tem um serviço próximo</Text>

                    {/* Origin destination context */}
                    <Text style={styles.addressText} numberOfLines={2}>📍 Destino: {ride.origem_endereco.split('-')[0]}</Text>

                    {/* Cards Row */}
                    <View style={styles.cardsRow}>
                        <View style={styles.infoCard}>
                            <Text style={styles.cardLabel}>DISTÂNCIA</Text>
                            <Text style={styles.cardValue}>{ride.distancia_km.toFixed(1).replace('.', ',')} km</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Text style={styles.cardLabel}>VEÍCULO</Text>
                            <Text style={styles.cardValue}>{ride.veiculo_modelo || 'Sedan'}</Text>
                        </View>
                        <View style={[styles.infoCard, styles.gainCard]}>
                            <Text style={styles.cardLabelGain}>GANHO</Text>
                            <Text style={styles.cardValueGain}>R$ {ride.valor.toFixed(0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.rejectBtn]} onPress={() => onReject(ride.id)}>
                        <Text style={styles.rejectText}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={() => onAccept(ride.id)}>
                        <Text style={styles.acceptText}>ACEITAR</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(28, 28, 30, 0.98)', // Liquid glass / dark theme
        zIndex: 9999,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    timerText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A1A1AA', // Zinc 400
        marginBottom: 32,
    },
    addressText: {
        fontSize: 14,
        color: '#D4D4D8',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#27272A', // Zinc 800
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gainCard: {
        backgroundColor: '#064E3B', // Emerald 900
        borderWidth: 0,
    },
    cardLabel: {
        fontSize: 10,
        color: '#A1A1AA',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    cardLabelGain: {
        fontSize: 10,
        color: '#34D399', // Emerald 400
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardValueGain: {
        fontSize: 18,
        fontWeight: '900',
        color: '#10B981', // Emerald 500
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 20,
    },
    button: {
        flex: 1,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtn: {
        backgroundColor: '#3F3F46', // Zinc 700
    },
    rejectText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptBtn: {
        backgroundColor: '#10B981', // Emerald 500
    },
    acceptText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '900',
    }
});
