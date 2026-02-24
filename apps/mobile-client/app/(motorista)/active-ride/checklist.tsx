import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Modal, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { Camera, CheckCircle, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { decode } from 'base64-arraybuffer';

export default function ChecklistScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const signatureRef = useRef<SignatureViewRef>(null);

    const [loading, setLoading] = useState(false);
    const [avarias, setAvarias] = useState('');

    // Photo URIs
    const [fotos, setFotos] = useState({
        frente: null as string | null,
        traseira: null as string | null,
        lateralEsq: null as string | null,
        lateralDir: null as string | null,
    });

    // Signature Modal
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    const takePhoto = async (position: keyof typeof fotos) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Atenção', 'Precisamos de permissão da câmera para tirar as fotos do checklist.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5, // Compress logic
            base64: true, // We need base64 for upload to Supabase
        });

        if (!result.canceled && result.assets[0].base64) {
            setFotos(prev => ({ ...prev, [position]: `data:image/jpeg;base64,${result.assets[0].base64}` }));
        }
    };

    const handleSignatureOK = (signature: string) => {
        setSignatureData(signature);
        setShowSignatureModal(false);
    };

    const handleSignatureClear = () => {
        signatureRef.current?.clearSignature();
        setSignatureData(null);
    };

    const uploadBase64Image = async (base64String: string, path: string) => {
        // Strip data prefix
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const { data, error } = await supabase.storage
            .from('corridas')
            .upload(path, decode(base64Data), {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error(`Erro ao subir imagem: ${path}`);
        }

        // Return public URL
        const { data: publicData } = supabase.storage.from('corridas').getPublicUrl(path);
        return publicData.publicUrl;
    };

    const handleFinalize = async () => {
        // Validation
        if (!fotos.frente || !fotos.traseira || !fotos.lateralEsq || !fotos.lateralDir) {
            Alert.alert('Incompleto', 'Tire as 4 fotos do veículo antes de prosseguir.');
            return;
        }
        if (!signatureData) {
            Alert.alert('Incompleto', 'A assinatura do cliente é obrigatória.');
            return;
        }

        setLoading(true);
        try {
            // Upload photos in parallel
            const [urlFrente, urlTraseira, urlEsq, urlDir, urlAssinatura] = await Promise.all([
                uploadBase64Image(fotos.frente, `${id}/checklist_frente.jpg`),
                uploadBase64Image(fotos.traseira, `${id}/checklist_traseira.jpg`),
                uploadBase64Image(fotos.lateralEsq, `${id}/checklist_esq.jpg`),
                uploadBase64Image(fotos.lateralDir, `${id}/checklist_dir.jpg`),
                uploadBase64Image(signatureData, `${id}/assinatura_embarque.jpg`),
            ]);

            // Update database
            const { error: updateError } = await supabase
                .from('corridas')
                .update({
                    status: 'em_rota_destino',
                    foto_veiculo_frente_url: urlFrente,
                    foto_veiculo_traseira_url: urlTraseira,
                    foto_veiculo_lateral_esq_url: urlEsq,
                    foto_veiculo_lateral_dir_url: urlDir,
                    avarias_pre_existentes: avarias,
                    assinatura_cliente_url: urlAssinatura
                })
                .eq('id', id);

            if (updateError) throw updateError;

            Alert.alert('Sucesso', 'Checklist finalizado! Rota iniciada.', [
                { text: 'OK', onPress: () => router.replace(`/(motorista)/active-ride/${id}`) }
            ]);

        } catch (error: any) {
            console.error('Error in checklist:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao salvar o checklist. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const renderPhotoBox = (title: string, position: keyof typeof fotos) => {
        const photoUri = fotos[position];
        return (
            <TouchableOpacity
                style={styles.photoBox}
                onPress={() => takePhoto(position)}
                activeOpacity={0.8}
            >
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Camera color="#9CA3AF" size={28} />
                        <Text style={styles.photoLabel}>{title}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Checklist de Embarque</Text>
            <Text style={styles.subtitle}>Registre o estado do veículo antes de iniciar o reboque.</Text>

            <View style={styles.photoGrid}>
                {renderPhotoBox('FRENTE', 'frente')}
                {renderPhotoBox('TRASEIRA', 'traseira')}
                {renderPhotoBox('LADO ESQUERDO', 'lateralEsq')}
                {renderPhotoBox('LADO DIREITO', 'lateralDir')}
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>AVARIAS PRÉ-EXISTENTES</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Descreva riscos, amassados ou problemas visíveis..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    value={avarias}
                    onChangeText={setAvarias}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>ASSINATURA DO CLIENTE</Text>
                <TouchableOpacity
                    style={styles.signatureBtn}
                    onPress={() => setShowSignatureModal(true)}
                >
                    {signatureData ? (
                        <Image source={{ uri: signatureData }} style={styles.signatureImage} resizeMode="contain" />
                    ) : (
                        <Text style={styles.signaturePlaceholder}>✎ Assine aqui</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.mainBtn}
                onPress={handleFinalize}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : (
                    <>
                        <CheckCircle size={20} color="#FFF" style={styles.btnIcon} />
                        <Text style={styles.mainBtnText}>Finalizar e Iniciar Rota</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Signature Modal */}
            <Modal
                visible={showSignatureModal}
                animationType="slide"
                transparent={false}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Assinatura do Cliente</Text>
                        <TouchableOpacity onPress={() => setShowSignatureModal(false)}>
                            <X color="#111" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signatureContainer}>
                        <SignatureScreen
                            ref={signatureRef}
                            onOK={handleSignatureOK}
                            onEmpty={() => Alert.alert("Atenção", "Por favor, assine antes de salvar.")}
                            descriptionText="Assine acima"
                            clearText="Limpar"
                            confirmText="Salvar"
                            webStyle={`
                                .m-signature-pad--footer {display: none; margin: 0px;} 
                                body,html { width: 100%; height: 100%; background-color: #F9FAFB; }
                            `}
                        />
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} onPress={handleSignatureClear}>
                            <Text style={[styles.modalBtnText, { color: '#111' }]}>Limpar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtn} onPress={() => signatureRef.current?.readSignature()}>
                            <Text style={styles.modalBtnText}>Salvar Assinatura</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        marginTop: Platform.OS === 'ios' ? 40 : 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 20,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    photoBox: {
        width: '48%',
        aspectRatio: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        marginBottom: 16,
        overflow: 'hidden',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoLabel: {
        marginTop: 8,
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 0.5,
    },
    photoThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 16,
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 100,
    },
    signatureBtn: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signaturePlaceholder: {
        color: '#9CA3AF',
        fontSize: 14,
        fontStyle: 'italic',
    },
    signatureImage: {
        width: '100%',
        height: '100%',
    },
    mainBtn: {
        flexDirection: 'row',
        backgroundColor: '#111827',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    btnIcon: {
        marginRight: 10,
    },
    mainBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    signatureContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalActions: {
        flexDirection: 'row',
        padding: 24,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    modalBtn: {
        flex: 1,
        backgroundColor: '#111',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
