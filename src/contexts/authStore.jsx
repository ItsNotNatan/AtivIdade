// src/contexts/authStore.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState({ nome: 'Natan Silva', tipo: 'idoso', id: 1 });
    
    // Lista global de alertas da instituição
    const [alertas, setAlertas] = useState([
        { 
            id: 1, 
            alunoNome: 'Dona Maria Oliveira', 
            tipo: 'dificuldade', 
            mensagem: 'Relatou dor / esforço excessivo no treino.', 
            hora: '10:15',
            contatoTel: '11977777777'
        }
    ]);

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
        return false;
    };

    const logout = () => {
        setUsuario(null);
    };

    const adicionarAlerta = (tipo, mensagem) => {
        const novo = {
            id: Date.now(),
            alunoNome: usuario?.nome || 'Natan Silva',
            tipo, // 'sos' ou 'dificuldade'
            mensagem,
            hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            contatoTel: '11988888888'
        };
        setAlertas(prev => [novo, ...prev]);
    };

    const resolverAlerta = (id) => {
        setAlertas(prev => prev.filter(alerta => alerta.id !== id));
    };

    return React.createElement(
        AuthContext.Provider,
        { value: { usuario, login, logout, alertas, adicionarAlerta, resolverAlerta } },
        children
    );
}

export const useAuthStore = () => useContext(AuthContext);