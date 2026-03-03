import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { Copy, Check, Info, Clock, X } from 'lucide-react-native';

interface PixModalProps {
    visible: boolean;
    onClose: () => void;
    pixData: {
        encodedImage: string;
        payload: string;
        expirationDate: string;
    } | null;
    onVerify?: () => Promise<void>;
    isVerifying?: boolean;
}

export default function PixModal({ visible, onClose, onVerify, isVerifying, pixData }: PixModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (pixData?.payload) {
            Clipboard.setString(pixData.payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!pixData) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.pixIconContainer}>
                            <Text style={styles.pixIconText}>Pix</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Pagamento via Pix</Text>
                        <Text style={styles.subtitle}>
                            Escaneie o QR Code ou copie o código abaixo para confirmar sua solicitação.
                        </Text>

                        {/* QR Code */}
                        <View style={styles.qrContainer}>
                            <Image
                                source={{ uri: `data:image/png;base64,${pixData.encodedImage}` }}
                                style={styles.qrCode}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Copy Paste */}
                        <Text style={styles.label}>CÓDIGO COPIA E COLA</Text>
                        <TouchableOpacity style={styles.copyContainer} onPress={handleCopy} activeOpacity={0.7}>
                            <Text style={styles.payloadText} numberOfLines={1} ellipsizeMode="middle">
                                {pixData.payload}
                            </Text>
                            {copied ? (
                                <Check size={20} color="#32BCAD" />
                            ) : (
                                <Copy size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <Clock size={18} color="#1D4ED8" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Aguardando pagamento</Text>
                                <Text style={styles.infoSubtitle}>
                                    O motorista será enviado assim que o pagamento for confirmado.
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmButton, isVerifying && { opacity: 0.7 }]}
                            onPress={() => {
                                if (onVerify) {
                                    onVerify();
                                } else {
                                    onClose();
                                }
                            }}
                            disabled={isVerifying}
                        >
                            {isVerifying ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Já paguei o Pix</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    pixIconContainer: {
        width: 48,
        height: 28,
        backgroundColor: '#32BCAD',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pixIconText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    qrContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 24,
    },
    qrCode: {
        width: 200,
        height: 200,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    copyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    payloadText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        marginRight: 12,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: 12,
        color: '#1E40AF',
        opacity: 0.8,
        lineHeight: 16,
    },
    confirmButton: {
        backgroundColor: '#111827',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
