import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Linking, Platform, Image as RNImage } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { supabase } from '../../../src/lib/supabase';
import { useLocation } from '../../../src/hooks/useLocation';
import { MapPin, Navigation, CheckCircle, Truck, Phone, AlertTriangle, MessageSquare } from 'lucide-react-native';
import ChatModal from '../../../src/components/ChatModal';

const { width, height } = Dimensions.get('window');
// Using the same env variable but ensure your Google Maps API key has Directions API enabled
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

type RideStatus = 'aceita' | 'a_caminho' | 'no_local' | 'em_rota_destino' | 'finalizada' | 'cancelada';

export default function ActiveRideScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { location } = useLocation();

    const [ride, setRide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [isNearDestination, setIsNearDestination] = useState(false);

    // Chat state
    const [showChat, setShowChat] = useState(false);

    // Calculate distance between two coordinates in meters
    const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (location && ride && ride.status === 'em_rota_destino') {
            const distance = getDistanceInMeters(
                location.coords.latitude,
                location.coords.longitude,
                ride.destino_lat,
                ride.destino_lng
            );
            // Threshold: 200 meters
            setIsNearDestination(distance <= 200);
        } else {
            // For other statuses or if location/ride missing, don't worry about this flag
            setIsNearDestination(true);
        }
    }, [location, ride?.status]);

    useEffect(() => {
        fetchRideDetails();

        // Real-time subscription for external status changes (e.g. manual finalize or client cancel)
        const channel = supabase
            .channel(`ride_status_${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'corridas',
                    filter: `id=eq.${id}`,
                },
                (payload) => {
                    console.log('Update de status recebido via Realtime:', payload.new.status);
                    const newStatus = payload.new.status;
                    
                    // Always update local state first so UI reacts immediately
                    setRide(payload.new as any);

                    if (newStatus === 'finalizada' && ride?.status !== 'finalizada') {
                        Alert.alert('Corrida Finalizada', 'Esta corrida foi concluída com sucesso.', [
                            { text: 'OK', onPress: () => router.replace('/(motorista)') }
                        ]);
                    } else if (newStatus === 'cancelada') {
                        Alert.alert('Corrida Cancelada', 'Esta corrida foi cancelada pelo cliente ou sistema.', [
                            { text: 'OK', onPress: () => router.replace('/(motorista)') }
                        ]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, ride?.status]);

    const fetchRideDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('corridas')
                .select(`
                    *,
                    cliente:perfis!corridas_cliente_id_fkey(nome_completo, telefone)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setRide(data);
        } catch (error) {
            console.error('Error fetching ride details:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da corrida.');
            router.replace('/(motorista)');
        } finally {
            setLoading(false);
        }
    };

    const updateRideStatus = async (newStatus: RideStatus) => {
        setStatusUpdating(true);
        try {
            const { error } = await supabase
                .from('corridas')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRide((prev: any) => ({ ...prev, status: newStatus }));

            if (newStatus === 'finalizada') {
                Alert.alert('Sucesso', 'Corrida finalizada com sucesso! Bom trabalho.', [
                    { text: 'OK', onPress: () => router.replace('/(motorista)') }
                ]);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Erro', 'Ocorreu um problema ao atualizar o status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const openGPS = () => {
        if (!ride) return;
        // Se estiver indo pro cliente, usa origem_lat/lng. Se no reboque, usa destino_lat/lng.
        const isGoingToClient = ['aceita', 'a_caminho'].includes(ride.status);
        const lat = isGoingToClient ? ride.origem_lat : ride.destino_lat;
        const lng = isGoingToClient ? ride.origem_lng : ride.destino_lng;

        // Tenta abrir o Waze primariamente como um atalho rápido
        const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        Linking.openURL(url).catch(() => {
            // Fallback to Google Maps or Apple Maps depending on OS (just a generic geo URI block here for MVP)
            Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
        });
    };

    const callClient = () => {
        if (!ride?.cliente?.telefone) return;
        Linking.openURL(`tel:${ride.cliente.telefone}`);
    };

    if (loading || !ride) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.loadingText}>Carregando corrida...</Text>
            </View>
        );
    }

    // Determine target location for map
    const isGoingToClient = ['aceita', 'a_caminho'].includes(ride.status);
    const targetLat = isGoingToClient ? ride.origem_lat : ride.destino_lat;
    const targetLng = isGoingToClient ? ride.origem_lng : ride.destino_lng;

    // A fallback center if coordinates don't exist in DB (they should)
    const initialRegion = {
        latitude: targetLat || location?.coords.latitude || -23.5505,
        longitude: targetLng || location?.coords.longitude || -46.6333,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        title="Minha Localização"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.driverMarkerContainer}>
                            <RNImage
                                source={require('../../../assets/images/marker-guincho.png')}
                                style={styles.markerImage}
                                resizeMode="cover"
                            />
                        </View>
                    </Marker>
                )}

                {targetLat && targetLng && (
                    <Marker
                        coordinate={{ latitude: targetLat, longitude: targetLng }}
                        title={isGoingToClient ? 'Local do Cliente' : 'Destino'}
                    >
                        <View style={styles.targetMarker}>
                            <MapPin size={24} color="#FFF" />
                        </View>
                    </Marker>
                )}

                {location && targetLat && targetLng && GOOGLE_MAPS_API_KEY && (
                    <MapViewDirections
                        origin={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        destination={{
                            latitude: targetLat,
                            longitude: targetLng
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="#111827"
                        optimizeWaypoints={true}
                        language="pt-BR"
                        mode="DRIVING"
                        onError={(errorMessage) => {
                            console.log('Error displaying route: ', errorMessage);
                            // It's common to have API key restrictions blocking this on dev, don't crash the app
                        }}
                    />
                )}
            </MapView>

            <View style={styles.topCard}>
                <Text style={styles.clientName}>{ride.cliente?.nome_completo || 'Cliente'}</Text>
                <Text style={styles.statusBadge}>
                    {ride.status === 'aceita' ? 'RECÉM ACEITA' : ride.status.toUpperCase().replace(/_/g, ' ')}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.targetLabel}>
                    {isGoingToClient ? 'Buscando veículo em:' : 'Levando veículo para:'}
                </Text>
                <Text style={styles.targetAddress} numberOfLines={2}>
                    {isGoingToClient ? ride.origem_endereco : ride.destino_endereco}
                </Text>
            </View>

            <View style={styles.bottomCard}>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconBtn} onPress={openGPS}>
                        <Navigation size={24} color="#111827" />
                        <Text style={styles.iconBtnText}>Navegar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setShowChat(true)}>
                        <MessageSquare size={24} color="#111827" />
                        <Text style={styles.iconBtnText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={callClient}>
                        <Phone size={24} color="#111827" />
                        <Text style={styles.iconBtnText}>Ligar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.detailsTitle}>VEÍCULO & PROBLEMA</Text>
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <Truck size={16} color="#4B5563" />
                            <Text style={styles.detailText}>
                                <Text style={{ fontWeight: '700' }}>{ride.veiculo_marca_modelo || 'Não informado'}</Text> - {ride.veiculo_cor || 'N/A'} ({ride.veiculo_placa || 'Sem placa'})
                            </Text>
                        </View>
                        <View style={[styles.detailRow, { marginTop: 8 }]}>
                            <AlertTriangle size={16} color="#EF4444" />
                            <Text style={styles.detailText}>
                                <Text style={{ fontWeight: '700', color: '#EF4444' }}>{ride.problema_tipo || 'Pane'}:</Text> {ride.problema_descricao || 'Sem descrição adicional.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {
                    ride.status === 'aceita' && (
                        <TouchableOpacity
                            style={styles.mainBtn}
                            onPress={() => updateRideStatus('a_caminho')}
                            disabled={statusUpdating}
                        >
                            {statusUpdating ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Truck size={20} color="#FFF" style={styles.btnIcon} />
                                    <Text style={styles.mainBtnText}>Estou a Caminho</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                }

                {
                    ride.status === 'a_caminho' && (
                        <TouchableOpacity
                            style={styles.mainBtn}
                            onPress={() => updateRideStatus('no_local')}
                            disabled={statusUpdating}
                        >
                            {statusUpdating ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <MapPin size={20} color="#FFF" style={styles.btnIcon} />
                                    <Text style={styles.mainBtnText}>Cheguei no Local</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                }

                {
                    ride.status === 'no_local' && (
                        <TouchableOpacity
                            style={[styles.mainBtn, { backgroundColor: '#F59E0B' }]}
                            onPress={() => router.push(`/(motorista)/active-ride/checklist?id=${id}`)}
                            disabled={statusUpdating}
                        >
                            {statusUpdating ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Truck size={20} color="#FFF" style={styles.btnIcon} />
                                    <Text style={styles.mainBtnText}>Iniciar Reboque</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                }

                {
                    ride.status === 'em_rota_destino' && (
                        <View>
                            {isNearDestination ? (
                                <TouchableOpacity
                                    style={[
                                        styles.mainBtn,
                                        { backgroundColor: '#16A34A' }
                                    ]}
                                    onPress={() => updateRideStatus('finalizada')}
                                    disabled={statusUpdating}
                                >
                                    {statusUpdating ? <ActivityIndicator color="#FFF" /> : (
                                        <>
                                            <CheckCircle size={20} color="#FFF" style={styles.btnIcon} />
                                            <Text style={styles.mainBtnText}>Finalizar Reboque</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.warningBox}>
                                    <AlertTriangle size={16} color="#B45309" />
                                    <Text style={styles.warningText}>
                                        Continue dirigindo até o destino para finalizar o serviço.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )
                }

            </View >

            {/* Chat Modal Layer */}
            {
                showChat && typeof id === 'string' && (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999, backgroundColor: '#FFF' }]}>
                        <ChatModal
                            corridaId={id}
                            onClose={() => setShowChat(false)}
                            isActive={!['finalizada', 'cancelada'].includes(ride.status)}
                        />
                    </View>
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    map: {
        width: width,
        height: height,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#6B7280',
        fontSize: 16,
    },
    targetMarker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
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
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusBadge: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '700',
        color: '#16A34A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    targetLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    targetAddress: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    iconBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    iconBtnText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    mainBtn: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnIcon: {
        marginRight: 10,
    },
    mainBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
    detailsContainer: {
        marginBottom: 24,
    },
    detailsTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#6B7280',
        letterSpacing: 1,
        marginBottom: 8,
    },
    detailCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#374151',
        lineHeight: 18,
    },
    driverMarkerContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden',
    },
    markerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
});
