import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CheckCircle2, XCircle, Info, ShieldCheck } from 'lucide-react-native';

interface CancellationModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'refunded' | 'cancelled_only';
}

export default function CancellationModal({ visible, onClose, type }: CancellationModalProps) {
    const isRefunded = type === 'refunded';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Status Icon */}
                    <View style={[styles.iconContainer, isRefunded ? styles.refundIconBg : styles.cancelIconBg]}>
                        {isRefunded ? (
                            <ShieldCheck size={48} color="#059669" />
                        ) : (
                            <CheckCircle2 size={48} color="#4B5563" />
                        )}
                    </View>

                    {/* Content */}
                    <Text style={styles.title}>
                        {isRefunded ? 'Solicitação de Estorno' : 'Chamado Cancelado'}
                    </Text>

                    <View style={styles.messageBox}>
                        <Text style={styles.message}>
                            {isRefunded
                                ? 'Seu pedido foi cancelado e o estorno do Pix foi solicitado com sucesso. O valor será devolvido para sua conta em instantes.'
                                : 'Seu chamado foi cancelado com sucesso. Como o pagamento ainda não havia sido processado, nenhuma cobrança será realizada.'
                            }
                        </Text>
                    </View>

                    {/* Info Tip */}
                    <View style={styles.tipBox}>
                        <Info size={16} color="#6B7280" />
                        <Text style={styles.tipText}>
                            {isRefunded
                                ? 'O prazo depende da compensação do seu banco.'
                                : 'Você pode solicitar um novo guincho a qualquer momento.'
                            }
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Entendi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    refundIconBg: {
        backgroundColor: '#ECFDF5', // Emerald 50
    },
    cancelIconBg: {
        backgroundColor: '#F9FAFB', // Gray 50
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    messageBox: {
        marginBottom: 24,
    },
    message: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    tipText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 8,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#111827',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
