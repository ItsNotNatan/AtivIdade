// src/components/MapaMuscular/MapaMuscular.jsx
import React from 'react';
import Model from 'react-body-highlighter';

export const traduzirMusculo = (musculoIngles) => {
    if (!musculoIngles) return '';
    const dicionario = {
        'trapezius': 'Trapézio', 'upper-back': 'Costas Superiores', 'lower-back': 'Lombar',
        'chest': 'Peito', 'biceps': 'Bíceps', 'triceps': 'Tríceps', 'forearm': 'Antebraço',
        'back-deltoids': 'Ombros (Trás)', 'front-deltoids': 'Ombros (Frente)', 'abs': 'Abdômen',
        'obliques': 'Oblíquos', 'adductor': 'Adutores', 'hamstring': 'Posterior da Coxa',
        'quadriceps': 'Quadríceps', 'abductors': 'Abdutores', 'calves': 'Panturrilhas / Gêmeos',
        'gluteal': 'Glúteos', 'head': 'Cabeça', 'neck': 'Pescoço'
    };

    if (typeof musculoIngles === 'string' && musculoIngles.includes(',')) {
        return musculoIngles
            .split(',')
            .map(m => dicionario[m.trim()] || m.trim())
            .join(', ');
    }

    return dicionario[musculoIngles] || musculoIngles;
};

export default function MapaMuscular({ musculoAtivo, onSelecionarMusculo }) {
    const listaMusculos = Array.isArray(musculoAtivo)
        ? musculoAtivo
        : (musculoAtivo ? String(musculoAtivo).split(',').map(m => m.trim()).filter(Boolean) : []);

    const atalhosMusculares = [
        { id: 'quadriceps', nome: 'Quadríceps (Coxa)' },
        { id: 'hamstring', nome: 'Posterior da Coxa' },
        { id: 'calves', nome: 'Panturrilha (Gêmeos)' },
        { id: 'gluteal', nome: 'Glúteos' },
        { id: 'abs', nome: 'Abdômen' },
        { id: 'lower-back', nome: 'Lombar' },
        { id: 'biceps', nome: 'Bíceps' },
        { id: 'triceps', nome: 'Tríceps' },
        { id: 'chest', nome: 'Peito' },
        { id: 'front-deltoids', nome: 'Ombros' }
    ];

    // FILTRO DE SEGURANÇA: Só passa para a biblioteca termos que ela conhece
    const musculosValidosDaBiblioteca = [
        'trapezius', 'upper-back', 'lower-back', 'chest', 'biceps', 'triceps', 'forearm',
        'back-deltoids', 'front-deltoids', 'abs', 'obliques', 'adductor', 'hamstring',
        'quadriceps', 'abductors', 'calves', 'gluteal', 'head', 'neck'
    ];
    const musculosParaDesenharNoBoneco = listaMusculos.filter(m => musculosValidosDaBiblioteca.includes(m));

    const dados = [
        {
            name: 'Músculos Selecionados',
            muscles: musculosParaDesenharNoBoneco,
            exercises: [] // Evita erro interno da biblioteca
        }
    ];

    const alternarMusculo = (musculo) => {
        if (!musculo || typeof musculo !== 'string' || !onSelecionarMusculo) return;

        let novaLista;
        if (listaMusculos.includes(musculo)) {
            novaLista = listaMusculos.filter(m => m !== musculo);
        } else {
            novaLista = [...listaMusculos, musculo];
        }

        onSelecionarMusculo(Array.isArray(musculoAtivo) ? novaLista : novaLista.join(','));
    };

    const handleClick = (evento) => {
        const musculo = evento?.muscle || evento;
        alternarMusculo(musculo);
    };

    const limparTodos = () => {
        if (onSelecionarMusculo) {
            onSelecionarMusculo(Array.isArray(musculoAtivo) ? [] : '');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '14px', padding: '1.5rem', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' }}>
            
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                Clique diretamente nas áreas anatômicas ou utilize os atalhos abaixo (seleção múltipla ativa):
            </p>

            {/* Modelos Anatômicos Amplos e Afastados Horizontalmente */}
            <div style={{ display: 'flex', gap: '3.5rem', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '720px', marginBottom: '1.5rem' }}>
                
                {/* Frente */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Frente
                    </span>
                    <div style={{ width: '100%', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}>
                        <Model
                            type="anterior"
                            data={dados}
                            style={{ width: '100%', height: 'auto' }}
                            onClick={handleClick}
                            highlightedColors={['#059669']}
                        />
                    </div>
                </div>

                {/* Linha Divisória Vertical Sutil */}
                <div style={{ width: '1px', height: '240px', backgroundColor: '#e2e8f0' }} />

                {/* Costas */}
                <div style={{ width: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Costas
                    </span>
                    <div style={{ width: '100%', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}>
                        <Model
                            type="posterior"
                            data={dados}
                            style={{ width: '100%', height: 'auto' }}
                            onClick={handleClick}
                            highlightedColors={['#059669']}
                        />
                    </div>
                </div>
            </div>

            {/* Lista dos Músculos Selecionados */}
            {listaMusculos.length > 0 ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#166534' }}>
                            Músculos Focados ({listaMusculos.length}):
                        </span>
                        <button
                            type="button"
                            onClick={limparTodos}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'underline' }}
                        >
                            Limpar seleção
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        {listaMusculos.map((m) => (
                            <span
                                key={m}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #bbf7d0',
                                    padding: '0.35rem 0.85rem',
                                    borderRadius: '1rem',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                }}
                            >
                                🎯 {traduzirMusculo(m)}
                                <button
                                    type="button"
                                    onClick={() => alternarMusculo(m)}
                                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '0.2rem', lineHeight: 1 }}
                                    title="Remover"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Nenhum músculo selecionado ainda.
                </p>
            )}

            {/* Atalhos Rápidos com boa distribuição horizontal */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', width: '100%', maxWidth: '750px' }}>
                {atalhosMusculares.map(m => {
                    const ativo = listaMusculos.includes(m.id);
                    return (
                        <button
                            type="button"
                            key={m.id}
                            onClick={() => alternarMusculo(m.id)}
                            style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                border: `1px solid ${ativo ? '#059669' : '#cbd5e1'}`,
                                backgroundColor: ativo ? '#059669' : '#ffffff',
                                color: ativo ? '#ffffff' : '#334155',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {ativo ? `✓ ${m.nome}` : `+ ${m.nome}`}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}