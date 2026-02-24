'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const BottomSheet = ({
    children,
    open,
    onOpenChange,
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    dismissible = true,
}: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    snapPoints?: (string | number)[];
    activeSnapPoint?: string | number | null;
    setActiveSnapPoint?: (snapPoint: string | number | null) => void;
    dismissible?: boolean;
}) => {
    return (
        <Drawer.Root
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={snapPoints}
            activeSnapPoint={activeSnapPoint}
            setActiveSnapPoint={setActiveSnapPoint}
            dismissible={dismissible}
            shouldScaleBackground
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
                <Drawer.Content
                    className="bg-[#FDFDFD] flex flex-col rounded-t-[32px] mt-24 h-auto fixed bottom-0 left-0 right-0 z-[101] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] max-w-md mx-auto outline-none"
                >
                    <div className="p-4 bg-white rounded-t-[32px] flex-1 border-t border-gray-100 pb-safe">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export { BottomSheet };
