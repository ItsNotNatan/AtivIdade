// src/components/AlertaTelaPequena/AlertaTelaPequena.jsx
import React, { useState } from 'react';
import { Maximize2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTamanhoJanela } from '../../hooks/useTamanhoJanela';

export default function AlertaTelaPequena() {
    const { largura } = useTamanhoJanela();
    const [ignorado, setIgnorado] = useState(false);

    // Ativado apenas em casos extremos (largura inferior a 380px)
    const telaExtremamentePequena = largura < 380;

    if (!telaExtremamentePequena || ignorado) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.25rem',
            textAlign: 'center',
            color: 'white',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#1e293b',
                border: '2px solid #ef4444',
                padding: '1.75rem 1.25rem',
                maxWidth: '320px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{
                    backgroundColor: '#fee2e2',
                    padding: '0.75rem',
                    borderRadius: '50%',
                    color: '#dc2626',
                    display: 'flex'
                }}>
                    <Maximize2 size={32} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Janela Muito Estreita
                    </span>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}>
                    Amplie o Navegador
                </h3>

                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.45' }}>
                    O sistema precisa de mais espaço horizontal para exibir as tabelas, pacientes e botões sem sobreposição.
                </p>

                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Largura atual: <strong>{largura}px</strong> (Mínimo recomendado: <strong>380px</strong>)
                </p>

                <button
                    onClick={() => setIgnorado(true)}
                    style={{
                        marginTop: '0.5rem',
                        backgroundColor: '#334155',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    Continuar mesmo assim <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}