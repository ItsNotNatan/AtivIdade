// FILE: src/contexts/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    // Mock do utilizador para testes
    usuario: {
        id: '123',
        nome: 'Programador SCL',
        area_id: 1, // Area 1 para poder editar a Fase 1
        cargo: 'SCL'
    },
    setUsuario: (usuario) => set({ usuario }),
}));