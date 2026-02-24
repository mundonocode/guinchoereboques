import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    corrida_id: string;
    remetente_id: string;
    conteudo: string;
    created_at: string;
}

interface ChatModalProps {
    corridaId: string;
    onClose: () => void;
    isActive: boolean; // if false, implies the ride is finished and chat is readonly
}

export default function ChatModal({ corridaId, onClose, isActive }: ChatModalProps) {
    const { session } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const currentUserId = session?.user?.id;

    useEffect(() => {
        if (!corridaId) return;

        fetchMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`chat_corrida_${corridaId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensagens_chat',
                    filter: `corrida_id=eq.${corridaId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((current) => {
                        // Prevent duplicates if we already added it optimistically
                        if (current.find(m => m.id === newMessage.id)) return current;
                        return [newMessage, ...current];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [corridaId]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mensagens_chat')
                .select('*')
                .eq('corrida_id', corridaId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setMessages(data);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !currentUserId || !isActive) return;

        const textToSend = inputText.trim();
        setInputText(''); // Clear early for better UX

        // Optimistic UI update could go here, but doing simple insert for now
        try {
            const { error } = await supabase
                .from('mensagens_chat')
                .insert({
                    corrida_id: corridaId,
                    remetente_id: currentUserId,
                    conteudo: textToSend,
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            // Revert input block or show toast
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.remetente_id === currentUserId;
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.messageWrapper, isMine ? styles.messageWrapperMine : styles.messageWrapperTheirs]}>
                <View style={[styles.messageBubble, isMine ? styles.messageBubbleMine : styles.messageBubbleTheirs]}>
                    <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextTheirs]}>
                        {item.conteudo}
                    </Text>
                    <Text style={[styles.messageTime, isMine ? styles.messageTimeMine : styles.messageTimeTheirs]}>
                        {time}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mensagens</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#111827" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    inverted={true}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>Envie uma mensagem para iniciar o chat.</Text>
                        </View>
                    }
                />
            )}

            <View style={styles.inputContainer}>
                {isActive ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite uma mensagem..."
                            placeholderTextColor="#9CA3AF"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Send size={20} color={inputText.trim() ? '#FFF' : '#A1A1AA'} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.inactiveStateContainer}>
                        <Text style={styles.inactiveStateText}>Chat encerrado (Corrida finalizada)</Text>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
        width: '100%',
    },
    messageWrapperMine: {
        justifyContent: 'flex-end',
    },
    messageWrapperTheirs: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    messageBubbleMine: {
        backgroundColor: '#111827',
        borderBottomRightRadius: 4,
    },
    messageBubbleTheirs: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageTextMine: {
        color: '#FFFFFF',
    },
    messageTextTheirs: {
        color: '#1F2937',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    messageTimeMine: {
        color: '#9CA3AF',
    },
    messageTimeTheirs: {
        color: '#9CA3AF',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 48,
        maxHeight: 120,
        fontSize: 15,
        color: '#111827',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    inactiveStateContainer: {
        flex: 1,
        height: 48,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveStateText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    }
});
