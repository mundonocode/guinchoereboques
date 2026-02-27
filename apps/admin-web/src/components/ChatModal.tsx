'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    id: string;
    corrida_id: string;
    remetente_id: string;
    conteudo: string;
    created_at: string;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    corridaId: string;
    isActive: boolean;
    otherPartyName?: string;
}

export function ChatModal({ isOpen, onClose, corridaId, isActive, otherPartyName }: ChatModalProps) {
    const supabase = createClient();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentUserId = user?.id;

    useEffect(() => {
        if (!isOpen || !corridaId) return;

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
                        if (current.find(m => m.id === newMessage.id)) return current;
                        return [...current, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, corridaId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mensagens_chat')
                .select('*')
                .eq('corrida_id', corridaId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setMessages(data);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !currentUserId || !isActive) return;

        const textToSend = inputText.trim();
        setInputText('');

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
            setInputText(textToSend); // Restore if failed
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100dvh' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100dvh' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md h-full md:h-[80vh] bg-[#F9FAFB] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-tight">Mensagens</h3>
                                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                                    {otherPartyName || 'Suporte / Motorista'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth"
                        >
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Send size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400">
                                        Envie uma mensagem para iniciar o chat com o {otherPartyName || 'motorista'}.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.remetente_id === currentUserId;
                                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`
                                                max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                                                ${isMine
                                                    ? 'bg-gray-900 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                                            `}>
                                                {msg.conteudo}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-tighter">
                                                {time}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Footer */}
                        <div className="px-5 py-4 bg-white border-t border-gray-100 shrink-0">
                            {isActive ? (
                                <form
                                    onSubmit={handleSend}
                                    className="flex items-end gap-3"
                                >
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-[24px] px-4 py-1 flex items-center min-h-[52px]">
                                        <textarea
                                            rows={1}
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder="Digite uma mensagem..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-gray-900 placeholder-gray-400 resize-none py-2 max-h-32"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className={`
                                            w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all
                                            ${inputText.trim()
                                                ? 'bg-gray-900 text-white shadow-lg active:scale-95'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <Send size={20} className={inputText.trim() ? "translate-x-0.5" : ""} />
                                    </button>
                                </form>
                            ) : (
                                <div className="h-[52px] bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chat Encerrado</p>
                                </div>
                            )}
                            {/* Spacer for iPhone home indicator on PWA/Safari */}
                            <div className="h-[env(safe-area-inset-bottom,0px)]" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
