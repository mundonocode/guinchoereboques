import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArrowLeft, Camera, ShieldCheck } from 'lucide-react-native';

export default function ManageDocumentsScreen() {
    const router = useRouter();
    const { session } = useAuth();

    const [loading, setLoading] = useState(false);

    const handleReuploadDocument = () => {
        Alert.alert(
            'Atenção: Reanálise de Perfil',
            'Atualizar a foto do seu documento mudará o status da sua conta para EM ANÁLISE e você não poderá receber corridas temporariamente. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sim, Atualizar', style: 'destructive', onPress: pickAndUploadImage }
            ]
        );
    };

    const pickAndUploadImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Erro", "Permissão necessária para acessar a galeria.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                // Here we simulate the upload and the profile status reset
                const { error } = await supabase
                    .from('perfis')
                    .update({
                        is_active: false // Locks the account
                    })
                    .eq('id', session?.user?.id);

                if (error) throw error;

                Alert.alert(
                    'Sucesso',
                    'Documento enviado. Sua conta está em análise novamente pela nossa equipe.',
                    [{ text: 'Voltar ao App', onPress: () => router.replace('/(motorista)') }]
                );
            } catch (error) {
                console.error('Error updating document:', error);
                Alert.alert('Erro', 'Houve um problema ao enviar seu documento.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/(motorista)/profile')} style={styles.backButton} disabled={loading}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documentos Protegidos</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.infoBox}>
                    <ShieldCheck color="#111" size={24} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoBoxTitle}>Conta Aprovada e Ativa</Text>
                        <Text style={styles.infoBoxText}>
                            Seus documentos atuais já foram validados pela nossa equipe. Qualquer alteração exigirá uma nova avaliação administrativa.
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>CNH do Motorista</Text>
                <View style={styles.docBlock}>
                    <View style={styles.docTextCol}>
                        <Text style={styles.docDesc}>Sua Carteira Nacional de Habilitação oficial vinculada ao seu cadastro e liberada.</Text>
                    </View>
                    <TouchableOpacity style={styles.reuploadBtn} onPress={handleReuploadDocument} disabled={loading}>
                        <Camera color="#111" size={20} />
                        <Text style={styles.reuploadBtnText}>Trocar Foto</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Foto do Caminhão (Placa)</Text>
                <View style={styles.docBlock}>
                    <View style={styles.docTextCol}>
                        <Text style={styles.docDesc}>Foto traseira mostrando a placa legível do veículo de trabalho principal ou reboque.</Text>
                    </View>
                    <TouchableOpacity style={styles.reuploadBtn} onPress={handleReuploadDocument} disabled={loading}>
                        <Camera color="#111" size={20} />
                        <Text style={styles.reuploadBtnText}>Trocar Foto</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#111" />
                    <Text style={styles.loadingText}>Enviando documento de forma segura...</Text>
                </View>
            )}
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    infoBoxTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 4,
    },
    infoBoxText: {
        fontSize: 13,
        color: '#15803D',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    docBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    docTextCol: {
        flex: 1,
        marginRight: 16,
    },
    docDesc: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    reuploadBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        minWidth: 90,
    },
    reuploadBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111',
        marginTop: 6,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    }
});
