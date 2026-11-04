// src/contexts/authStore.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    // Função que simula a validação na base de dados
    const login = (telemovel, pin) => {
        if (pin === '1111') {
            setUsuario({ nome: 'Natan Silva', tipo: 'idoso', id: 1 });
            return true;
        } 
        if (pin === '2222') {
            setUsuario({ nome: 'Dra. Camila', tipo: 'profissional', especialidade: 'Fisioterapia' });
            return true;
        } 
        if (pin === '3333') {
            setUsuario({ nome: 'Diretor Carlos', tipo: 'gestor', instituicao: 'Centro Sénior Viver Bem' });
            return true;
        }
        return false; // Falha no login se o PIN for incorreto
    };

    const logout = () => {
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar facilmente em qualquer ecrã
export const useAuthStore = () => useContext(AuthContext);