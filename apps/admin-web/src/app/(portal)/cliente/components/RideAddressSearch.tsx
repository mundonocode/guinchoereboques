'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface RideAddressSearchProps {
    originAddressName: string;
    setOriginAddressName?: (name: string) => void;
    placeAutocompleteRef: React.RefObject<HTMLInputElement | null>;
}

export function RideAddressSearch({ originAddressName, setOriginAddressName, placeAutocompleteRef }: RideAddressSearchProps) {
    return (
        <div className="absolute top-6 left-4 right-4 md:left-6 md:right-auto md:w-[380px] z-[40]">
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 backdrop-blur-md bg-white/90">

                {/* ORIGIN */}
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0" />
                    <div className="ml-4 flex-1 overflow-hidden">
                        <p className="text-[10px] text-gray-400 font-bold tracking-wider">LOCAL ATUAL (GPS)</p>
                        <input
                            type="text"
                            value={originAddressName}
                            onChange={(e) => setOriginAddressName && setOriginAddressName(e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 truncate outline-none bg-transparent placeholder-gray-400"
                            placeholder="Sua localização atual..."
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 ml-6 my-3 md:my-4" />

                {/* DESTINATION */}
                <div className="flex items-center w-full group">
                    <div className="w-2.5 h-2.5 flex items-center justify-center shrink-0">
                        <div className="w-2.5 h-2.5 bg-black rotate-45 transform" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-0.5">DESTINO DO VEÍCULO</p>
                        <div className="flex items-center border-b border-gray-100 pb-1 mr-2 group-focus-within:border-black transition-colors">
                            <input
                                ref={placeAutocompleteRef}
                                type="text"
                                className="w-full text-[15px] font-bold text-gray-900 placeholder-gray-300 outline-none bg-transparent truncate"
                                placeholder="Para onde quer ir?"
                            />
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-focus-within:bg-black group-focus-within:text-white transition-colors text-gray-400">
                        <Search size={16} className="currentColor" />
                    </div>
                </div>
            </div>
        </div>
    );
}
