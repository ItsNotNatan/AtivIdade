// src/contexts/authStore.jsx
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            const usuarioSalvo = localStorage.getItem('usuario');
            return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
        } catch {
            return null;
        }
    });
    const [alertas, setAlertas] = useState([]);

    const login = async (celular, pin) => {
        try {
            // Consulta direta ao Supabase
            const { data, error } = await supabase
                .from('User')
                .select('*')
                .eq('celular', celular)
                .eq('pin', pin)
                .single();

            if (error || !data) {
                console.error("Erro no login:", error);
                return false; 
            }

            // Login com sucesso
            localStorage.setItem('usuario', JSON.stringify(data));
            setUsuario(data);
            return true; 
            
        } catch (erro) {
            console.error("Erro inesperado:", erro);
            return false;
        }
    };

    const logout = () => {
        setUsuario(null);
        localStorage.removeItem('usuario');
    };

    const atualizarUsuario = (novosDados) => {
        setUsuario(prev => {
            const atualizado = { ...prev, ...novosDados };
            localStorage.setItem('usuario', JSON.stringify(atualizado));
            return atualizado;
        });
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, atualizarUsuario, alertas }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthStore = () => useContext(AuthContext);