'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdaptivePanelProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    snapPoints?: (string | number)[];
    activeSnapPoint?: string | number | null;
    setActiveSnapPoint?: (snapPoint: string | number | null) => void;
    dismissible?: boolean;
}

/**
 * AdaptivePanel
 * 
 * Mobile (< 768px): Uses Vaul BottomSheet
 * Desktop (>= 768px): Uses Framer Motion Side Panel
 */
export function AdaptivePanel({
    children,
    isOpen,
    onClose,
    title,
    snapPoints = [0.5, 0.95],
    activeSnapPoint,
    setActiveSnapPoint,
    dismissible = true
}: AdaptivePanelProps) {

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* --- DESKTOP VIEW (Floating Side Panel) --- */}
            <div className="hidden md:block">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ x: -400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -400, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute top-6 bottom-6 left-6 w-[380px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden flex flex-col"
                        >
                            <div className="flex-1 overflow-hidden w-full flex flex-col relative">
                                {title && (
                                    <div className="px-6 py-5 border-b border-gray-100 bg-white/90 backdrop-blur-sm z-10 shrink-0">
                                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden flex flex-col w-full">
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- MOBILE VIEW (Bottom Sheet) --- */}
            <div className="md:hidden">
                <Drawer.Root
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    snapPoints={snapPoints}
                    activeSnapPoint={activeSnapPoint}
                    setActiveSnapPoint={setActiveSnapPoint}
                    dismissible={dismissible}
                    shouldScaleBackground
                >
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden" />
                        <Drawer.Content
                            className="bg-[#FDFDFD] flex flex-col fixed bottom-0 left-0 right-0 z-[101] shadow-none outline-none md:hidden h-[100dvh] w-full"
                        >
                            <div className="p-0 bg-white flex flex-col flex-1 w-full overflow-hidden h-[100dvh] relative">
                                {/* Header with Close Button */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0 z-20">
                                    <div className="w-10" /> {/* Spacer for centering */}
                                    {title ? (
                                        <Drawer.Title className="text-lg font-bold text-gray-900 text-center flex-1">{title}</Drawer.Title>
                                    ) : (
                                        <Drawer.Title className="sr-only">Painel de Interface</Drawer.Title>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <Drawer.Description className="sr-only">
                                    Conteúdo interativo do painel
                                </Drawer.Description>

                                <div className="flex-1 overflow-hidden flex flex-col w-full h-full bg-white relative">
                                    {children}
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            </div>
        </>
    );
}
