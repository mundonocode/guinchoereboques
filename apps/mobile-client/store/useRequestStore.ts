import { create } from 'zustand';

export interface TowRequestDetails {
    placa: string;
    cor: string;
    marcaModelo: string;
    problemaDescricao: string;
    problemaTipo: string;
    localRemocao: string;

    // Localização
    origem: any;
    destino: any;
    enderecoOrigem: string;
    enderecoDestino: string;
    distanciaEstimadaKm: number;
    precoEstimado: number;
}

interface RequestStore {
    requestDetails: Partial<TowRequestDetails>;
    currentRideId: string | null;
    setRequestDetails: (details: Partial<TowRequestDetails>) => void;
    setCurrentRideId: (id: string | null) => void;
    resetRequestDetails: () => void;
}

export const useRequestStore = create<RequestStore>((set) => ({
    requestDetails: {},
    currentRideId: null,
    setRequestDetails: (details) =>
        set((state) => ({ requestDetails: { ...state.requestDetails, ...details } })),
    setCurrentRideId: (id) => set({ currentRideId: id }),
    resetRequestDetails: () => set({ requestDetails: {}, currentRideId: null }),
}));
