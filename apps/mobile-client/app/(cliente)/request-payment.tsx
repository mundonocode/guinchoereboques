import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react-native';
import { useRequestStore } from '../../store/useRequestStore';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import * as Location from 'expo-location';
import PixModal from '../../src/components/PixModal';
import { formatCardNumber, formatCardExpiry, formatCVV } from '../../src/utils/paymentUtils';

export default function RequestPaymentScreen() {
    const router = useRouter();
    const { session, cpf, telefone } = useAuth();
    const { requestDetails, currentRideId, setCurrentRideId, resetRequestDetails } = useRequestStore();

    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('pix');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs for Credit Card
    const [ccNumber, setCcNumber] = useState('');
    const [ccName, setCcName] = useState('');
    const [ccExpiry, setCcExpiry] = useState('');
    const [ccCvv, setCcCvv] = useState('');
    const [ccCep, setCcCep] = useState('');
    const [ccAddressNumber, setCcAddressNumber] = useState('');

    const [pixData, setPixData] = useState<any>(null);
    const [isPixModalVisible, setIsPixModalVisible] = useState(false);
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

    // Escuta mudanças na tabela corridas via Realtime
    useEffect(() => {
        if (!isPixModalVisible || !currentRideId) return;

        console.log('Cliente subscribing to payment updates:', currentRideId);

        const subscription = supabase
            .channel(`payment_wait_${currentRideId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'corridas',
                    filter: `id=eq.${currentRideId}`
                },
                (payload) => {
                    console.log('Payment update received via Realtime:', payload.new);
                    if (payload.new.status === 'buscando_motorista') {
                        setIsPixModalVisible(false);
                        router.replace('/(cliente)?searching=true');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [isPixModalVisible, currentRideId]);

    const handleVerifyPayment = async () => {
        if (!currentRideId) {
            console.log('No current ride ID.');
            return;
        }

        setIsVerifyingPayment(true);
        console.log('Manual verify for ride:', currentRideId);

        try {
            const { data, error } = await supabase.functions.invoke('asaas-check-payment', {
                body: { rideId: currentRideId }
            });

            console.log('Edge function response:', { data, error });

            if (error) {
                console.error("Error from edge function:", error);
                Alert.alert("Aviso", "Não foi possível verificar o pagamento neste momento. Tente novamente.");
                return;
            }

            // A função retorna { success: true, asaas_status: "MATCH", ride_status: "MATCH" } ou um erro no JSON
            if (data?.error) {
                console.error("Edge function returned error payload:", data.error);
                Alert.alert("Erro", data.error);
                return;
            }

            if (data?.ride_status === 'buscando_motorista') {
                console.log('Payment confirmed! Navigating to searching...');
                setIsPixModalVisible(false);
                router.replace('/(cliente)?searching=true');
            } else {
                console.log('Payment NOT confirmed yet. Status:', data?.asaas_status);
                Alert.alert(
                    "Pagamento Pendente",
                    "O Asaas ainda não confirmou o recebimento deste Pix.\nPode levar alguns segundos. Aguarde ou feche para continuar."
                );
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            Alert.alert("Aviso", "Erro ao comunicar com o servidor de pagamento.");
        } finally {
            setIsVerifyingPayment(false);
        }
    };

    // Valores simulados para exibição, já que estamos implementando a navegação
    // Em um fluxo real, preencheríamos a store na index.tsx
    const estimatedPrice = requestDetails.precoEstimado || 180.00;
    const distanceKm = requestDetails.distanciaEstimadaKm || 12.5;

    const handleConfirmAndRequest = async () => {
        if (!session?.user.id) return;

        // Basic validation for Credit Card
        if (paymentMethod === 'credit_card') {
            if (ccNumber.length < 16 || ccExpiry.length < 5 || ccCvv.length < 3 || !ccName || !ccCep || !ccAddressNumber) {
                Alert.alert("Dados Incompletos", "Por favor, preencha todos os campos do cartão e o endereço de cobrança.");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            // Create the ride record with details
            const { data: rideData, error: rideError } = await supabase
                .from('corridas')
                .insert({
                    cliente_id: session.user.id,
                    origem_endereco: requestDetails.enderecoOrigem || 'Av. Paulista, 1000 - São Paulo',
                    origem_lat: requestDetails.origem?.latitude || -23.561,
                    origem_lng: requestDetails.origem?.longitude || -46.656,
                    destino_endereco: requestDetails.enderecoDestino || 'Destino Desconhecido',
                    destino_lat: requestDetails.destino?.latitude || -23.550,
                    destino_lng: requestDetails.destino?.longitude || -46.633,
                    valor: estimatedPrice,
                    distancia_km: distanceKm,
                    status: 'pendente_pagamento', // Always set to pending payment initially
                    veiculo_placa: requestDetails.placa,
                    veiculo_cor: requestDetails.cor,
                    veiculo_marca_modelo: requestDetails.marcaModelo,
                    problema_descricao: requestDetails.problemaDescricao,
                    problema_tipo: requestDetails.problemaTipo,
                    local_remocao: requestDetails.localRemocao,
                    metodo_pagamento: paymentMethod
                })
                .select()
                .single();

            if (rideError) throw rideError;
            if (!rideData) throw new Error("Falha ao criar corrida");

            setCurrentRideId(rideData.id);

            // Se for Pix ou Cartão, gerar cobrança no Asaas
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
                        email: session.user.email || 'cliente@plataforma.com',
                        cpfCnpj: cpf || '00000000000', 
                        postalCode: ccCep.replace(/\D/g, ''),
                        addressNumber: ccAddressNumber,
                        phone: telefone || session.user.user_metadata?.phone || '11999999999'
                    };
                }

                console.log(`Generating ${billingType} for ride:`, rideData.id);

                // Explicitly get session to ensure token is fresh and present
                const { data: { session: freshSession } } = await supabase.auth.getSession();
                
                const { data: paymentRes, error: paymentError } = await supabase.functions.invoke('asaas-create-payment', {
                    headers: {
                        Authorization: `Bearer ${freshSession?.access_token || session?.access_token}`
                    },
                    body: {
                        rideId: rideData.id,
                        clienteId: session.user.id,
                        value: estimatedPrice,
                        billingType: billingType,
                        description: `GGF ${billingType} - Corrida ${rideData.id.split('-')[0]}`,
                        ...(paymentMethod === 'credit_card' ? { creditCard, creditCardHolderInfo } : {})
                    }
                });

                if (paymentError || !paymentRes?.success) {
                    console.error(`Erro completo ao gerar ${billingType} no mobile:`, JSON.stringify(paymentError || paymentRes, null, 2));
                    Alert.alert('Erro no Pagamento', `Não foi possível processar o seu pagamento via ${billingType}. Por favor, tente novamente ou mude o método.`);
                    setIsSubmitting(false); // Changed from setIsLoading to setIsSubmitting
                    return;
                } else {
                    if (paymentMethod === 'pix') {
                        setPixData(paymentRes.pix);
                        setIsPixModalVisible(true);
                    }
                    if (billingType === 'CREDIT_CARD') {
                        // Cartão Aprovado - Atualiza status da corrida para buscar motorista
                        await supabase
                            .from('corridas')
                            .update({ status: 'buscando_motorista' })
                            .eq('id', rideData.id);
                        
                        router.replace('/(cliente)?searching=true');
                    }
                }
            } else {
                // This block is for payment methods not handled by Asaas (e.g., cash, if implemented)
                // For now, it's assumed all payment methods go through Asaas or are 'pendente_pagamento'
                // If a non-Asaas payment method is added that doesn't require a pending state,
                // this would be the place to set status to 'buscando_motorista' directly.
                // For this change, we assume all paths lead to 'pendente_pagamento' initially,
                // and then 'buscando_motorista' upon successful payment or manual update.
                // So, this else block might need review depending on future payment methods.
                router.replace('/(cliente)?searching=true');
            }

        } catch (error: any) {
            console.error('Error creating ride:', error);
            Alert.alert('Erro', `Não foi possível solicitar o guincho: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmação e Pagamento</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Resumo Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.priceLabel}>VALOR TOTAL</Text>
                                <Text style={styles.priceValue}>
                                    R$ {estimatedPrice.toFixed(2).replace('.', ',')}
                                </Text>
                            </View>
                            <View style={styles.timeIcon}>
                                <Text style={{ fontSize: 16 }}>⏱️</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.metricsRow}>
                            <View>
                                <Text style={styles.metricLabel}>DISTÂNCIA</Text>
                                <Text style={styles.metricValue}>{distanceKm.toFixed(1)} km</Text>
                            </View>
                            <View>
                                <Text style={styles.metricLabel}>ETA</Text>
                                <Text style={styles.metricValue}>15-20 min</Text>
                            </View>
                        </View>
                    </View>

                    {/* Métodos de Pagamento */}
                    <Text style={styles.sectionTitle}>MÉTODO DE PAGAMENTO</Text>

                    <TouchableOpacity
                        style={[styles.paymentMethodCard, paymentMethod === 'pix' && styles.paymentMethodCardSelected]}
                        onPress={() => setPaymentMethod('pix')}
                    >
                        <View style={styles.paymentMethodIconRow}>
                            <Banknote size={24} color={paymentMethod === 'pix' ? '#111' : '#6B7280'} />
                            <View style={styles.paymentMethodTextContainer}>
                                <Text style={[styles.paymentMethodTitle, paymentMethod === 'pix' && styles.paymentMethodTitleSelected]}>
                                    Pix
                                </Text>
                                <Text style={styles.paymentMethodSubtitle}>Pagamento Instantâneo</Text>
                            </View>
                        </View>
                        <View style={[styles.radioOuter, paymentMethod === 'pix' && styles.radioOuterSelected]}>
                            {paymentMethod === 'pix' && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentMethodCard, paymentMethod === 'credit_card' && styles.paymentMethodCardSelected]}
                        onPress={() => setPaymentMethod('credit_card')}
                    >
                        <View style={styles.paymentMethodIconRow}>
                            <CreditCard size={24} color={paymentMethod === 'credit_card' ? '#111' : '#6B7280'} />
                            <View style={styles.paymentMethodTextContainer}>
                                <Text style={[styles.paymentMethodTitle, paymentMethod === 'credit_card' && styles.paymentMethodTitleSelected]}>
                                    Cartão de Crédito
                                </Text>
                                <Text style={styles.paymentMethodSubtitle}>Pague em até 12x</Text>
                            </View>
                        </View>
                        <View style={[styles.radioOuter, paymentMethod === 'credit_card' && styles.radioOuterSelected]}>
                            {paymentMethod === 'credit_card' && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    {paymentMethod === 'credit_card' && (
                        <View style={styles.cardForm}>
                            <Text style={styles.inputLabel}>NÚMERO DO CARTÃO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0000 0000 0000 0000"
                                keyboardType="numeric"
                                value={ccNumber}
                                onChangeText={(t) => setCcNumber(formatCardNumber(t))}
                                maxLength={19}
                            />

                            <Text style={styles.inputLabel}>NOME DO TITULAR</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome como impresso no cartão"
                                autoCapitalize="characters"
                                value={ccName}
                                onChangeText={setCcName}
                            />

                            <View style={styles.formRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>VALIDADE</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="MM/AA"
                                        keyboardType="numeric"
                                        value={ccExpiry}
                                        onChangeText={(t) => setCcExpiry(formatCardExpiry(t))}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123"
                                        keyboardType="numeric"
                                        secureTextEntry
                                        value={ccCvv}
                                        onChangeText={(t) => setCcCvv(formatCVV(t))}
                                        maxLength={4}
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>CEP DE COBRANÇA</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="00000-000"
                                        keyboardType="numeric"
                                        value={ccCep}
                                        onChangeText={setCcCep}
                                        maxLength={9}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>NÚMERO</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123"
                                        keyboardType="numeric"
                                        value={ccAddressNumber}
                                        onChangeText={setCcAddressNumber}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleConfirmAndRequest}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Confirmar e Solicitar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <PixModal
                visible={isPixModalVisible}
                pixData={pixData}
                onVerify={handleVerifyPayment}
                isVerifying={isVerifyingPayment}
                onClose={() => {
                    setIsPixModalVisible(false);
                    router.replace('/(cliente)?searching=true');
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
    },
    summaryCard: {
        backgroundColor: '#111827',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    priceValue: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
    },
    timeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 40,
    },
    metricLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    metricValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#FAFAFA',
    },
    paymentMethodCardSelected: {
        borderColor: '#111827',
        backgroundColor: '#FFFFFF',
    },
    paymentMethodIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethodTextContainer: {
        marginLeft: 16,
    },
    paymentMethodTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 2,
    },
    paymentMethodTitleSelected: {
        color: '#111827',
    },
    paymentMethodSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#111827',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#111827',
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    button: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cardForm: {
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        marginTop: -4,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    }
});
