// src/contexts/authStore.jsx
import React, { createContext, useContext, useState } from 'react';

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
            // Mostra o que estamos a mandar antes de enviar
            alert(`Enviando para o Backend:\nCelular: "${celular}"\nPIN: "${pin}"`);

            const resposta = await fetch('https://atividade-backend-h5p3.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ celular, pin })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('token', dados.token);
                localStorage.setItem('usuario', JSON.stringify(dados.usuario));
                setUsuario(dados.usuario);
                return true; 
            } else {
                // MOSTRA NA TELA O MOTIVO REAL DA RECUSA
                alert(`O Backend recusou com status ${resposta.status}:\n${JSON.stringify(dados)}`);
                return false; 
            }
        } catch (erro) {
            alert(`Erro ao tentar falar com o Backend:\n${erro.message}`);
            return false;
        }
    };

    const logout = () => {
        setUsuario(null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    };

    const atualizarUsuario = (novosDados) => {
        setUsuario(prev => {
            const atualizado = { ...prev, ...novosDados };
            localStorage.setItem('usuario', JSON.stringify(atualizado));
            return atualizado;
        });
    };

    const adicionarAlerta = (tipo, mensagem) => {
        const novo = {
            id: Date.now(),
            alunoNome: usuario?.nome || 'Utilizador',
            tipo,
            mensagem,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            contatoTel: '11988888888'
        };
        setAlertas(prev => [novo, ...prev]);
    };

    const resolverAlerta = (id) => {
        setAlertas(prev => prev.filter(alerta => alerta.id !== id));
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, atualizarUsuario, alertas, adicionarAlerta, resolverAlerta }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthStore = () => useContext(AuthContext);