'use client';

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useRouter } from 'next/navigation';
import { Phone, Navigation, ArrowLeft, User, Truck, CheckCircle, MessageSquare } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatModal } from '@/components/ChatModal';

interface ActiveRideClientProps {
    rideId: string;
}

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function ActiveRideClient({ rideId }: ActiveRideClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const map = useMap();
    const { user } = useAuth();

    const routesLib = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [ride, setRide] = useState<any>(null);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Instances
    useEffect(() => {
        if (!routesLib || !map) return;
        setDirectionsService(new routesLib.DirectionsService());
        setDirectionsRenderer(new routesLib.DirectionsRenderer({
            map,
            polylineOptions: {
                strokeColor: '#000000',
                strokeWeight: 5,
            },
            suppressMarkers: false,
        }));
    }, [routesLib, map]);

    // GeoLocation
    useEffect(() => {
        let watchId: number;
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    // In a production app, we would update the driver's location in Supabase here
                },
                (err) => console.warn("GeoLocation warning:", err),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(() => {
        async function fetchRide() {
            if (!rideId || rideId === 'undefined') {
                console.warn("DEBUG: fetchRide aborted, rideId is:", rideId);
                return;
            }
            const { data: rideData, error: rideError } = await supabase
                .from('corridas')
                .select('*')
                .eq('id', rideId)
                .single();

            if (rideError || !rideData) {
                alert('Corrida não encontrada.');
                router.replace('/motorista');
                return;
            }
            setRide(rideData);

            if (rideData.cliente_id) {
                const { data: clientData } = await supabase
                    .from('perfis')
                    .select('nome_completo, telefone, foto_url')
                    .eq('id', rideData.cliente_id)
                    .single();
                setClientProfile(clientData);
            }
            setLoading(false);
        }

        fetchRide();
    }, [rideId, supabase, router]);

    // Update Route
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !location || !ride) return;

        let targetDest = null;
        if (ride.status === 'aceita' || ride.status === 'a_caminho') {
            targetDest = { lat: Number(ride.origem_lat), lng: Number(ride.origem_lng) };
        } else if (ride.status === 'em_andamento') {
            targetDest = { lat: Number(ride.destino_lat), lng: Number(ride.destino_lng) };
        }

        const isValid = targetDest &&
            typeof targetDest.lat === 'number' && !isNaN(targetDest.lat) &&
            typeof targetDest.lng === 'number' && !isNaN(targetDest.lng);

        if (isValid && targetDest) {
            directionsService.route(
                {
                    origin: location,
                    destination: targetDest,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result && directionsRenderer) {
                        directionsRenderer.setMap(map);
                        directionsRenderer.setDirections(result);
                    } else {
                        console.error('Directions request failed due to ' + status);
                    }
                }
            );
        } else {
            if (directionsRenderer) {
                // setMap(null) is the robust way to clear directions
                directionsRenderer.setMap(null);
            }
        }
    }, [directionsService, directionsRenderer, location, ride, map]);


    // Realtime changes
    useEffect(() => {
        if (!rideId) return;

        const channel = supabase
            .channel(`driver_active_ride_${rideId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'corridas',
                    filter: `id=eq.${rideId}`,
                },
                (payload) => {
                    setRide(payload.new);
                    if (payload.new.status === 'cancelada') {
                        alert('O cliente cancelou o chamado.');
                        router.replace('/motorista');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [rideId, supabase, router]);

    const updateStatus = async (newStatus: string) => {
        const { error } = await supabase
            .from('corridas')
            .update({ status: newStatus })
            .eq('id', rideId);

        if (error) {
            alert('Erro ao atualizar status.');
            console.error(error);
        }
    };

    const handleActionClick = () => {
        if (!ride) return;
        switch (ride.status) {
            case 'aceita':
            case 'a_caminho':
                updateStatus('no_local');
                break;
            case 'no_local':
                updateStatus('em_andamento');
                break;
            case 'em_andamento':
                updateStatus('finalizada');
                alert('Corrida Finalizada com sucesso!');
                router.replace('/motorista');
                break;
            default:
                break;
        }
    };

    const handleCancel = async () => {
        const confirmed = window.confirm("Deseja realmente cancelar este atendimento?");
        if (!confirmed) return;

        const { error } = await supabase
            .from('corridas')
            .update({ status: 'cancelada' })
            .eq('id', rideId);

        if (error) {
            alert('Erro ao cancelar corrida.');
            console.error(error);
        } else {
            router.replace('/motorista');
        }
    };

    const openGPS = () => {
        if (!ride || !location) return;

        let targetLat = ride.origem_lat;
        let targetLng = ride.origem_lng;

        if (ride.status === 'em_andamento') {
            targetLat = ride.destino_lat;
            targetLng = ride.destino_lng;
        }

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
        window.open(mapsUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-[3px] border-zinc-900 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!ride) return null;

    return (
        <div className="relative w-full h-[100dvh] bg-zinc-50 overflow-hidden">
            {/* Map Area - Full Background */}
            <div className="absolute inset-0 z-0">
                <Map
                    mapId="active-ride-driver-map"
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={15}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                    colorScheme="LIGHT"
                >
                    {location && (
                        <AdvancedMarker position={location} title="Meu Guincho">
                            <div className="w-9 h-9 bg-zinc-900 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center">
                                <Truck size={16} className="text-white" />
                            </div>
                        </AdvancedMarker>
                    )}
                </Map>
            </div>

            {/* Header Area Overlay */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => router.replace('/motorista')}
                    className="w-[52px] h-[52px] bg-white shadow-xl rounded-[18px] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all border border-zinc-100"
                >
                    <ArrowLeft size={22} className="text-zinc-900" />
                </button>
            </div>

            {/* Bottom Sheet Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 w-full pointer-events-none px-4 pb-[calc(env(safe-area-inset-bottom,20px)+20px)]">
                <div className="max-w-lg mx-auto bg-white rounded-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.12)] border border-zinc-50 p-6 pt-3 pointer-events-auto overflow-hidden">
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

                    {/* Status Indicator */}
                    <div className="flex justify-between items-center mb-7">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${ride.status !== 'finalizada' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-emerald-500'}`} />
                            <h2 className="text-[26px] font-black tracking-tight text-zinc-900 uppercase">
                                {ride.status === 'aceita' && 'A Caminho'}
                                {ride.status === 'a_caminho' && 'A Caminho'}
                                {ride.status === 'no_local' && 'No Local'}
                                {ride.status === 'em_andamento' && 'Em Andamento'}
                            </h2>
                        </div>
                        <button
                            onClick={openGPS}
                            className="bg-zinc-100 px-4 py-3 rounded-2xl text-zinc-900 font-black flex items-center gap-2.5 hover:bg-zinc-200 active:scale-[0.98] transition-all ring-1 ring-black/5"
                        >
                            <Navigation size={18} />
                            <span className="text-xs uppercase tracking-wider">Iniciar Rota</span>
                        </button>
                    </div>

                    {/* Client Profile Card */}
                    <div className="flex items-center bg-white border border-zinc-100 rounded-[28px] p-4 mb-7 shadow-sm">
                        <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 overflow-hidden shrink-0 mr-4">
                            {clientProfile?.foto_url ? (
                                <img src={clientProfile.foto_url} alt="Cliente" className="w-full h-full object-cover" />
                            ) : (
                                <User size={24} className="text-zinc-300" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">Cliente</p>
                            <p className="text-lg font-bold text-zinc-900 leading-none">{clientProfile?.nome_completo || 'Gutemberg Cliente'}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="w-[52px] h-[52px] bg-zinc-50 text-zinc-900 rounded-full flex items-center justify-center border border-zinc-100 active:scale-90 transition-all shadow-sm"
                            >
                                <MessageSquare size={20} />
                            </button>
                            <a
                                href={`tel:${clientProfile?.telefone}`}
                                className="w-[52px] h-[52px] bg-emerald-500 text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-emerald-200"
                            >
                                <Phone size={22} fill="currentColor" />
                            </a>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={handleActionClick}
                            className="flex-[3] bg-zinc-900 text-white font-black text-[18px] py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transform-gpu transition-all"
                        >
                            {(ride.status === 'aceita' || ride.status === 'a_caminho') && (
                                <>Cheguei ao Local</>
                            )}
                            {ride.status === 'no_local' && (
                                <>Iniciar Reboque</>
                            )}
                            {ride.status === 'em_andamento' && (
                                <><CheckCircle size={22} /> Finalizar Corrida</>
                            )}
                        </button>

                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-white border border-red-100 text-red-500 font-black rounded-[24px] flex justify-center items-center text-[15px] hover:bg-red-50 active:scale-[0.98] transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Overlay */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                corridaId={rideId}
                isActive={true}
                otherPartyName={clientProfile?.nome_completo}
            />
        </div>
    );
}

