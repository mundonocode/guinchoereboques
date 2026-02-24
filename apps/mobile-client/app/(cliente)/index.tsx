import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocation } from '../../src/hooks/useLocation';
import { MapPin, Search, Navigation, Phone, Truck, Tag, User } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRequestStore } from '../../store/useRequestStore';
import { supabase } from '../../src/lib/supabase';
import ChatModal from '../../src/components/ChatModal';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function HomeScreen() {
    const router = useRouter();
    const { session } = useAuth();
    const { destinationLat, destinationLng, destinationAddress, searching } = useLocalSearchParams();
    const { location, errorMsg, loading } = useLocation();

    const { currentRideId: storeRideId, setRequestDetails } = useRequestStore();

    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
    const [rideState, setRideState] = useState<'idle' | 'searching' | 'active'>('idle');
    const [currentRideId, setCurrentRideId] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const [rejectedDrivers, setRejectedDrivers] = useState<string[]>([]);

    // Chat state
    const [showChat, setShowChat] = useState(false);

    // UI state
    const [originAddressName, setOriginAddressName] = useState('Carregando...');

    // If we have search params, parse them to floats
    const destLat = destinationLat ? parseFloat(destinationLat as string) : null;
    const destLng = destinationLng ? parseFloat(destinationLng as string) : null;

    useEffect(() => {
        if (!location) return;
        let isMounted = true;
        const fetchAddress = async () => {
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (reverseGeocode && reverseGeocode.length > 0 && isMounted) {
                    const address = reverseGeocode[0];
                    const street = address.street || address.name || "Rua Desconhecida";
                    const number = address.streetNumber ? `, ${address.streetNumber}` : "";
                    const neighborhood = address.district ? ` - ${address.district}` : "";

                    setOriginAddressName(`${street}${number}${neighborhood}`);
                }
            } catch (err) {
                if (isMounted) setOriginAddressName(`Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`);
            }
        };
        fetchAddress();
        return () => { isMounted = false; };
    }, [location]);

    useEffect(() => {
        if (searching === 'true' && storeRideId && rideState === 'idle') {
            setCurrentRideId(storeRideId);
            setRideState('searching');
            findAndAssignDriver(storeRideId, []);
        }
    }, [searching, storeRideId, rideState]);

    useEffect(() => {
        if (!currentRideId || rideState === 'idle') return;

        console.log('Cliente subscribing to ride updates:', currentRideId);

        const subscription = supabase
            .channel(`ride_${currentRideId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'corridas',
                    filter: `id=eq.${currentRideId}`
                },
                async (payload) => {
                    console.log('Ride update received:', payload.new);
                    const updatedRide = payload.new;

                    if (updatedRide.status === 'aceita' || updatedRide.status === 'a_caminho') {
                        setRideState('active');
                        // Fetch driver details
                        // Fetch driver details including photo and vehicle info
                        const { data } = await supabase
                            .from('perfis')
                            .select(`
                                id,
                                nome_completo, 
                                telefone, 
                                foto_url,
                                avatar_url,
                                veiculos_guincho (
                                    placa,
                                    tipo,
                                    marca_modelo
                                )
                            `)
                            .eq('id', updatedRide.motorista_id)
                            .single();

                        if (data) {
                            // Format vehicle info if available
                            const vehicle = Array.isArray(data.veiculos_guincho)
                                ? data.veiculos_guincho[0]
                                : data.veiculos_guincho;

                            setDriverInfo({
                                ...data,
                                vehicle
                            });
                        }
                    } else if (updatedRide.status === 'rejeitada') {
                        // Driver rejected! Try to find another one.
                        console.log('Driver rejected the ride. Searching for next...');
                        const currentExcluded = [...rejectedDrivers, updatedRide.motorista_id];
                        setRejectedDrivers(currentExcluded);
                        findAndAssignDriver(updatedRide.id, currentExcluded);
                    } else if (updatedRide.status === 'finalizada') {
                        Alert.alert("Corrida Finalizada", "O reboque foi concluído com sucesso.");
                        setRideState('idle');
                        setCurrentRideId(null);
                        setDriverInfo(null);
                        router.replace('/(cliente)'); // Reset map
                    } else if (updatedRide.status === 'cancelada') {
                        Alert.alert("Corrida Cancelada", "O motorista cancelou o chamado.");
                        setRideState('idle');
                        setCurrentRideId(null);
                        setDriverInfo(null);
                        router.replace('/(cliente)'); // Reset map
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentRideId, rideState, rejectedDrivers]);

    const findAndAssignDriver = async (rideId: string, excludedIds: string[]) => {
        try {
            const { data: drivers, error: driverError } = await supabase
                .from('perfis')
                .select('id')
                .eq('role', 'motorista')
                .eq('is_online', true)
                .not('id', 'in', `(${excludedIds.join(',')})`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (driverError || !drivers || drivers.length === 0) {
                Alert.alert("Nenhum motorista", "Não há outros guinchos disponíveis no momento.");
                setRideState('idle');
                // Optional: mark ride as cancelled in DB
                await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', rideId);
                return;
            }

            const nextDriverId = drivers[0].id;

            // Update the ride with the new driver and reset status to 'buscando_motorista'
            const { error: updateError } = await supabase
                .from('corridas')
                .update({
                    motorista_id: nextDriverId,
                    status: 'buscando_motorista'
                })
                .eq('id', rideId);

            if (updateError) throw updateError;

            console.log('Reassigned ride to driver:', nextDriverId);

        } catch (error) {
            console.error('Error reassigning driver:', error);
            setRideState('idle');
        }
    };

    const handleConfirmRide = async () => {
        console.log("=== handleConfirmRide ===");
        console.log("State checks:", {
            hasLocation: !!location,
            destLat,
            destLng,
            hasRouteInfo: !!routeInfo,
            userId: session?.user?.id
        });

        if (!location || !destLat || !destLng || !routeInfo || !session?.user.id) {
            console.log("Missing required data, returning early from handleConfirmRide.");
            return;
        }

        console.log("Proceeding with geocoding...");
        let originAddress = `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`;
        try {
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode && reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                const street = address.street || address.name || "Rua Desconhecida";
                const number = address.streetNumber ? `, ${address.streetNumber}` : "";
                const neighborhood = address.district ? ` - ${address.district}` : "";
                const city = address.city ? ` - ${address.city}` : "";

                originAddress = `${street}${number}${neighborhood}${city}`;
            }
        } catch (geoError) {
            console.error('Reverse geocoding failed:', geoError);
        }

        setRequestDetails({
            origem: { latitude: location.coords.latitude, longitude: location.coords.longitude },
            destino: { latitude: destLat, longitude: destLng },
            enderecoOrigem: originAddress,
            enderecoDestino: destinationAddress as string,
            distanciaEstimadaKm: routeInfo.distance,
            // Calculate an estimated base price here since we removed the sheet
            precoEstimado: 150 + (routeInfo.distance * 5)
        });

        console.log('Pushing to: /(cliente)/request-details');
        try {
            router.push('/(cliente)/request-details' as any);
        } catch (err) {
            console.error('Error during routing:', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Buscando sua localização...</Text>
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
        // Default fallback (e.g., São Paulo center) if permissions fail gracefully
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <GestureHandlerRootView style={styles.container}>
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
                        title="Você está aqui"
                    >
                        <View style={styles.markerContainer}>
                            <MapPin size={24} color="#111827" fill="#3B82F6" />
                        </View>
                    </Marker>
                )}

                {destLat && destLng && (
                    <Marker
                        coordinate={{ latitude: destLat, longitude: destLng }}
                        title="Local de Destino"
                    >
                        <MapPin size={32} color="#111827" fill="#EF4444" />
                    </Marker>
                )}

                {location && destLat && destLng && GOOGLE_MAPS_API_KEY && (
                    <MapViewDirections
                        origin={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        destination={{
                            latitude: destLat,
                            longitude: destLng
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="#3B82F6"
                        optimizeWaypoints={true}
                        onReady={(result) => {
                            setRouteInfo({
                                distance: result.distance, // in km
                                duration: result.duration, // in min
                            });
                        }}
                        onError={(errorMessage) => {
                            console.error('Directions error:', errorMessage);
                        }}
                    />
                )}
            </MapView>

            {/* Top Floating Card (Origin & Destination) */}
            {rideState === 'idle' && (
                <View style={styles.topCard}>
                    <View style={styles.addressRow}>
                        <View style={styles.dotOrigin} />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.addressLabel}>ORIGEM (GPS)</Text>
                            <Text style={styles.addressText} numberOfLines={1}>{originAddressName}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.addressRow} onPress={() => router.push('/(cliente)/search')}>
                        <View style={styles.dotDestination} />
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.addressLabel}>DESTINO</Text>
                            <Text style={[styles.addressText, !destLat && { color: '#9CA3AF' }]} numberOfLines={1}>
                                {destLat ? (destinationAddress as string) : 'Para onde vamos levar seu veículo?'}
                            </Text>
                        </View>
                        <Search size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Searching Overlay */}
            {rideState === 'searching' && (
                <View style={styles.searchingOverlay}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.searchingTitle}>Procurando motoristas...</Text>
                    <Text style={styles.searchingSubtitle}>Enviando sua solicitação para o guincheiro mais próximo.</Text>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setRideState('idle')}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
                    </TouchableOpacity>
                </View>
            )
            }

            {/* Active Ride Overlay */}
            {
                rideState === 'active' && driverInfo && (
                    <View style={[styles.searchingOverlay, { padding: 0, overflow: 'hidden' }]}>
                        <View style={styles.driverHeader}>
                            <Text style={styles.driverStatusBar}>GUINCHEIRO A CAMINHO</Text>
                        </View>

                        <View style={styles.driverCardContent}>
                            <View style={styles.driverIdentityRow}>
                                {(driverInfo.foto_url || driverInfo.avatar_url) ? (
                                    <Image source={{ uri: driverInfo.foto_url || driverInfo.avatar_url }} style={styles.driverAvatar} />
                                ) : (
                                    <View style={[styles.driverAvatar, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                        <User size={32} color="#9CA3AF" />
                                    </View>
                                )}
                                <View style={styles.driverMainInfo}>
                                    <Text style={styles.driverNameText}>{driverInfo.nome_completo}</Text>
                                    <View style={styles.driverRatingRow}>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusBadgeText}>Especialista</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.phoneButton}
                                    onPress={() => Linking.openURL(`tel:${driverInfo.telefone}`)}
                                >
                                    <Phone size={24} color="#3B82F6" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.vehicleInfoSection}>
                                <View style={styles.vehicleInfoItem}>
                                    <View style={styles.iconCircle}>
                                        <Truck size={18} color="#4B5563" />
                                    </View>
                                    <View>
                                        <Text style={styles.vehicleLabel}>Veículo</Text>
                                        <Text style={styles.vehicleValue}>
                                            {driverInfo.vehicle?.marca_modelo || driverInfo.vehicle?.tipo || 'Guincho Plataforma'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.vehicleInfoItem}>
                                    <View style={styles.iconCircle}>
                                        <Tag size={18} color="#4B5563" />
                                    </View>
                                    <View>
                                        <Text style={styles.vehicleLabel}>Placa</Text>
                                        <Text style={styles.vehicleValue}>{driverInfo.vehicle?.placa || '---'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.chatButton}
                                    onPress={() => setShowChat(true)}
                                >
                                    <Text style={styles.chatButtonText}>Mensagem</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelRideButton}
                                    onPress={() => {
                                        Alert.alert(
                                            "Cancelar",
                                            "Deseja realmente cancelar seu chamado?",
                                            [
                                                { text: "Não", style: "cancel" },
                                                {
                                                    text: "Sim",
                                                    onPress: async () => {
                                                        await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', currentRideId);
                                                        setRideState('idle');
                                                        setCurrentRideId(null);
                                                        router.replace('/(cliente)');
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.cancelRideButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }
            {/* Render Bottom Fixed Button to request the ride */}
            {
                rideState === 'idle' && (
                    <View style={styles.bottomFixedContainer}>
                        <TouchableOpacity
                            style={styles.mainActionButton}
                            onPress={() => {
                                if (!destLat) {
                                    router.push('/(cliente)/search');
                                } else {
                                    handleConfirmRide();
                                }
                            }}
                        >
                            <Text style={styles.mainActionText}>Solicitar Guincho Agora</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

            {/* Chat Modal Layer */}
            {
                showChat && currentRideId && (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999, backgroundColor: '#FFF' }]}>
                        <ChatModal
                            corridaId={currentRideId}
                            onClose={() => setShowChat(false)}
                            isActive={rideState === 'active' || rideState === 'searching'}
                        />
                    </View>
                )
            }
        </GestureHandlerRootView >
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
    searchingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    searchingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    searchingSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    cancelButton: {
        backgroundColor: '#FEE2E2',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 16,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    driverPhone: {
        fontSize: 16,
        color: '#3B82F6',
        marginBottom: 20,
    },
    driverHeader: {
        width: '100%',
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        alignItems: 'center',
    },
    driverStatusBar: {
        fontSize: 12,
        fontWeight: '800',
        color: '#374151',
        letterSpacing: 1.2,
    },
    driverCardContent: {
        padding: 20,
        width: '100%',
    },
    driverIdentityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    driverAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    driverMainInfo: {
        flex: 1,
    },
    driverNameText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    driverRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 10,
        color: '#1E40AF',
        fontWeight: '700',
    },
    phoneButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleInfoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    vehicleInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    vehicleLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    vehicleValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '700',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    chatButton: {
        flex: 2,
        backgroundColor: '#111827',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    cancelRideButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelRideButtonText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 14,
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
    topCard: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dotOrigin: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3B82F6',
    },
    dotDestination: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 26,
        marginVertical: 14,
    },
    addressLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '700',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    bottomFixedContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    mainActionButton: {
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    mainActionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.5)',
    }
});
