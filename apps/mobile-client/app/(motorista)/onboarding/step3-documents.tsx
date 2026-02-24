import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Camera, CheckCircle, UploadCloud, ArrowLeft, FileCheck, Image as ImageIcon } from 'lucide-react-native';
import { uploadImage } from '../../../src/lib/storage';

export default function Step3Documents() {
    const router = useRouter();
    const { session } = useAuth();

    const [cnhUri, setCnhUri] = useState<string | null>(null);
    const [veiculoUri, setVeiculoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async (setImageFunc: (uri: string) => void) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria para enviar os documentos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6,
        });

        if (!result.canceled) {
            setImageFunc(result.assets[0].uri);
        }
    };

    const handleFinish = async () => {
        if (!cnhUri || !veiculoUri) {
            Alert.alert('Atenção', 'Envie as fotos obrigatórias da sua CNH e do seu Veículo.');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload Images
            let cnhUrl = cnhUri;
            let veiculoUrl = veiculoUri;

            if (cnhUri && !cnhUri.startsWith('http')) {
                const uploaded = await uploadImage(cnhUri, 'documentos');
                if (uploaded) cnhUrl = uploaded;
            }

            if (veiculoUri && !veiculoUri.startsWith('http')) {
                const uploaded = await uploadImage(veiculoUri, 'documentos');
                if (uploaded) veiculoUrl = uploaded;
            }

            // 2. Update Profile status
            const { error } = await supabase
                .from('perfis')
                .update({
                    // Custom columns for verification
                    cnh_foto_url: cnhUrl,
                    veiculo_foto_url: veiculoUrl,
                    onboarding_completo: true,
                    status_verificacao: 'pendente'
                })
                .eq('id', session?.user?.id);

            if (error) throw error;

            Alert.alert(
                'Tudo Certo!',
                'Seus dados foram enviados e estão em análise. Você já pode acessar o aplicativo enquanto verificamos tudo.',
                [{ text: 'Entrar no App', onPress: () => router.replace('/(motorista)') }]
            );

        } catch (error: any) {
            console.error('Error finalizing onboarding:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao enviar os dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const DocumentBlock = ({ title, description, uri, setImageFunc }: any) => (
        <View style={styles.docBlock}>
            <View style={styles.docTextCol}>
                <Text style={styles.docTitle}>{title}</Text>
                <Text style={styles.docDesc}>{description}</Text>
            </View>
            <TouchableOpacity
                style={[styles.uploadBox, uri && styles.uploadBoxSuccess]}
                onPress={() => pickImage(setImageFunc)}
            >
                {uri ? (
                    <Image source={{ uri }} style={styles.uploadedImage} />
                ) : (
                    <View style={styles.placeholderIcon}>
                        <ImageIcon color="#9CA3AF" size={24} />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <FileCheck color="#FFF" size={24} />
                    </View>
                    <Text style={styles.title}>Quase lá!</Text>
                    <Text style={styles.subtitle}>Precisamos de fotos nítidas dos seus documentos para a aprovação final.</Text>
                </View>

                <DocumentBlock
                    title="CNH do Motorista"
                    description="Envie uma foto da sua Carteira de Habilitação aberta."
                    uri={cnhUri}
                    setImageFunc={setCnhUri}
                />

                <DocumentBlock
                    title="Foto do Caminhão"
                    description="Envie uma foto do seu veículo que mostre bem a placa."
                    uri={veiculoUri}
                    setImageFunc={setVeiculoUri}
                />

                <View style={styles.infoBox}>
                    <UploadCloud color="#111" size={20} style={{ marginRight: 12 }} />
                    <Text style={styles.infoBoxText}>
                        Seus documentos serão analisados em até <Text style={{ fontWeight: 'bold' }}>24 horas úteis</Text>.
                    </Text>
                </View>

                <View style={{ flex: 1 }} />

                <View style={styles.footerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
                        <ArrowLeft color="#111" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextButton, (!cnhUri || !veiculoUri) && styles.nextButtonDisabled]}
                        onPress={handleFinish}
                        disabled={loading || !cnhUri || !veiculoUri}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.nextButtonText}>Finalizar Cadastro</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
        marginTop: 8,
    },
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    docBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    docTextCol: {
        flex: 1,
        marginRight: 16,
    },
    docTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    docDesc: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    uploadBox: {
        width: 80,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadBoxSuccess: {
        borderColor: '#111',
        borderWidth: 2,
    },
    placeholderIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        alignItems: 'center',
    },
    infoBoxText: {
        flex: 1,
        fontSize: 12,
        color: '#111827',
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        marginTop: 32,
        marginBottom: Platform.OS === 'ios' ? 8 : 0,
    },
    backButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#111',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
