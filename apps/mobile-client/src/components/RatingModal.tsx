import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image as RNImage, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Star, User, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface RatingModalProps {
    visible: boolean;
    corridaId: string;
    motoristaId: string;
    motoristaNome: string;
    motoristaAvatar: string;
    onSubmit: (nota: number, comentario: string) => Promise<void>;
    onSkip: () => void;
}

export default function RatingModal({
    visible,
    motoristaNome,
    motoristaAvatar,
    onSubmit,
    onSkip
}: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comentario, setComentario] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!visible) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            await onSubmit(rating, comentario);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <KeyboardAvoidingView
                style={[styles.container, { justifyContent: 'flex-end' }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onSkip} disabled={isSubmitting}>
                        <X size={24} color="#6B7280" />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Avalie sua experiência</Text>
                            <Text style={styles.subtitle}>Sua avaliação ajuda a manter a qualidade dos nossos guincheiros.</Text>
                        </View>

                        <View style={styles.driverInfo}>
                            {motoristaAvatar ? (
                                <RNImage source={{ uri: motoristaAvatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <User size={32} color="#4B5563" />
                                </View>
                            )}
                            <Text style={styles.driverName}>Como foi a viagem com {motoristaNome.split(' ')[0]}?</Text>
                        </View>

                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.7}
                                    disabled={isSubmitting}
                                >
                                    <Star
                                        size={40}
                                        color={star <= rating ? "#FBBF24" : "#E5E7EB"}
                                        fill={star <= rating ? "#FBBF24" : "transparent"}
                                        style={styles.star}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Elogios ou Sugestões (Opcional)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Deixe um comentário sobre o atendimento..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                value={comentario}
                                onChangeText={setComentario}
                                editable={!isSubmitting}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.submitButton, rating === 0 && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={onSkip}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.skipButtonText}>Pular</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 10000,
        elevation: 10000,
    },
    container: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.85,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    driverInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    star: {
        marginHorizontal: 4,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#111827',
        minHeight: 100,
    },
    actionsContainer: {
        width: '100%',
        gap: 12,
    },
    submitButton: {
        backgroundColor: '#111827',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#4B5563',
        fontSize: 15,
        fontWeight: '500',
    }
});
