import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Avaliacao {
    id: string;
    nota: number;
    comentario: string | null;
    created_at: string;
    avaliador_nome: string;
}

export default function AvaliacoesScreen() {
    const { session } = useAuth();
    const router = useRouter();
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState(0);
    const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

    useEffect(() => {
        fetchAvaliacoes();
    }, []);

    const fetchAvaliacoes = async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('avaliacoes')
                .select(`
                    id,
                    nota,
                    comentario,
                    created_at,
                    perfis!avaliacoes_avaliador_id_fkey ( nome_completo )
                `)
                .eq('avaliado_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map((a: any) => ({
                id: a.id,
                nota: a.nota,
                comentario: a.comentario,
                created_at: a.created_at,
                avaliador_nome: a.perfis?.nome_completo || 'Cliente'
            }));

            setAvaliacoes(mapped);
            setTotalAvaliacoes(mapped.length);

            if (mapped.length > 0) {
                const avg = mapped.reduce((sum: number, a: Avaliacao) => sum + a.nota, 0) / mapped.length;
                setMedia(avg);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderStars = (nota: number) => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    size={14}
                    color={s <= nota ? '#FBBF24' : '#E5E7EB'}
                    fill={s <= nota ? '#FBBF24' : 'transparent'}
                />
            ))}
        </View>
    );

    const renderItem = ({ item }: { item: Avaliacao }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{item.avaliador_nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardMeta}>
                    <Text style={styles.cardName}>{item.avaliador_nome}</Text>
                    <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                </View>
                {renderStars(item.nota)}
            </View>
            {item.comentario ? (
                <View style={styles.commentBox}>
                    <MessageSquare size={14} color="#6B7280" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.commentText}>{item.comentario}</Text>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Minhas Avaliações</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#111" />
                </View>
            ) : (
                <>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryLeft}>
                            <Text style={styles.summaryScore}>{media.toFixed(1)}</Text>
                            {renderStars(Math.round(media))}
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRight}>
                            <Text style={styles.summaryCount}>{totalAvaliacoes}</Text>
                            <Text style={styles.summaryLabel}>avaliações recebidas</Text>
                        </View>
                    </View>

                    {/* List */}
                    <FlatList
                        data={avaliacoes}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Star size={48} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
                                <Text style={styles.emptySubtitle}>Suas avaliações de clientes aparecerão aqui após as corridas.</Text>
                            </View>
                        }
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryLeft: {
        flex: 1,
        alignItems: 'center',
    },
    summaryScore: {
        fontSize: 40,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    summaryDivider: {
        width: 1,
        height: 60,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 20,
    },
    summaryRight: {
        flex: 1,
        alignItems: 'center',
    },
    summaryCount: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardAvatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
    },
    cardMeta: {
        flex: 1,
    },
    cardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    cardDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    commentBox: {
        flexDirection: 'row',
        marginTop: 12,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
    },
    commentText: {
        flex: 1,
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
    },
});
