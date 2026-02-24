'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search, MapPin, Navigation, Truck, User, Phone, Tag, Car, ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

// Para esse MVP, manteremos um fallback para SP se a localização falhar
const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

export function ClienteMapClient() {
    const { user } = useAuth();
    const supabase = createClient();
    const map = useMap();
    // Configurações de Rotas, Geocoding e Places
    const routesLib = useMapsLibrary('routes');
    const geocodingLib = useMapsLibrary('geocoding');
    const placesLib = useMapsLibrary('places');

    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();
    const placeAutocompleteRef = useRef<HTMLInputElement>(null);

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

    const [originAddressName, setOriginAddressName] = useState('Buscando localização...');
    const [destAddressName, setDestAddressName] = useState('Para onde vamos levar seu veículo?');

    const [rideState, setRideState] = useState<'idle' | 'filling_details' | 'payment' | 'searching' | 'active'>('idle');
    const [currentRideId, setCurrentRideId] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const [rejectedDrivers, setRejectedDrivers] = useState<string[]>([]);

    // Formulário do Veículo
    const [placa, setPlaca] = useState('');
    const [cor, setCor] = useState('');
    const [marcaModelo, setMarcaModelo] = useState('');
    const [problemaDescricao, setProblemaDescricao] = useState('');
    const [problemaTipo, setProblemaTipo] = useState('');
    const problemTypes = ['Pane Mecânica', 'Colisão', 'Pneu Furado', 'Falta de Combustível'];
    const isFormValid = placa && cor && marcaModelo && problemaTipo;

    // Pagamento
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('pix');
    const [ccNumber, setCcNumber] = useState('');
    const [ccName, setCcName] = useState('');
    const [ccExpiry, setCcExpiry] = useState('');
    const [ccCvv, setCcCvv] = useState('');
    const estimatedPrice = 180.00; // Mockado como no mobile MVP
    const distanceKm = 12.5; // Mockado como no mobile MVP

    // Instances
    useEffect(() => {
        if (!routesLib || !map) return;
        setDirectionsService(new routesLib.DirectionsService());
        setDirectionsRenderer(new routesLib.DirectionsRenderer({ map }));
    }, [routesLib, map]);

    useEffect(() => {
        if (!geocodingLib) return;
        setGeocoder(new geocodingLib.Geocoder());
    }, [geocodingLib]);

    // Google Places Autocomplete
    useEffect(() => {
        if (!placesLib || !placeAutocompleteRef.current) return;

        const autocomplete = new placesLib.Autocomplete(placeAutocompleteRef.current, {
            fields: ['geometry', 'name', 'formatted_address'],
            componentRestrictions: { country: 'br' }
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                setDestination({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
                setDestAddressName(place.name || place.formatted_address || '');
            } else {
                alert("Por favor, selecione um endereço válido na lista.");
            }
        });
    }, [placesLib]);

    // GeoLocation
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    setOriginAddressName('Convertendo endereço...');
                    if (map) {
                        map.panTo(coords);
                        map.setZoom(15);
                    }
                },
                (err) => {
                    console.warn("GeoLocation warning (fallback para SP ativado):", err instanceof Error ? err.message : (err && typeof err === 'object' && 'message' in err ? err.message : 'Unknown error'));
                    setLocation(DEFAULT_CENTER);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocation(DEFAULT_CENTER);
        }
    }, [map]);

    // Reverse Geocoding (Lat/Lng -> Street)
    useEffect(() => {
        if (!geocoder || !location) return;

        geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
                // Tenta pegar componentes focados na rua e número primeiro pro UI ficar limpo
                const addressComponents = results[0].address_components;
                const route = addressComponents.find(c => c.types.includes('route'))?.short_name || addressComponents.find(c => c.types.includes('route'))?.long_name;
                const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name;

                if (route) {
                    setOriginAddressName(`${route}${streetNumber ? `, ${streetNumber}` : ''}`);
                } else {
                    // Fallback para formatação crua antes do bairro se a rua falhar
                    setOriginAddressName(results[0].formatted_address.split('-')[0].trim());
                }
            } else {
                setOriginAddressName('Sua Localização');
            }
        });
    }, [geocoder, location]);

    // Handle directions
    useEffect(() => {
        if (!directionsService || !directionsRenderer || !location || !destination) return;

        directionsService
            .route({
                origin: location,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
            })
            .catch((e) => console.error("Directions error: ", e));
    }, [directionsService, directionsRenderer, location, destination]);

    // Supabase Realtime Subscription for Ride Status
    useEffect(() => {
        if (!currentRideId || rideState === 'idle') return;

        console.log('Cliente subscribing to ride updates:', currentRideId);

        const channel = supabase
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
                        // Fetch driver details including vehicle info
                        const { data } = await supabase
                            .from('perfis')
                            .select(`
                                id,
                                nome_completo, 
                                telefone, 
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
                            const vehicle = Array.isArray(data.veiculos_guincho)
                                ? data.veiculos_guincho[0]
                                : data.veiculos_guincho;

                            setDriverInfo({
                                ...data,
                                vehicle
                            });
                        }
                    } else if (updatedRide.status === 'rejeitada') {
                        console.log('Driver rejected. Searching next...');
                        const currentExcluded = [...rejectedDrivers, updatedRide.motorista_id];
                        setRejectedDrivers(currentExcluded);
                        await findAndAssignDriver(updatedRide.id, currentExcluded);
                    } else if (updatedRide.status === 'finalizada') {
                        alert("Corrida Finalizada: O reboque foi concluído com sucesso.");
                        resetRide();
                    } else if (updatedRide.status === 'cancelada') {
                        alert("Corrida Cancelada: O motorista cancelou o chamado.");
                        resetRide();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
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
                alert("Nenhum motorista disponível no momento. Tente novamente em instantes.");
                setRideState('idle');
                await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', rideId);
                return;
            }

            const nextDriverId = drivers[0].id;

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

    const resetRide = () => {
        setRideState('idle');
        setDestination(null);
        setDestAddressName('Para onde vamos levar seu veículo?');
        setCurrentRideId(null);
        setDriverInfo(null);
        setRejectedDrivers([]);
        if (placeAutocompleteRef.current) placeAutocompleteRef.current.value = "";
    };

    const requestRide = () => {
        if (!destination) {
            alert("Selecione um destino primeiro.");
            return;
        }

        // Abre tela interativa de Detalhes do Veículo
        setRideState('filling_details');
    };

    const handleConfirmDetails = () => {
        setRideState('payment');
    };

    const handleConfirmPayment = async () => {
        if (!user || !location || !destination) return;

        setRideState('searching');

        try {
            // 1. Criar a corrida no banco
            const { data: newRide, error: rideError } = await supabase
                .from('corridas')
                .insert({
                    cliente_id: user.id,
                    origem_lat: location.lat,
                    origem_lng: location.lng,
                    destino_lat: destination.lat,
                    destino_lng: destination.lng,
                    endereco_origem: originAddressName,
                    endereco_destino: destAddressName,
                    distancia_km: distanceKm,
                    valor_total: estimatedPrice,
                    status: 'buscando_motorista',
                    veiculo_placa: placa,
                    veiculo_cor: cor,
                    veiculo_marca_modelo: marcaModelo,
                    problema_descricao: problemaDescricao,
                    problema_tipo: problemaTipo,
                    metodo_pagamento: paymentMethod
                })
                .select()
                .single();

            if (rideError) throw rideError;
            if (!newRide) throw new Error("Falha ao criar corrida");

            setCurrentRideId(newRide.id);

            // 2. Tentar atribuir ao primeiro motorista disponível
            await findAndAssignDriver(newRide.id, []);

        } catch (error) {
            console.error('Erro ao iniciar corrida:', error);
            alert("Erro ao iniciar solicitação. Tente novamente.");
            setRideState('idle');
        }
    };

    return (
        <div className="relative w-full h-[100dvh] bg-gray-100 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Map
                    mapId="cliente-map"
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={13}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                >
                    {location && (
                        <AdvancedMarker position={location} title="Você está aqui">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </AdvancedMarker>
                    )}
                    {destination && (
                        <AdvancedMarker position={destination} title="Destino">
                            <div className="w-8 h-8 flex items-center justify-center text-red-500 pb-2 drop-shadow-lg">
                                <MapPin size={32} fill="currentColor" />
                            </div>
                        </AdvancedMarker>
                    )}
                </Map>
            </div>

            {/* Top Floating Card */}
            {rideState === 'idle' && (
                <div className="absolute top-6 left-4 right-4 z-10">
                    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 backdrop-blur-md bg-white/90">
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <div className="ml-4 flex-1">
                                <p className="text-[10px] text-gray-400 font-bold tracking-wider">ORIGEM (GPS)</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{originAddressName}</p>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 ml-6 my-3" />

                        <div className="flex items-center w-full">
                            <div className="w-2.5 h-2.5 rounded-full bg-black shrink-0" />
                            <div className="ml-4 flex-1">
                                <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-0.5">DESTINO</p>
                                <div className="flex items-center border-b border-gray-100 pb-1 mr-2 focus-within:border-black transition-colors">
                                    <input
                                        ref={placeAutocompleteRef}
                                        type="text"
                                        className="w-full text-sm font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent truncate"
                                        placeholder="Para onde vamos levar seu veículo?"
                                    />
                                </div>
                            </div>
                            <Search size={20} className="text-gray-400 shrink-0" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Action Button */}
            {rideState === 'idle' && (
                <div className="absolute bottom-[88px] left-5 right-5 z-10 flex flex-col justify-end pointer-events-none">
                    <button
                        onClick={requestRide}
                        className="pointer-events-auto w-full bg-black text-white py-[18px] rounded-[12px] font-bold text-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Solicitar Guincho Agora
                    </button>
                </div>
            )}

            {/* Filling Details Overlay */}
            {rideState === 'filling_details' && (
                <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center px-5 py-4 border-b border-gray-100">
                        <button onClick={() => setRideState('idle')} className="p-1">
                            <ArrowLeft size={24} className="text-gray-900" />
                        </button>
                        <h2 className="flex-1 text-center text-[18px] font-bold text-gray-900">Detalhes do Veículo</h2>
                        <div className="w-6" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 pb-40">
                        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                <Car size={32} className="text-gray-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Informações do veículo em pane</p>
                        </div>

                        <div className="flex gap-4 mb-5">
                            <div className="flex-1">
                                <label className="block text-[12px] font-bold text-gray-500 mb-2 tracking-wide">PLACA</label>
                                <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC-1234" className="w-full border border-gray-200 rounded-xl p-4 text-[15px] outline-none focus:border-black uppercase" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[12px] font-bold text-gray-500 mb-2 tracking-wide">COR</label>
                                <input type="text" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Ex: Prata" className="w-full border border-gray-200 rounded-xl p-4 text-[15px] outline-none focus:border-black" />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-[12px] font-bold text-gray-500 mb-2 tracking-wide">MARCA/MODELO</label>
                            <input type="text" value={marcaModelo} onChange={(e) => setMarcaModelo(e.target.value)} placeholder="Ex: Toyota Corolla" className="w-full border border-gray-200 rounded-xl p-4 text-[15px] outline-none focus:border-black" />
                        </div>

                        <div className="mb-5">
                            <label className="block text-[12px] font-bold text-gray-500 mb-2 tracking-wide">DESCRIÇÃO DO PROBLEMA (Opcional)</label>
                            <textarea value={problemaDescricao} onChange={(e) => setProblemaDescricao(e.target.value)} placeholder="Ex: O carro parou de funcionar do nada..." className="w-full border border-gray-200 rounded-xl p-4 text-[15px] min-h-[120px] outline-none focus:border-black resize-none" />
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {problemTypes.map((type) => (
                                <button key={type} onClick={() => setProblemaTipo(type)} className={`py-3 px-4 rounded-lg w-[calc(50%-6px)] text-center text-[13px] font-semibold transition-colors ${problemaTipo === type ? 'bg-gray-100 border border-black text-black' : 'bg-gray-50 border border-transparent text-gray-600'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-[64px] left-0 right-0 p-6 bg-white border-t border-gray-100">
                        <button onClick={handleConfirmDetails} disabled={!isFormValid} className={`w-full py-4 rounded-xl font-bold text-[16px] transition-opacity ${!isFormValid ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-black text-white hover:scale-[1.02] active:scale-95'}`}>
                            Confirmar Detalhes
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Overlay */}
            {rideState === 'payment' && (
                <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="flex items-center px-5 py-4 border-b border-gray-100">
                        <button onClick={() => setRideState('filling_details')} className="p-1">
                            <ArrowLeft size={24} className="text-gray-900" />
                        </button>
                        <h2 className="flex-1 text-center text-[18px] font-bold text-gray-900">Confirmação e Pagamento</h2>
                        <div className="w-6" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 pb-40">
                        <div className="bg-gray-900 rounded-2xl p-6 mb-8 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest mb-1">VALOR TOTAL</p>
                                    <p className="text-[28px] font-extrabold text-white">R$ {estimatedPrice.toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">⏱️</div>
                            </div>
                            <div className="h-px bg-white/10 mb-4" />
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-wide mb-1">DISTÂNCIA</p>
                                    <p className="text-sm font-semibold text-white">{distanceKm.toFixed(1)} km</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-wide mb-1">ETA</p>
                                    <p className="text-sm font-semibold text-white">15-20 min</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-[12px] font-extrabold text-gray-900 tracking-wide mb-4">MÉTODO DE PAGAMENTO</h3>

                        <button onClick={() => setPaymentMethod('pix')} className={`flex items-center justify-between p-4 mb-3 border rounded-xl w-full text-left transition-colors ${paymentMethod === 'pix' ? 'border-gray-900 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center">
                                <Banknote size={24} className={paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-500'} />
                                <div className="ml-4">
                                    <p className={`text-[15px] font-semibold mb-0.5 ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-600'}`}>Pix</p>
                                    <p className="text-[12px] text-gray-400">Pagamento Instantâneo</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-gray-900' : 'border-gray-300'}`}>
                                {paymentMethod === 'pix' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                            </div>
                        </button>

                        <button onClick={() => setPaymentMethod('credit_card')} className={`flex items-center justify-between p-4 mb-3 border rounded-xl w-full text-left transition-colors ${paymentMethod === 'credit_card' ? 'border-gray-900 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center">
                                <CreditCard size={24} className={paymentMethod === 'credit_card' ? 'text-gray-900' : 'text-gray-500'} />
                                <div className="ml-4">
                                    <p className={`text-[15px] font-semibold mb-0.5 ${paymentMethod === 'credit_card' ? 'text-gray-900' : 'text-gray-600'}`}>Cartão de Crédito</p>
                                    <p className="text-[12px] text-gray-400">Pague em até 12x</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-gray-900' : 'border-gray-300'}`}>
                                {paymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                            </div>
                        </button>

                        {paymentMethod === 'credit_card' && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-1 mb-3">
                                <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wide mt-2">NÚMERO DO CARTÃO</label>
                                <input type="text" value={ccNumber} onChange={(e) => setCcNumber(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] outline-none" />

                                <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wide mt-3">NOME DO TITULAR</label>
                                <input type="text" value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="Nome como impresso no cartão" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] outline-none uppercase" />

                                <div className="flex gap-4 mt-3">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wide">VALIDADE</label>
                                        <input type="text" value={ccExpiry} onChange={(e) => setCcExpiry(e.target.value)} placeholder="MM/AA" maxLength={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] outline-none" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wide">CVV</label>
                                        <input type="password" value={ccCvv} onChange={(e) => setCcCvv(e.target.value)} placeholder="123" maxLength={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[15px] outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="absolute bottom-[64px] left-0 right-0 p-6 bg-white border-t border-gray-100">
                        <button onClick={handleConfirmPayment} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-[16px] hover:scale-[1.02] active:scale-95 transition-transform flex justify-center items-center">
                            Confirmar e Solicitar
                        </button>
                    </div>
                </div>
            )}

            {/* Searching Overlay */}
            {rideState === 'searching' && (
                <div className="absolute bottom-[64px] left-0 right-0 bg-white rounded-t-[24px] p-6 pb-[30px] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-20 flex flex-col items-center animate-in slide-in-from-bottom duration-300">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
                    <h3 className="text-[18px] font-bold text-gray-900 mb-2">Procurando motoristas...</h3>
                    <p className="text-[14px] text-gray-500 text-center mb-6">Enviando sua solicitação para o guincheiro mais próximo.</p>

                    <button
                        onClick={async () => {
                            if (currentRideId) {
                                await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', currentRideId);
                            }
                            resetRide();
                        }}
                        className="w-full bg-red-50 text-red-500 font-semibold py-[14px] px-6 rounded-[12px] text-[16px] flex justify-center items-center"
                    >
                        Cancelar Pedido
                    </button>
                </div>
            )}

            {/* Active Ride Overlay */}
            {rideState === 'active' && (
                <div className="absolute bottom-[64px] left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-20 flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
                    <div className="w-full bg-gray-100 py-2.5 flex justify-center">
                        <span className="text-[12px] font-extrabold tracking-[1.2px] text-gray-700">GUINCHEIRO A CAMINHO</span>
                    </div>

                    <div className="p-5 pb-[30px] w-full">
                        <div className="flex items-center mb-6">
                            <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center mr-4 shrink-0 overflow-hidden">
                                {driverInfo?.avatar_url ? (
                                    <img src={driverInfo.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-[18px] font-bold text-gray-900 mb-1">{driverInfo?.nome_completo || 'Motorista'}</h3>
                                <div className="flex items-center">
                                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Especialista</span>
                                </div>
                            </div>

                            <a
                                href={`tel:${driverInfo?.telefone}`}
                                className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0"
                            >
                                <Phone size={24} />
                            </a>
                        </div>

                        <div className="flex justify-between bg-gray-50 p-4 rounded-[12px] mb-6">
                            <div className="flex items-center flex-1">
                                <div className="w-9 h-9 bg-white shadow-sm rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <Truck size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Veículo</p>
                                    <p className="text-[14px] font-bold text-gray-900 truncate">
                                        {driverInfo?.vehicle?.marca_modelo || driverInfo?.vehicle?.tipo || 'Guincho Plataforma'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center flex-1 ml-2">
                                <div className="w-9 h-9 bg-white shadow-sm rounded-full flex items-center justify-center mr-3 shrink-0">
                                    <Tag size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Placa</p>
                                    <p className="text-[14px] font-bold text-gray-900 uppercase">{driverInfo?.vehicle?.placa || '---'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-[2] bg-gray-900 text-white font-bold h-[52px] rounded-[12px] flex justify-center items-center text-[16px]">
                                Mensagem
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm("Deseja realmente cancelar seu chamado?")) {
                                        if (currentRideId) {
                                            await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', currentRideId);
                                        }
                                        resetRide();
                                    }
                                }}
                                className="flex-1 bg-gray-100 text-gray-500 font-semibold h-[52px] rounded-[12px] flex justify-center items-center text-[14px]"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
