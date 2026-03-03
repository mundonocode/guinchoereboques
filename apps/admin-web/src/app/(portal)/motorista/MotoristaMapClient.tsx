'use client';

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Power, User, Search, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { IncomingRideAlert } from '@/components/IncomingRideAlert';
import { useRouter } from 'next/navigation';

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function MotoristaMapClient() {
    const { user } = useAuth();
    const supabase = createClient();
    const map = useMap();
    const router = useRouter();

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [activeRequest, setActiveRequest] = useState<any | null>(null);

    const [isActiveProfile, setIsActiveProfile] = useState<boolean | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Fetch profile status once
    useEffect(() => {
        async function checkApprovalStatus() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('is_active, onboarding_completo')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    setIsActiveProfile((data as any).is_active);
                    if ((data as any).onboarding_completo === false || (data as any).onboarding_completo === null) {
                        router.replace('/motorista/onboarding');
                    }
                }
            } catch (err) {
                console.error('Error fetching profile approval status', err);
            } finally {
                setLoadingProfile(false);
            }
        }
        checkApprovalStatus();
    }, [user, supabase, router]);

    // Geolocation logic
    useEffect(() => {
        let watchId: number;

        const handleGeoError = (error: GeolocationPositionError) => {
            let errorMsg = "Erro GPS desconhecido";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = "Permissão de localização negada pelo usuário.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = "Informações de localização indisponíveis.";
                    break;
                case error.TIMEOUT:
                    errorMsg = "Tempo limite atingido ao obter localização.";
                    break;
            }
            console.error("Erro GPS:", error.code, errorMsg, error.message);
            if (!location) setLocation(DEFAULT_CENTER);
        };

        if (isOnline && 'geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    if (map) {
                        map.panTo(coords);
                    }
                },
                handleGeoError,
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else if (!isOnline && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                handleGeoError,
                { timeout: 10000 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, map]);

    // Realtime Subscription
    useEffect(() => {
        // console.log("DEBUG: Subscription useEffect triggered", { hasUser: !!user, isOnline });
        if (!user || !isOnline) return;

        // console.log("DEBUG: Establishing Realtime subscription for driver:", user.id);

        // Fetch pending first
        async function fetchPendingRide() {
            // console.log("DEBUG: fetchPendingRide starting...");
            const { data, error } = await supabase
                .from('corridas')
                .select(`
                    id, 
                    status, 
                    motorista_id, 
                    origem_endereco, 
                    destino_endereco,
                    origem_lat, 
                    origem_lng, 
                    destino_lat, 
                    destino_lng, 
                    cliente_id, 
                    veiculo_placa,
                    veiculo_cor,
                    veiculo_marca_modelo, 
                    problema_descricao, 
                    problema_tipo,
                    valor,
                    distancia_km
                `)
                .eq('motorista_id', user!.id)
                .eq('status', 'buscando_motorista')
                .order('created_at', { ascending: false })
                .limit(1) as any;

            if (data && data.length > 0) {
                const ride = data[0];
                console.log("Corrida pendente encontrada:", ride.id);
                setActiveRequest(ride);
                if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200, 100, 200]);
                }
            } else if (error) {
                console.error("DEBUG: fetchPendingRide error:", error.message, error.details, error.hint);
            } else {
                console.log("DEBUG: No pending ride found for this driver.");
            }
        }

        fetchPendingRide();

        const channel = supabase
            .channel(`driver_rides_${user.id}`) // Canalisando por ID para evitar ruído
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events to be safe
                    schema: 'public',
                    table: 'corridas'
                },
                (payload) => {
                    const nextRecord = payload.new as any;
                    const eventType = payload.eventType;
                    // console.log(`DEBUG: Realtime ${eventType} event received:`, nextRecord?.id, nextRecord?.status, nextRecord?.motorista_id);

                    // Filter in JS for maximum visibility during debugging
                    if (nextRecord?.motorista_id === user.id) {
                        if (nextRecord?.status === 'buscando_motorista') {
                            console.log("Nova corrida recebida!", nextRecord.id);
                            setActiveRequest(nextRecord);
                            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                                navigator.vibrate([200, 100, 200, 100, 200]);
                            }
                        } else if (['rejeitada', 'cancelada', 'finalizada'].includes(nextRecord?.status)) {
                            setActiveRequest(null);
                        } else if (nextRecord?.status === 'aceita') {
                            setActiveRequest(null);
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("Pronto para receber corridas.");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isOnline, supabase]);

    const toggleOnline = async () => {
        if (isActiveProfile === null) {
            if (confirm('Você precisa enviar seus dados antes de ficar online. Ir para o cadastro?')) {
                router.push('/motorista/onboarding');
            }
            return;
        }
        if (isActiveProfile === false) {
            alert('Seus dados já foram enviados e nossa equipe está analisando. Aguarde a aprovação para ficar online.');
            return;
        }

        const newStatus = !isOnline;
        setIsOnline(newStatus);

        if (user) {
            await supabase.from('perfis').update({ is_online: newStatus } as any).eq('id', user.id);
        }
    };

    const handleAccept = async () => {
        if (!activeRequest || !user) return;
        try {
            const { error } = await supabase
                .from('corridas')
                .update({ status: 'aceita' })
                .eq('id', activeRequest.id)
                .eq('motorista_id', user.id);

            if (error) throw error;

            setActiveRequest(null);
            setIsOnline(false); // Go offline while executing this one
            // Update profile as offline
            await supabase.from('perfis').update({ is_online: false } as any).eq('id', user.id);

            console.log("DEBUG: Redirecting to active-ride", { id: activeRequest.id });
            if (activeRequest.id) {
                router.push(`/motorista/active-ride/${activeRequest.id}`);
            } else {
                console.error("DEBUG: Cannot redirect, activeRequest.id is missing");
                alert("Erro ao redirecionar: ID da corrida não encontrado.");
            }
        } catch (err) {
            console.error('Failed to accept ride', err);
            alert("Erro: Não foi possível aceitar a corrida.");
            setActiveRequest(null);
        }
    };

    const handleReject = async () => {
        if (!activeRequest || !user) return;
        try {
            const { error } = await supabase
                .from('corridas')
                .update({ status: 'rejeitada' })
                .eq('id', activeRequest.id)
                .eq('motorista_id', user.id);

            if (error) throw error;
        } catch (err) {
            console.error('Failed to reject ride', err);
        } finally {
            setActiveRequest(null);
        }
    };

    return (
        <div className="relative w-full h-[100dvh] bg-gray-900 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 opacity-80">
                <Map
                    mapId="motorista-map"
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={15}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                >
                    {location && (
                        <AdvancedMarker position={location} title="Localização Guincho">
                            <div className={`w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white ${isOnline ? 'bg-black' : 'bg-gray-500'}`}>
                                <TruckIcon />
                            </div>
                        </AdvancedMarker>
                    )}
                </Map>
            </div>

            {/* Header Info */}
            <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-3 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-0.5">Visibilidade</p>
                        <p className={`text-sm font-bold flex items-center gap-2 ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            {isOnline ? 'ONLINE E VISÍVEL' : 'OFFLINE'}
                        </p>
                    </div>
                </div>

                {isActiveProfile === null && !loadingProfile && (
                    <div className="pointer-events-auto bg-[#FFFBEB] px-5 py-4 rounded-2xl shadow-lg border border-[#FDE68A] flex items-center gap-3 cursor-pointer" onClick={() => router.push('/motorista/onboarding')}>
                        <AlertTriangle className="text-[#B45309]" size={20} />
                        <div>
                            <p className="text-sm font-bold text-[#92400E]">Cadastro Incompleto</p>
                            <p className="text-xs text-[#B45309] mt-0.5">Toque para concluir.</p>
                        </div>
                    </div>
                )}

                {isActiveProfile === false && !loadingProfile && (
                    <div className="pointer-events-auto bg-[#FEF2F2] px-5 py-4 rounded-2xl shadow-lg border border-[#FCA5A5] flex items-center gap-3">
                        <AlertTriangle className="text-[#DC2626]" size={20} />
                        <div>
                            <p className="text-sm font-bold text-[#991B1B]">Em Análise</p>
                            <p className="text-xs text-[#B91C1C] mt-0.5">Aguarde a verificação.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Bottom UI */}
            <div className="absolute bottom-[88px] left-0 right-0 z-10 flex justify-center px-5 pointer-events-none">
                <div className={`pointer-events-auto bg-white transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden shadow-[0_-4px_25px_rgba(0,0,0,0.15)] w-full max-w-md ${isOnline
                    ? 'rounded-[40px] p-3 flex flex-row items-center justify-between translate-y-4 translate-y-0 transform-gpu'
                    : 'rounded-3xl p-6 flex flex-col items-center transform-gpu'
                    }`}>
                    {!isOnline ? (
                        <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Offline</h2>
                            <p className="text-sm text-gray-500 mb-6 text-center">Fique online para começar a trabalhar</p>
                            <button
                                onClick={toggleOnline}
                                className={`w-full text-white py-[18px] rounded-2xl font-bold text-lg transition-transform ${isActiveProfile !== true ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 active:scale-95'}`}
                            >
                                Ficar Online
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-row items-center justify-between animate-in fade-in duration-300 pb-0 shrink-0">
                            <div className="flex items-center text-gray-900 pl-3">
                                <Power size={20} className="mr-2 border-2 border-transparent rounded-full" />
                                <span className="text-sm font-bold tracking-tight">Aguardando Chamados...</span>
                            </div>
                            <button
                                onClick={toggleOnline}
                                className="bg-red-50 text-red-500 font-bold text-[13px] py-2.5 px-4 rounded-full border border-red-200 active:scale-95 transition-transform shrink-0"
                            >
                                Ficar Offline
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Alerta Fullscreen de Corrida */}
            <IncomingRideAlert
                request={activeRequest}
                onAccept={handleAccept}
                onReject={handleReject}
            />
        </div>
    );
}

function TruckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2" /><path d="M14 17h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
    );
}
