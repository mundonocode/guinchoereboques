'use client';

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Power, User, Search, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { IncomingRideAlert } from '@/components/IncomingRideAlert';

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function MotoristaMapClient() {
    const { user } = useAuth();
    const supabase = createClient();
    const map = useMap();

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [activeRequest, setActiveRequest] = useState<any | null>(null);

    // Lógica de Geolocalização Simples (No PWA, precisamos do app ativo)
    useEffect(() => {
        let watchId: number;

        if (isOnline && 'geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    if (map) {
                        map.panTo(coords);
                    }

                    // Num cenário real, enviaríamos o update pro DB:
                    // supabase.from('perfis').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', user.id);
                },
                (error) => console.error("Erro GPS:", error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else if (!isOnline) {
            // Se offline, pega só a inicial
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation(DEFAULT_CENTER)
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, map]);

    // Simulação de corrida recebida 5s após ficar online
    useEffect(() => {
        if (isOnline) {
            const timer = setTimeout(() => {
                setActiveRequest({
                    id: 'test-uuid-123',
                    distancia_estimada_km: 12.5,
                    valor: 185.00,
                    endereco_origem: 'Av. Paulista, 1578 - Bela Vista, São Paulo'
                });
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setActiveRequest(null);
        }
    }, [isOnline]);

    const toggleOnline = () => {
        setIsOnline(!isOnline);
    };

    const handleAccept = () => {
        alert("Corrida Aceita! Redirecionando para navegação GPS...");
        setActiveRequest(null);
        setIsOnline(false); // Para demo
    };

    const handleReject = () => {
        setActiveRequest(null);
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
                            <div className="w-10 h-10 bg-black rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white">
                                <TruckIcon />
                            </div>
                        </AdvancedMarker>
                    )}
                </Map>
            </div>

            {/* Header Info */}
            <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
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
                                className="w-full bg-gray-900 text-white py-[18px] rounded-2xl font-bold text-lg active:scale-95 transition-transform"
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
