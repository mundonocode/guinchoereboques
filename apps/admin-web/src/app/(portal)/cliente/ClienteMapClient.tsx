'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Search, MapPin, Navigation, Truck, User, Phone, Tag, Car, ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

import { AdaptivePanel } from './components/AdaptivePanel';
import { RideAddressSearch } from './components/RideAddressSearch';
import { RideVehicleForm } from './components/RideVehicleForm';
import { RidePaymentForm } from './components/RidePaymentForm';
import { RideSearchingStatus } from './components/RideSearchingStatus';
import { RideActiveStatus } from './components/RideActiveStatus';
import { RidePixDisplay } from './components/RidePixDisplay';

// Para esse MVP, manteremos um fallback para SP se a localização falhar
const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };

// Debug Version: 1.1 - 2026-02-25
export function ClienteMapClient() {
    // useEffect(() => {
    //     console.log("DEBUG: ClienteMapClient [v1.2] Mounted");
    // }, []);

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

    const [rideState, setRideState] = useState<'idle' | 'filling_details' | 'payment' | 'pix_payment' | 'searching' | 'active'>('idle');
    const [currentRideId, setCurrentRideId] = useState<string | null>(null);
    const [pixData, setPixData] = useState<any>(null);
    const [rideData, setRideData] = useState<any>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const [rejectedDrivers, setRejectedDrivers] = useState<string[]>([]);

    // Formulário do Veículo
    const [placa, setPlaca] = useState('');
    const [cor, setCor] = useState('');
    const [marcaModelo, setMarcaModelo] = useState('');
    const [problemaDescricao, setProblemaDescricao] = useState('');
    const [problemaTipo, setProblemaTipo] = useState('');
    const [localRemocao, setLocalRemocao] = useState('');
    const problemTypes = ['Parou de Funcionar', 'Capotado', 'Problema na Roda', 'Câmbio Travado', 'Sem Rodas (Furto)', 'Nenhuma das Opções'];
    const isFormValid = placa && cor && marcaModelo && problemaTipo && localRemocao;

    // Pagamento
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('pix');
    const [ccNumber, setCcNumber] = useState('');
    const [ccName, setCcName] = useState('');
    const [ccExpiry, setCcExpiry] = useState('');
    const [ccCvv, setCcCvv] = useState('');
    const estimatedPrice = 180.00; // Mockado como no mobile MVP
    const distanceKm = 12.5; // Mockado como no mobile MVP

    // Form states
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Instances
    useEffect(() => {
        if (!routesLib || !map) return;
        setDirectionsService(new routesLib.DirectionsService());
        setDirectionsRenderer(new routesLib.DirectionsRenderer({
            map,
            polylineOptions: {
                strokeColor: '#000000',
                strokeWeight: 4,
            },
            suppressMarkers: false,
        }));
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

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const newDest = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setDestination(newDest);
                setDestAddressName(place.name || place.formatted_address || '');
            } else {
                alert("Por favor, selecione um endereço válido na lista.");
            }
        });

        return () => {
            if (listener) listener.remove();
        };
    }, [placesLib]);

    // Adjust map viewport when origin or destination changes
    useEffect(() => {
        if (location && destination && map) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(location);
            bounds.extend(destination);
            map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
        }
    }, [location, destination, map]);

    // GeoLocation
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    setOriginAddressName('Convertendo endereço...');
                    if (map && !destination) {
                        map.panTo(coords);
                        map.setZoom(15);
                    }
                },
                (err) => {
                    // console.warn("DEBUG: GeoLocation failure details:", {
                    //     code: err.code,
                    //     message: err.message
                    // });

                    let errorMsg = 'Localização não encontrada. Digite seu local.';
                    if (err.code === 1) {
                        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
                            errorMsg = 'Acesso bloqueado via HTTP (Rede Local). Digite seu local.';
                        } else {
                            errorMsg = 'Permissão de localização negada. Digite seu local.';
                        }
                    } else if (err.code === 2) {
                        errorMsg = 'Sinal de GPS indisponível. Digite seu local.';
                    } else if (err.code === 3) {
                        errorMsg = 'Tempo esgotado ao buscar GPS. Digite seu local.';
                    }

                    setOriginAddressName(errorMsg);
                    setLocation(DEFAULT_CENTER);
                    if (map && !destination) {
                        map.panTo(DEFAULT_CENTER);
                        map.setZoom(13);
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
                const addressComponents = results[0].address_components;
                const route = addressComponents.find(c => c.types.includes('route'))?.short_name || addressComponents.find(c => c.types.includes('route'))?.long_name;
                const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name;

                if (route) {
                    setOriginAddressName(`${route}${streetNumber ? `, ${streetNumber}` : ''}`);
                } else {
                    setOriginAddressName(results[0].formatted_address.split('-')[0].trim());
                }
            } else {
                setOriginAddressName('Sua Localização via GPS');
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
                    const updatedRide = payload.new;
                    setRideData(updatedRide);

                    if (['aceita', 'a_caminho', 'no_local', 'em_andamento'].includes(updatedRide.status)) {
                        setRideState('active');
                        // Fetch driver details if we don't have them yet
                        if (!driverInfo) {
                            const { data } = await supabase
                                .from('perfis')
                                .select(`
                                    id,
                                    nome_completo, 
                                    telefone, 
                                    foto_url,
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
                        }
                    } else if (updatedRide.status === 'rejeitada') {
                        const currentExcluded = [...rejectedDrivers, updatedRide.motorista_id];
                        setRejectedDrivers(currentExcluded);
                        await findAndAssignDriver(updatedRide.id, currentExcluded);
                    } else if (updatedRide.status === 'finalizada') {
                        alert("Corrida Finalizada: O reboque foi concluído com sucesso.");
                        resetRide();
                    } else if (updatedRide.status === 'cancelada') {
                        alert("Corrida Cancelada: O chamado foi encerrado.");
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
        console.log("DEBUG: findAndAssignDriver started", { rideId, excludedCount: excludedIds.length });
        try {
            let query = supabase
                .from('perfis')
                .select('id, nome_completo, is_online, is_active')
                .eq('role', 'motorista')
                .eq('is_online', true)
                .eq('is_active', true);

            if (excludedIds.length > 0) {
                const idsString = excludedIds.join(',');
                query = query.filter('id', 'not.in', `(${idsString})`);
            }

            const { data: drivers, error: driverError } = await query
                .order('created_at', { ascending: false })
                .limit(1);

            if (driverError) {
                console.error("DEBUG: findAndAssignDriver query error:", driverError);
                throw driverError;
            }

            console.log("DEBUG: Driver search result:", { count: drivers?.length || 0 });

            if (!drivers || drivers.length === 0) {
                console.warn("DEBUG: No drivers found online.");
                alert("Nenhum motorista disponível no momento. Tente novamente em instantes.");
                setRideState('idle');
                setIsPanelOpen(false);
                await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', rideId);
                return;
            }

            const nextDriverId = drivers[0].id;
            console.log(`DEBUG: Assigning driver ${nextDriverId} (${drivers[0].nome_completo}) to ride ${rideId}`);

            const { error: updateError } = await supabase
                .from('corridas')
                .update({
                    motorista_id: nextDriverId,
                    status: 'buscando_motorista'
                })
                .eq('id', rideId);

            if (updateError) {
                console.error("DEBUG: Error updating ride with motorista_id:", updateError);
                throw updateError;
            }

            console.log(`DEBUG: Driver ${nextDriverId} assigned successfully to ride ${rideId} in database.`);
            console.log("DEBUG: Waiting for driver response via Realtime...");

        } catch (error: any) {
            console.error('DEBUG: findAndAssignDriver CRITICAL failure:', error);
            alert(`Falha ao atribuir motorista: ${error.message || 'Erro desconhecido'}`);
            setRideState('idle');
            setIsPanelOpen(false);
        }
    };

    const resetRide = () => {
        console.log("DEBUG: resetRide called - returning to idle state");
        setRideState('idle');
        setDestination(null);
        setDestAddressName('Para onde vamos levar seu veículo?');
        setCurrentRideId(null);
        setRideData(null);
        setDriverInfo(null);
        setRejectedDrivers([]);
        setIsPanelOpen(false);

        if (directionsRenderer) {
            // setDirections(null) often throws "not an Object" error. 
            // setMap(null) is the official way to clear the renderer from the map.
            directionsRenderer.setMap(null);
        }

        if (placeAutocompleteRef.current) placeAutocompleteRef.current.value = "";
    };

    const requestRide = () => {
        if (!destination) {
            alert("Selecione um destino primeiro.");
            return;
        }
        setRideState('filling_details');
        setIsPanelOpen(true);
    };

    const handleConfirmDetails = () => {
        setRideState('payment');
    };

    const handleConfirmPayment = async () => {
        console.log("DEBUG: handleConfirmPayment triggered", {
            userID: user?.id,
            hasLocation: !!location,
            hasDestination: !!destination,
            paymentMethod
        });

        if (!user || !location || !destination) {
            console.warn("DEBUG: handleConfirmPayment early return due to missing data", {
                user: !!user,
                location: !!location,
                destination: !!destination
            });
            alert("Dados incompletos para a solicitação (Localização ou Destino ausentes).");
            return;
        }
        try {
            const { data: newRide, error: rideError } = await supabase
                .from('corridas')
                .insert({
                    cliente_id: user.id,
                    origem_lat: location.lat,
                    origem_lng: location.lng,
                    destino_lat: destination.lat,
                    destino_lng: destination.lng,
                    origem_endereco: originAddressName,
                    destino_endereco: destAddressName,
                    distancia_km: distanceKm,
                    valor: estimatedPrice,
                    status: 'buscando_motorista',
                    veiculo_placa: placa,
                    veiculo_cor: cor,
                    veiculo_marca_modelo: marcaModelo,
                    problema_descricao: problemaDescricao,
                    problema_tipo: problemaTipo,
                    local_remocao: localRemocao,
                    metodo_pagamento: paymentMethod
                })
                .select()
                .single();

            if (rideError) throw rideError;
            if (!newRide) throw new Error("Falha ao criar corrida");

            setCurrentRideId(newRide.id);

            // Se for Pix ou Cartão, gerar cobrança no Asaas AGORA
            if (paymentMethod === 'pix' || paymentMethod === 'credit_card') {
                const billingType = paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD';
                let creditCard = undefined;
                let creditCardHolderInfo = undefined;

                if (paymentMethod === 'credit_card') {
                    const [expMonth, expYear] = ccExpiry.includes('/') ? ccExpiry.split('/') : [ccExpiry.substring(0, 2), ccExpiry.substring(2, 4)];
                    const formattedYear = expYear?.length === 2 ? `20${expYear}` : expYear;

                    creditCard = {
                        holderName: ccName,
                        number: ccNumber.replace(/\D/g, ''),
                        expiryMonth: expMonth,
                        expiryYear: formattedYear,
                        ccv: ccCvv
                    };

                    creditCardHolderInfo = {
                        name: ccName,
                        email: user.email || 'cliente@ggflabs.com',
                        cpfCnpj: '00000000000', // Asaas expects CPF format. In production, this should come from user profile.
                        postalCode: '01310100',
                        addressNumber: '1000',
                        phone: '11999999999'
                    };
                }

                const { data: paymentRes, error: paymentError } = await supabase.functions.invoke('asaas-create-payment', {
                    body: {
                        rideId: newRide.id,
                        clienteId: user.id,
                        value: estimatedPrice,
                        billingType: billingType,
                        description: `GGF ${billingType} - Corrida ${newRide.id.split('-')[0]}`,
                        ...(paymentMethod === 'credit_card' ? { creditCard, creditCardHolderInfo } : {})
                    }
                });

                if (paymentError || !paymentRes?.success) {
                    console.error("Erro ao gerar pagamento no Asaas:", paymentError || paymentRes);
                    alert(`Aviso: Falha ao processar pagamento via ${billingType}. Continuaremos buscando um motorista, mas o pagamento deverá ser resolvido depois.`);
                    setRideState('searching');
                } else {
                    if (paymentMethod === 'pix') {
                        setPixData(paymentRes.pix);
                        setRideState('pix_payment');
                    } else {
                        // Cartão Aprovado
                        setRideState('searching');
                    }
                }
            } else {
                setRideState('searching');
            }

            await findAndAssignDriver(newRide.id, []);

        } catch (error: any) {
            const errorDetails = {
                msg: error?.message || 'No message',
                details: error?.details || 'No details',
                hint: error?.hint || 'No hint',
                code: error?.code || 'No code',
                fullError: error
            };
            console.error('CRITICAL: Erro ao iniciar corrida:', JSON.stringify(errorDetails, null, 2));
            console.dir(error);

            alert(`Erro ao iniciar solicitação: ${error.message || 'Erro desconhecido'}\n\nDetalhes: ${error.details || ''}`);
            setRideState('idle');
            setIsPanelOpen(false);
        }
    };

    // Configura o título do AdaptivePanel dinamicamente
    const getPanelTitle = () => {
        switch (rideState) {
            case 'filling_details': return "Detalhes do Veículo";
            case 'payment': return "Revisão e Pagamento";
            case 'pix_payment': return "Pagamento via Pix";
            default: return undefined;
        }
    };

    const handleCancelRide = async () => {
        console.log("DEBUG: handleCancelRide triggered", { currentRideId });
        const confirmed = window.confirm("Deseja realmente cancelar seu chamado?");

        if (confirmed) {
            console.log("DEBUG: Cancellation confirmed by user");
            if (currentRideId) {
                // Buscamos info da corrida para saber se precisa de estorno
                const { data: rideData } = await supabase
                    .from('corridas')
                    .select('asaas_payment_id, asaas_payment_status, forma_pagamento')
                    .eq('id', currentRideId)
                    .single();

                // Se foi pago via Pix e o status no Asaas indica que já recebemos o dinheiro
                const rData: any = rideData;
                if (rData?.asaas_payment_id &&
                    rData.forma_pagamento === 'pix' &&
                    (rData.asaas_payment_status === 'RECEIVED' || rData.asaas_payment_status === 'CONFIRMED')) {

                    console.log("DEBUG: Triggering automatic refund for Pix payment...");
                    try {
                        const { data, error: refundError } = await supabase.functions.invoke('asaas-refund-payment', {
                            body: { rideId: currentRideId }
                        });

                        if (refundError) throw refundError;
                        console.log("DEBUG: Refund requested successfully", data);
                        alert("Sua corrida foi cancelada e o valor do Pix será estornado automaticamente.");
                    } catch (err) {
                        console.error("DEBUG: Error triggering refund:", err);
                        // Fallback: apenas cancela no banco
                        await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', currentRideId);
                        alert("Corrida cancelada. Ocorreu um erro no estorno automático, por favor entre em contato com o suporte.");
                    }
                } else {
                    const { error } = await supabase.from('corridas').update({ status: 'cancelada' }).eq('id', currentRideId);
                    if (error) {
                        console.error("DEBUG: Error updating ride status to canceled:", error);
                    } else {
                        console.log("DEBUG: Ride status updated to canceled in database");
                    }
                }
            } else {
                console.warn("DEBUG: No currentRideId found to cancel in database");
            }
            resetRide();
            console.log("DEBUG: rideState reset to idle");
        } else {
            console.log("DEBUG: Cancellation aborted by user");
        }
    }

    return (
        <div className="relative w-full h-[100dvh] bg-gray-100 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Map
                    mapId="cliente-map"
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={15}
                    disableDefaultUI={true}
                    gestureHandling="greedy"
                    colorScheme="LIGHT"
                >
                    {location && !destination && (
                        <AdvancedMarker position={location} title="Local de Resgate">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </AdvancedMarker>
                    )}
                </Map>
            </div>

            {/* 1. Idle Flow: Search Box and CTA */}
            {rideState === 'idle' && (
                <>
                    <RideAddressSearch
                        originAddressName={originAddressName}
                        setOriginAddressName={setOriginAddressName}
                        placeAutocompleteRef={placeAutocompleteRef}
                    />

                    <div className="absolute bottom-[88px] md:bottom-12 md:left-6 left-5 right-5 md:right-auto md:w-[380px] z-[40] pointer-events-none">
                        <button
                            onClick={requestRide}
                            className="pointer-events-auto w-full bg-black text-white py-[18px] rounded-2xl font-bold text-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            Solicitar Resgate
                        </button>
                    </div>
                </>
            )}

            {/* SPA Navigation Flow (AdaptivePanel) */}
            <AdaptivePanel
                isOpen={isPanelOpen}
                onClose={() => {
                    if (rideState === 'filling_details' || rideState === 'payment') {
                        setRideState('idle');
                        setIsPanelOpen(false);
                    }
                }}
                title={getPanelTitle()}
                dismissible={rideState === 'filling_details' || rideState === 'payment'}
                snapPoints={[1]}
            >
                {rideState === 'filling_details' && (
                    <div className="w-full h-full flex flex-col">
                        <RideVehicleForm
                            placa={placa} setPlaca={setPlaca}
                            cor={cor} setCor={setCor}
                            marcaModelo={marcaModelo} setMarcaModelo={setMarcaModelo}
                            problemaDescricao={problemaDescricao} setProblemaDescricao={setProblemaDescricao}
                            problemaTipo={problemaTipo} setProblemaTipo={setProblemaTipo}
                            localRemocao={localRemocao} setLocalRemocao={setLocalRemocao}
                            problemTypes={problemTypes}
                            isFormValid={Boolean(isFormValid)}
                            onConfirm={handleConfirmDetails}
                        />
                    </div>
                )}

                {rideState === 'payment' && (
                    <div className="w-full h-full flex flex-col">
                        <RidePaymentForm
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            ccNumber={ccNumber} setCcNumber={setCcNumber}
                            ccName={ccName} setCcName={setCcName}
                            ccExpiry={ccExpiry} setCcExpiry={setCcExpiry}
                            ccCvv={ccCvv} setCcCvv={setCcCvv}
                            estimatedPrice={estimatedPrice}
                            distanceKm={distanceKm}
                            onConfirm={handleConfirmPayment}
                        />
                    </div>
                )}
                {rideState === 'pix_payment' && pixData && (
                    <div className="w-full h-full flex flex-col">
                        <RidePixDisplay
                            pixData={pixData}
                            onClose={() => {
                                setIsPanelOpen(false);
                                setRideState('searching');
                            }}
                        />
                    </div>
                )}
            </AdaptivePanel>

            {/* 3. Status Overlays (Outside Panel for True Float) */}
            {rideState === 'searching' && (
                <RideSearchingStatus onCancel={handleCancelRide} />
            )}

            {rideState === 'active' && (
                <RideActiveStatus
                    rideId={currentRideId || ''}
                    driverInfo={driverInfo}
                    status={rideData?.status}
                    onCancel={handleCancelRide}
                />
            )}
        </div>
    );
}
