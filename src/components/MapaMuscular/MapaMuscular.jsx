// src/components/Profissional/MapaMuscular.jsx
import React from 'react';
import Model from 'react-body-highlighter';

export const traduzirMusculo = (musculoIngles) => {
    if (!musculoIngles) return '';
    const dicionario = {
        'trapezius': 'Trapézio', 'upper-back': 'Costas Superiores', 'lower-back': 'Lombar',
        'chest': 'Peito', 'biceps': 'Bíceps', 'triceps': 'Tríceps', 'forearm': 'Antebraço',
        'back-deltoids': 'Ombros (Trás)', 'front-deltoids': 'Ombros (Frente)', 'abs': 'Abdómen',
        'obliques': 'Oblíquos', 'adductor': 'Adutores', 'hamstring': 'Posterior da Coxa',
        'quadriceps': 'Quadríceps', 'abductors': 'Abdutores', 'calves': 'Gémeos / Panturrilhas',
        'gluteal': 'Glúteos', 'head': 'Cabeça', 'neck': 'Pescoço'
    };
    return dicionario[musculoIngles] || musculoIngles;
};

export default function MapaMuscular({ musculoAtivo, onSelecionarMusculo }) {
    const dados = [
        {
            name: 'Foco Principal',
            muscles: musculoAtivo ? [musculoAtivo] : []
        }
    ];

    const handleClick = (exercicio) => {
        if (onSelecionarMusculo) {
            onSelecionarMusculo(exercicio.muscle);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                <div style={{ width: '130px', cursor: 'pointer' }}>
                    <p style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>Frente</p>
                    <Model
                        type="anterior"
                        data={dados}
                        style={{ width: '100%' }}
                        onClick={handleClick}
                        highlightedColors={['#059669']}
                    />
                </div>
                <div style={{ width: '130px', cursor: 'pointer' }}>
                    <p style={{ textAlign: 'center', margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>Costas</p>
                    <Model
                        type="posterior"
                        data={dados}
                        style={{ width: '100%' }}
                        onClick={handleClick}
                        highlightedColors={['#059669']}
                    />
                </div>
            </div>
            {musculoAtivo && (
                <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Foco: {traduzirMusculo(musculoAtivo)}
                </div>
            )}
        </div>
    );
}