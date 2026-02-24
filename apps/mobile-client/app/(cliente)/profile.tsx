import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { LogOut, User, Settings, Shield, HelpCircle, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut, userRole, session } = useAuth();
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        if (!session?.user) return;
        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('nome_completo')
                .eq('id', session.user.id)
                .single();

            if (!error && data) {
                setNome(data.nome_completo);
            }
        } catch (err) {
            console.error('Error fetching profile name', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [session]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const MenuItem = ({ icon: Icon, title, isDestructive = false, onPress }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.iconContainer, isDestructive && styles.iconContainerDestructive]}>
                <Icon size={20} color={isDestructive ? '#EF4444' : '#111827'} />
            </View>
            <Text style={[styles.menuItemText, isDestructive && styles.menuItemTextDestructive]}>
                {title}
            </Text>
            {!isDestructive && <ChevronRight size={20} color="#D1D5DB" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Text style={styles.headerTitle}>Meu Perfil</Text>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <User size={32} color="#fff" />
                    </View>
                    <View style={styles.profileInfo}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#111827" style={{ alignSelf: 'flex-start' }} />
                        ) : (
                            <Text style={styles.name}>{nome || 'Usuário Cliente'}</Text>
                        )}
                        <Text style={styles.email}>{session?.user.email}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>CONTA {userRole?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Configurações</Text>
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon={User}
                        title="Editar Dados Pessoais"
                        onPress={() => router.push('/(cliente)/edit-profile')}
                    />
                    <MenuItem
                        icon={Shield}
                        title="Privacidade e Termos"
                        onPress={() => router.push('/privacy')}
                    />
                    <MenuItem icon={Settings} title="Notificações" />
                </View>

                <Text style={styles.sectionTitle}>Suporte</Text>
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon={HelpCircle}
                        title="Ajuda e Contato"
                        onPress={() => router.push('/support')}
                    />
                    <MenuItem icon={LogOut} title="Sair da Conta" isDestructive={true} onPress={signOut} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 24,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 32,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    menuContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainerDestructive: {
        backgroundColor: '#FEF2F2',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    menuItemTextDestructive: {
        color: '#EF4444',
    },
});
