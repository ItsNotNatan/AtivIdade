// src/contexts/authStore.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [alertas, setAlertas] = useState([]);

    const login = async (telemovel, pin) => {
        try {
            const resposta = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ telemovel, pin })
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                
                // Guarda o token e os dados reais vindos da base de dados (SQLite)
                localStorage.setItem('token', dados.token);
                setUsuario(dados.usuario);
                return true; 
            } else {
                return false; 
            }
        } catch (erro) {
            console.error("Erro ao comunicar com o servidor:", erro);
            return false;
        }
    };

    const logout = () => {
        setUsuario(null);
        localStorage.removeItem('token');
    };

    const adicionarAlerta = (tipo, mensagem) => {
        const novo = {
            id: Date.now(),
            alunoNome: usuario?.nome || 'Utilizador',
            tipo,
            mensagem,
            hora: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
            contatoTel: '11988888888'
        };
        setAlertas(prev => [novo, ...prev]);
    };

    const resolverAlerta = (id) => {
        setAlertas(prev => prev.filter(alerta => alerta.id !== id));
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, alertas, adicionarAlerta, resolverAlerta }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthStore = () => useContext(AuthContext);