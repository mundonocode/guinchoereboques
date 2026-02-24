import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin, CheckCircle, XCircle, ChevronRight, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ClienteHistoryScreen() {
    const { session } = useAuth();
    const router = useRouter();
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [session]);

    const fetchHistory = async () => {
        if (!session?.user.id) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('corridas')
                .select('*')
                .eq('cliente_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRides(data || []);
        } catch (err) {
            console.error('Error fetching client history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'finalizada':
                return { label: 'Finalizada', color: '#16A34A', icon: <CheckCircle size={16} color="#16A34A" /> };
            case 'cancelada':
                return { label: 'Cancelada', color: '#EF4444', icon: <XCircle size={16} color="#EF4444" /> };
            case 'buscando_motorista':
            case 'aceita':
            case 'a_caminho':
            case 'no_local':
            case 'em_rota_destino':
                return { label: 'Em Andamento', color: '#3B82F6', icon: <Clock size={16} color="#3B82F6" /> };
            default:
                return { label: 'Desconhecido', color: '#6B7280', icon: <Clock size={16} color="#6B7280" /> };
        }
    };

    const renderRideItem = ({ item }: { item: any }) => {
        const dateFormatted = format(new Date(item.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
        const priceFormatted = `R$ ${item.valor?.toFixed(2).replace('.', ',') || '0,00'}`;
        const statusInfo = getStatusInfo(item.status);

        return (
            <TouchableOpacity
                style={styles.rideCard}
                onPress={() => {
                    // Se for corrida ativa, voltar pro mapa pra visualizar, senão só um detalhe visual
                    if (statusInfo.label === 'Em Andamento') {
                        router.push('/(cliente)');
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{dateFormatted}</Text>
                    <Text style={styles.priceText}>{priceFormatted}</Text>
                </View>

                <View style={styles.locationsWrapper}>
                    <View style={styles.routeVisual}>
                        <View style={styles.dotStart} />
                        <View style={styles.line} />
                        <View style={styles.dotEnd} />
                    </View>
                    <View style={styles.addresses}>
                        <Text style={styles.addressText} numberOfLines={1}>
                            {item.origem_endereco || "Origem desconhecida"}
                        </Text>
                        <Text style={[styles.addressText, { marginTop: 16 }]} numberOfLines={1}>
                            {item.destino_endereco || "Destino desconhecido"}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.statusBadge}>
                        {statusInfo.icon}
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                    <ChevronRight size={20} color="#D1D5DB" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Minhas Corridas</Text>
                <Text style={styles.headerSubtitle}>Confira o histórico dos guinchos solicitados</Text>
            </View>

            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderRideItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Truck size={64} color="#E5E7EB" style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyTitle}>Nenhuma corrida ainda</Text>
                        <Text style={styles.emptySubtitle}>Quando você solicitar um guincho, ele aparecerá aqui.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    rideCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    locationsWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    routeVisual: {
        alignItems: 'center',
        marginRight: 12,
        marginTop: 4,
    },
    dotStart: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3B82F6',
    },
    dotEnd: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
    },
    line: {
        width: 2,
        height: 20,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
    addresses: {
        flex: 1,
        justifyContent: 'space-between',
    },
    addressText: {
        fontSize: 14,
        color: '#374151',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 30,
    }
});
