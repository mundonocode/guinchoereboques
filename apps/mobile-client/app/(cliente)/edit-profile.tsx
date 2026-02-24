import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArrowLeft, User, Camera } from 'lucide-react-native';
import { uploadImage } from '../../src/lib/storage';

export default function EditProfileScreen() {
    const router = useRouter();
    const { session } = useAuth();

    const [loadingInit, setLoadingInit] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);

    const handleCpfChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setCpf(value);
    };

    const handlePhoneChange = (text: string) => {
        let value = text.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        setTelefone(value);
    };

    useEffect(() => {
        async function fetchProfile() {
            if (!session?.user) return;
            try {
                const { data, error } = await supabase
                    .from('perfis')
                    .select('nome_completo, cpf, telefone, foto_url')
                    .eq('id', session.user.id)
                    .single();

                if (!error && data) {
                    setNome(data.nome_completo || '');
                    setCpf(data.cpf || '');
                    setTelefone(data.telefone || '');
                    if (data.foto_url) setFotoUrl(data.foto_url);
                }
            } catch (err) {
                console.error('Error fetching profile details', err);
            } finally {
                setLoadingInit(false);
            }
        }
        fetchProfile();
    }, [session]);

    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFotoUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!nome) {
            Alert.alert('Atenção', 'O campo Nome é obrigatório.');
            return;
        }

        setSaving(true);
        try {
            let finalFotoUrl = fotoUrl;
            if (fotoUrl && !fotoUrl.startsWith('http')) {
                const uploadedUrl = await uploadImage(fotoUrl);
                if (uploadedUrl) finalFotoUrl = uploadedUrl;
            }

            const { error } = await supabase
                .from('perfis')
                .update({
                    nome_completo: nome,
                    cpf: cpf,
                    telefone: telefone,
                    foto_url: finalFotoUrl,
                    avatar_url: finalFotoUrl
                })
                .eq('id', session?.user?.id);

            if (error) throw error;

            Alert.alert('Sucesso', 'Seus dados foram atualizados com sucesso.', [
                { text: 'OK', onPress: () => router.replace('/(cliente)/profile') }
            ]);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Erro', 'Não foi possível atualizar seu perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingInit) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.replace('/(cliente)/profile')} style={styles.backButton}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/(cliente)/profile')} style={styles.backButton} disabled={saving}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>

                    <View style={styles.avatarSection}>
                        <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} disabled={saving}>
                            {fotoUrl ? (
                                <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <User size={40} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={styles.cameraIconBadge}>
                                <Camera size={14} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarHint}>Toque para alterar sua foto</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.label}>Nome Completo *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Seu nome"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Text style={styles.label}>CPF</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="000.000.000-00"
                            keyboardType="numeric"
                            maxLength={14}
                            value={cpf}
                            onChangeText={handleCpfChange}
                        />

                        <Text style={styles.label}>Telefone / WhatsApp</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="(00) 00000-0000"
                            keyboardType="phone-pad"
                            maxLength={15}
                            value={telefone}
                            onChangeText={handlePhoneChange}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#111827',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 12,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    saveButton: {
        backgroundColor: '#111827',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
