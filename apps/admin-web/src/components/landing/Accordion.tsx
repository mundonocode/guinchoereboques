'use client';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Accordion({ title, content }: { title: string; content: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b-2 border-zinc-100 py-6 last:border-0 group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex w-full items-center justify-between text-left focus:outline-none">
                <h3 className={twMerge(
                    clsx(
                        "text-lg md:text-xl font-bold pr-8 leading-tight transition-colors",
                        isOpen ? "text-amber-600" : "text-black group-hover:text-amber-500"
                    )
                )}>
                    {title}
                </h3>
                <span className={clsx(
                    "shrink-0 transition-all duration-300 p-2 rounded-xl border-2",
                    isOpen ? "bg-amber-50 border-amber-200 text-amber-600 rotate-90" : "bg-white border-zinc-200 text-zinc-400 group-hover:border-amber-500 group-hover:text-amber-500"
                )}>
                    {isOpen ? <X size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                </span>
            </div>
            <div className={twMerge(
                clsx(
                    "overflow-hidden transition-all duration-300 ease-in-out font-medium text-zinc-600",
                    isOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0"
                )
            )}>
                <p className="leading-relaxed text-base">{content}</p>
            </div>
        </div>
    );
}
