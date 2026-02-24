import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { format, startOfDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wallet, TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MotoristaEarningsScreen() {
    const { session } = useAuth();
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dailyEarnings, setDailyEarnings] = useState(0);
    const [weeklyEarnings, setWeeklyEarnings] = useState(0);

    useEffect(() => {
        fetchEarningsAndHistory();
    }, [session]);

    const fetchEarningsAndHistory = async () => {
        if (!session?.user.id) return;
        setLoading(true);

        try {
            // Fetch completed rides for this driver
            const { data, error } = await supabase
                .from('corridas')
                .select('*')
                .eq('motorista_id', session.user.id)
                .eq('status', 'finalizada')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRides(data || []);

            // Calculate earnings
            const now = new Date();
            const todayStart = startOfDay(now);
            const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start

            let sumToday = 0;
            let sumWeek = 0;

            data?.forEach(ride => {
                const rideDate = new Date(ride.created_at);
                const value = ride.valor || 0;

                if (rideDate >= weekStart) {
                    sumWeek += value;
                }
                if (rideDate >= todayStart) {
                    sumToday += value;
                }
            });

            setDailyEarnings(sumToday);
            setWeeklyEarnings(sumWeek);
        } catch (err) {
            console.error('Error fetching earnings:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderRideItem = ({ item }: { item: any }) => {
        const dateFormatted = format(new Date(item.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR });
        const priceFormatted = `R$ ${item.valor.toFixed(2).replace('.', ',')}`;

        return (
            <View style={styles.rideCard}>
                <View style={styles.rideHeader}>
                    <View style={styles.dateContainer}>
                        <Calendar size={14} color="#6B7280" />
                        <Text style={styles.rideDate}>{dateFormatted}</Text>
                    </View>
                    <Text style={styles.ridePrice}>{priceFormatted}</Text>
                </View>

                <View style={styles.locationContainer}>
                    <View style={styles.timelinePoint} />
                    <View style={styles.timelineLine} />
                    <View style={[styles.timelinePoint, { backgroundColor: '#EF4444' }]} />

                    <View style={styles.addressList}>
                        <Text style={styles.addressText} numberOfLines={1}>
                            <Text style={styles.addressLabel}>Origem: </Text>
                            {item.origem_endereco}
                        </Text>
                        <Text style={[styles.addressText, { marginTop: 16 }]} numberOfLines={1}>
                            <Text style={styles.addressLabel}>Destino: </Text>
                            {item.destino_endereco}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.loadingText}>Calculando seus ganhos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Seus Ganhos</Text>
                <Text style={styles.headerSubtitle}>Acompanhe seu desempenho na plataforma</Text>
            </View>

            <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                        <Wallet size={20} color="#0284C7" />
                    </View>
                    <Text style={styles.metricLabel}>Hoje</Text>
                    <Text style={styles.metricValue}>
                        R$ {dailyEarnings.toFixed(2).replace('.', ',')}
                    </Text>
                </View>

                <View style={styles.metricCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                        <TrendingUp size={20} color="#16A34A" />
                    </View>
                    <Text style={styles.metricLabel}>Esta Semana</Text>
                    <Text style={styles.metricValue}>
                        R$ {weeklyEarnings.toFixed(2).replace('.', ',')}
                    </Text>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Histórico de Corridas</Text>
                <Text style={styles.listCount}>{rides.length} finalizadas</Text>
            </View>

            <FlatList
                data={rides}
                keyExtractor={(item) => item.id}
                renderItem={renderRideItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <DollarSign size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Você ainda não realizou corridas.</Text>
                        <Text style={styles.emptySubtext}>Conecte-se para começar a receber chamados.</Text>
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
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 16,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
    metricsContainer: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 4,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    listCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    rideCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    rideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rideDate: {
        marginLeft: 6,
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    ridePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    locationContainer: {
        flexDirection: 'row',
    },
    timelinePoint: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3B82F6',
        marginTop: 4,
    },
    timelineLine: {
        position: 'absolute',
        top: 14,
        left: 4,
        width: 2,
        height: '100%',
        backgroundColor: '#E5E7EB',
        zIndex: -1,
    },
    addressList: {
        flex: 1,
        marginLeft: 12,
    },
    addressText: {
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },
    addressLabel: {
        fontWeight: '600',
        color: '#6B7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '500',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    }
});
