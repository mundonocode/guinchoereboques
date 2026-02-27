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
        veiculo_placa?: string;
        veiculo_cor?: string;
        veiculo_marca_modelo?: string;
        problema_descricao?: string;
        problema_tipo?: string;
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
                    {/* Timer Section */}
                    <View style={styles.headerSection}>
                        <Animated.View style={[styles.timerCircle, { transform: [{ scale: scaleAnim }] }]}>
                            <Text style={styles.timerText}>{timeLeft}s</Text>
                        </Animated.View>
                        <Text style={styles.title}>Nova Chamada!</Text>
                        <Text style={styles.subtitle}>Você tem um serviço próximo</Text>
                    </View>

                    {/* Route Section */}
                    <View style={styles.glassContainer}>
                        <View style={styles.routeContainer}>
                            <View style={styles.routeIndicators}>
                                <View style={styles.dotOrigin} />
                                <View style={styles.routeLine} />
                                <View style={styles.dotDestination} />
                            </View>
                            <View style={styles.addressInfo}>
                                <View style={styles.addressBlock}>
                                    <Text style={styles.addressLabel}>RETIRADA</Text>
                                    <Text style={styles.addressText} numberOfLines={2}>{ride.origem_endereco}</Text>
                                </View>
                                <View style={[styles.addressBlock, { marginTop: 16 }]}>
                                    <Text style={styles.addressLabel}>DESTINO</Text>
                                    <Text style={styles.addressText} numberOfLines={2}>{ride.destino_endereco}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats & Details Grid */}
                    <View style={styles.gridRow}>
                        <View style={[styles.glassCard, { flex: 1 }]}>
                            <Text style={styles.cardLabel}>DISTÂNCIA</Text>
                            <Text style={styles.cardValue}>{ride.distancia_km.toFixed(1).replace('.', ',')} km</Text>
                        </View>
                        <View style={[styles.glassCard, styles.gainCard, { flex: 1 }]}>
                            <Text style={styles.cardLabelGain}>GANHO ESTIMADO</Text>
                            <Text style={styles.cardValueGain}>R$ {ride.valor.toFixed(0)}</Text>
                        </View>
                    </View>

                    {/* Vehicle & Problem Detail */}
                    <View style={[styles.glassContainer, { marginTop: 16 }]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>VEÍCULO</Text>
                            <Text style={styles.detailValue}>
                                <Text style={{ fontWeight: '700' }}>{ride.veiculo_marca_modelo || 'Não informado'}</Text>
                                {'\n'}
                                <Text style={{ color: '#A1A1AA', fontSize: 12 }}>{ride.veiculo_cor || 'N/A'} • {ride.veiculo_placa || 'Sem placa'}</Text>
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>PROBLEMA</Text>
                            <Text style={styles.detailValue}>
                                <Text style={{ fontWeight: '700', color: '#EF4444' }}>{ride.problema_tipo || 'Pane'}</Text>
                                {'\n'}
                                <Text style={{ fontSize: 13, color: '#D4D4D8' }}>{ride.problema_descricao || 'Sem descrição adicional.'}</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.rejectBtn]} onPress={() => onReject(ride.id)}>
                        <Text style={styles.rejectText}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={() => onAccept(ride.id)}>
                        <Text style={styles.acceptText}>ACEITAR AGORA</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(18, 18, 20, 0.98)', // Even darker background
        zIndex: 9999,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24, // Wider margins
        paddingBottom: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    timerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    timerText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#A1A1AA',
        textAlign: 'center',
        marginTop: 4,
    },
    glassContainer: {
        backgroundColor: 'rgba(39, 39, 42, 0.6)', // Glass effect
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    routeContainer: {
        flexDirection: 'row',
    },
    routeIndicators: {
        width: 20,
        alignItems: 'center',
        paddingVertical: 6,
    },
    dotOrigin: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444', // Red for origin
    },
    routeLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 4,
    },
    dotDestination: {
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: '#10B981', // Green for destination
    },
    addressInfo: {
        flex: 1,
        marginLeft: 12,
    },
    addressBlock: {
        justifyContent: 'center',
    },
    addressLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#71717A', // Zinc 400
        letterSpacing: 1,
        marginBottom: 2,
    },
    addressText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
        lineHeight: 20,
    },
    gridRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    glassCard: {
        backgroundColor: 'rgba(39, 39, 42, 0.6)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    gainCard: {
        backgroundColor: 'rgba(6, 78, 59, 0.4)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    cardLabel: {
        fontSize: 9,
        color: '#A1A1AA',
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    cardLabelGain: {
        fontSize: 9,
        color: '#34D399',
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    cardValueGain: {
        fontSize: 20,
        fontWeight: '900',
        color: '#10B981',
    },
    detailItem: {
        paddingVertical: 2,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#71717A',
        letterSpacing: 1,
        marginBottom: 6,
    },
    detailValue: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 8,
    },
    button: {
        flex: 1,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectBtn: {
        backgroundColor: '#27272A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    rejectText: {
        color: '#A1A1AA',
        fontSize: 16,
        fontWeight: '700',
    },
    acceptBtn: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    acceptText: {
        color: '#052E16',
        fontSize: 18,
        fontWeight: '900',
    }
});
