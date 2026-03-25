import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLocation } from '../../src/hooks/useLocation';
import { Truck, AlertTriangle, Power, Star, X } from 'lucide-react-native';
import IncomingRideModal from '../../src/components/IncomingRideModal';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const { width, height } = Dimensions.get('window');

export default function MotoristaHomeScreen() {
    const router = useRouter();
    const { session } = useAuth();
    const { location, errorMsg, loading } = useLocation();

    const [isOnline, setIsOnline] = useState(false);
    const [isActiveProfile, setIsActiveProfile] = useState<boolean | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [incomingRide, setIncomingRide] = useState<any>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [showFeedback, setShowFeedback] = useState<{ nota: number, comentario: string | null } | null>(null);

    useEffect(() => {
        if (!session?.user?.id) return;

        console.log('Iniciando listener de avaliações para:', session.user.id);
        const channel = supabase
            .channel('driver_feedback')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'avaliacoes',
                    filter: `avaliado_id=eq.${session.user.id}`,
                },
                (payload) => {
                    console.log('Novo feedback recebido:', payload.new);
                    setShowFeedback({
                        nota: payload.new.nota,
                        comentario: payload.new.comentario
                    });

                    // Auto hide after 10 seconds
                    setTimeout(() => setShowFeedback(null), 10000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id]);

    useEffect(() => {
        setupNotifications();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    async function setupNotifications() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
    }

    async function playNotificationSound() {
        try {
            // Unload previous sound if exists
            if (sound) {
                await sound.unloadAsync();
            }

            // Using a more robust sound URL for testing. 
            // In a real app, you should place a file in assets/sounds/notification.mp3 and use:
            // const { sound: newSound } = await Audio.Sound.createAsync(require('../../assets/sounds/notification.mp3'));
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: 'https://www.soundjay.com/buttons/beep-07.mp3' },
                { shouldPlay: true }
            );
            setSound(newSound);
        } catch (error) {
            console.log('Playback error:', error);
        }
    }

    async function sendLocalNotification(ride: any) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🚚 Nova Corrida Disponível!",
                body: `Ganho de R$ ${ride.valor.toFixed(2).replace('.', ',')}. Toque para ver detalhes.`,
                data: { rideId: ride.id },
                sound: true,
            },
            trigger: null, // immediate
        });
    }

    useEffect(() => {
        async function checkApprovalStatus() {
            if (!session?.user) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('is_active, onboarding_completo')
                    .eq('id', session.user.id)
                    .single();

                if (!error && data) {
                    setIsActiveProfile(data.is_active);

                    // Se o cadastro estiver incompleto ou a conta não estiver ativa, 
                    // garantimos que o motorista fique offline para não receber chamados.
                    if (data.onboarding_completo === false || data.is_active === false) {
                        setIsOnline(false);
                        await supabase.from('perfis').update({ is_online: false }).eq('id', session.user.id);
                    }

                    // Redirecionamento baseado no campo específico de onboarding
                    if (data.onboarding_completo === false || data.onboarding_completo === null) {
                        router.replace('/(motorista)/onboarding/step1-personal');
                    }
                }
            } catch (err) {
                console.error('Error fetching profile approval status', err);
            } finally {
                setLoadingProfile(false);
            }
        }
        checkApprovalStatus();
    }, [session]);

    // Realtime Subscription for incoming rides
    useEffect(() => {
        if (!session?.user || !isOnline) return;

        // 1. Fetch any pending rides that were created while offline
        async function fetchPendingRide() {
            const { data, error } = await supabase
                .from('corridas')
                .select('*')
                .eq('motorista_id', session!.user.id)
                .eq('status', 'buscando_motorista')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data && !error) {
                console.log('Fetched pending ride:', data);
                setIncomingRide(data);
                playNotificationSound();
                sendLocalNotification(data);
            }
        }

        // 2. Fetch any ALREADY active ride to restore session
        async function checkActiveRide() {
            const { data, error } = await supabase
                .from('corridas')
                .select('id, status')
                .eq('motorista_id', session!.user.id)
                .in('status', ['aceita', 'a_caminho', 'no_local', 'em_rota_destino'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data && !error) {
                console.log('Driver has active ride, restoring session...', data.id);
                router.replace(`/(motorista)/active-ride/${data.id}`);
            }
        }

        fetchPendingRide();
        checkActiveRide();

        console.log('Obtaining Realtime Subscription for corridas...');

        const channel = supabase
            .channel('driver_rides')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // Could be UPDATE if we reuse rows and change motorista_id
                    schema: 'public',
                    table: 'corridas',
                    filter: `motorista_id=eq.${session.user.id}`,
                },
                (payload) => {
                    if (payload.new.status === 'buscando_motorista') {
                        setIncomingRide(payload.new);
                        playNotificationSound();
                        sendLocalNotification(payload.new);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'corridas',
                    filter: `motorista_id=eq.${session.user.id}`,
                },
                (payload) => {
                    if (payload.new.status === 'buscando_motorista') {
                        setIncomingRide(payload.new);
                        playNotificationSound();
                        sendLocalNotification(payload.new);
                    } else if (payload.new.status === 'rejeitada' || payload.new.status === 'cancelada') {
                        // Clear the modal if it was rejected or cancelled
                        setIncomingRide(null);
                    } else {
                        // If it got accepted by someone else somehow (unlikely in this MVP)
                        setIncomingRide(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, isOnline]);

    const handleAcceptRide = async (rideId: string) => {
        console.log('Accepting ride:', rideId, 'as driver:', session?.user?.id);
        
        try {
            // First, double check the ride status to avoid race conditions
            const { data: currentRide, error: fetchError } = await supabase
                .from('corridas')
                .select('status, motorista_id')
                .eq('id', rideId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (!currentRide) {
                Alert.alert('Aviso', 'Esta corrida não existe mais.');
                setIncomingRide(null);
                return;
            }

            // Se já estiver aceita por MIM, apenas navegamos
            if (currentRide.status === 'aceita' && currentRide.motorista_id === session?.user?.id) {
                console.log('Ride already accepted by this driver, navigating...');
                setIncomingRide(null);
                setIsOnline(false);
                router.push(`/(motorista)/active-ride/${rideId}`);
                return;
            }

            if (currentRide.status !== 'buscando_motorista') {
                Alert.alert('Aviso', 'Esta corrida já foi aceita ou cancelada.');
                setIncomingRide(null);
                return;
            }

            const { error, data } = await supabase
                .from('corridas')
                .update({ status: 'aceita' })
                .eq('id', rideId)
                .eq('motorista_id', session?.user?.id)
                .select();

            if (error) {
                console.error('Supabase error updating ride:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Não foi possível atualizar a corrida. Verifique sua conexão.');
            }

            setIncomingRide(null);
            setIsOnline(false); // Go offline for new rides while executing this one
            router.push(`/(motorista)/active-ride/${rideId}`);
        } catch (err: any) {
            console.error('Failed to accept ride. Detail:', err?.message || err);
            Alert.alert('Erro', 'Não foi possível aceitar a corrida: ' + (err?.message || 'Erro interno'));
            setIncomingRide(null);
        }
    };

    const handleRejectRide = async (rideId: string) => {
        try {
            // Updated rejection logic: 
            // We set status to 'rejeitada' so the client can catch it and search for another driver.
            const { error } = await supabase
                .from('corridas')
                .update({ status: 'rejeitada' })
                .eq('id', rideId)
                .eq('motorista_id', session?.user?.id); // Ensure we only reject our own assigned rides

            if (error) throw error;
        } catch (err) {
            console.error('Failed to reject ride', err);
        } finally {
            setIncomingRide(null);
        }
    };

    const toggleOnlineStatus = async () => {
        if (isActiveProfile === null) {
            Alert.alert(
                'Complete seu Cadastro',
                'Você precisa enviar seus dados antes de ficar online.',
                [
                    { text: 'Agora Não', style: 'cancel' },
                    { text: 'Completar Cadastro', onPress: () => router.push('/(motorista)/onboarding/step1-personal') }
                ]
            );
            return;
        }
        if (isActiveProfile === false) {
            Alert.alert('Conta em Análise', 'Seus dados já foram enviados e nossa equipe está analisando.');
            return;
        }

        const newStatus = !isOnline;

        // Apply Animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setIsOnline(newStatus);
        if (session?.user) {
            await supabase.from('perfis').update({ is_online: newStatus }).eq('id', session.user.id);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.loadingText}>Conectando GPS...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    const userRegion = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    } : {
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={userRegion}
                showsUserLocation={false}
                showsMyLocationButton={true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        title="Seu Guincho"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={[styles.markerContainer, isOnline ? styles.markerOnline : styles.markerOffline]}>
                            <RNImage
                                source={require('../../assets/images/marker-guincho.png')}
                                style={styles.markerImage}
                                resizeMode="cover"
                            />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View style={[styles.topStatusPill, isOnline && styles.topStatusPillOnline]}>
                <View style={[styles.statusIndicator, isOnline ? styles.indicatorOnline : styles.indicatorOffline]} />
                <Text style={[styles.topStatusText, isOnline && { color: '#FFF' }]}>
                    {isOnline ? 'Online' : 'Você está offline'}
                </Text>
            </View>

            {isActiveProfile === null && !loadingProfile && (
                <TouchableOpacity
                    style={styles.pendingBar}
                    onPress={() => router.push('/(motorista)/onboarding/step1-personal')}
                >
                    <AlertTriangle color="#B45309" size={20} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.pendingBarTitle}>Cadastro Incompleto</Text>
                        <Text style={styles.pendingBarSubtitle}>Toque para concluir.</Text>
                    </View>
                </TouchableOpacity>
            )}

            {isActiveProfile === false && !loadingProfile && (
                <View style={[styles.pendingBar, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                    <AlertTriangle color="#DC2626" size={20} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.pendingBarTitle, { color: '#991B1B' }]}>Em Análise</Text>
                        <Text style={[styles.pendingBarSubtitle, { color: '#B91C1C' }]}>Aguarde a verificação.</Text>
                    </View>
                </View>
            )}

            {/* Dynamic Bottom UI */}
            <View style={[styles.bottomSheet, isOnline && styles.bottomSheetMinimized]}>
                {!isOnline ? (
                    <>
                        <Text style={styles.sheetTitle}>Offline</Text>
                        <Text style={styles.sheetSubtitle}>Fique online para começar a trabalhar</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.buttonOnline, isActiveProfile !== true && styles.buttonDisabled]}
                            onPress={toggleOnlineStatus}
                        >
                            <Text style={styles.actionButtonText}>Ficar Online</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.minimizedContainer}>
                        <View style={styles.minimizedInfo}>
                            <Power size={16} color="#111" />
                            <Text style={styles.minimizedText}>Aguardando Chamados...</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.offlineSmallButton}
                            onPress={toggleOnlineStatus}
                        >
                            <Text style={styles.offlineSmallText}>Ficar Offline</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {incomingRide && (
                <IncomingRideModal
                    ride={incomingRide}
                    onAccept={handleAcceptRide}
                    onReject={handleRejectRide}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: width,
        height: height,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        color: '#6B7280',
        fontSize: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    topStatusPillOffline: {
        backgroundColor: '#F3F4F6',
    },
    topStatusPill: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
    },
    topStatusPillOnline: {
        backgroundColor: '#111',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    indicatorOnline: {
        backgroundColor: '#4ade80',
    },
    indicatorOffline: {
        backgroundColor: '#9CA3AF',
    },
    topStatusText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: 'bold',
    },
    pendingBar: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
        elevation: 3,
    },
    pendingBarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400E',
    },
    pendingBarSubtitle: {
        fontSize: 12,
        color: '#B45309',
        marginTop: 2,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 24, // Sits right above the bottom tabs natively
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    bottomSheetMinimized: {
        padding: 12,
        borderRadius: 40,
        bottom: 16,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    sheetSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    actionButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOnline: {
        backgroundColor: '#111',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    minimizedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
    },
    minimizedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    minimizedText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginLeft: 8,
    },
    offlineSmallButton: {
        backgroundColor: '#FEF2F2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    offlineSmallText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 13,
    },
    markerContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    markerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    markerOnline: {
        borderColor: '#10B981',
    },
    markerOffline: {
        borderColor: '#6B7280',
    },
});
