// src/components/Profissional/AbaAcervo.jsx
import React, { useState } from 'react';
import { FolderKanban, FolderPlus, PlusCircle, Edit2, Trash2 } from 'lucide-react';

export default function AbaAcervo({ acervo, onNovoExercicio, onEditarExercicio, onDeletarItem }) {
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    const gruposAcervo = acervo.reduce((acc, item) => {
        const nome = item.grupo || 'Modelo';
        if (!acc[nome]) acc[nome] = { cor: item.cor || '#059669', itens: [] };
        acc[nome].itens.push(item);
        return acc;
    }, {});

    const handleSubmitNovoGrupo = (e) => {
        e.preventDefault();
        const nomeFinal = novoGrupoNome.trim();
        if (nomeFinal) {
            onNovoExercicio(nomeFinal);
            setNovoGrupoNome('');
            setAddGrupoAberto(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Banco de Modelos Terapêuticos</h2>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Crie rotinas e exercícios-base reutilizáveis para prescrever com um clique.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => setAddGrupoAberto(true)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.65rem 1.25rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <FolderPlus size={18} /> Nova Pasta / Grupo
                    </button>
                    <button 
                        onClick={() => onNovoExercicio('Modelos Gerais')} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.65rem 1.25rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <PlusCircle size={18} /> Novo Exercício
                    </button>
                </div>
            </div>

            {addGrupoAberto && (
                <form 
                    onSubmit={handleSubmitNovoGrupo} 
                    style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', border: '1px solid #bbf7d0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}
                >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.35rem' }}>Nome da Nova Pasta (Ex: Reabilitação Escapular)</label>
                        <input type="text" value={novoGrupoNome} onChange={e => setNovoGrupoNome(e.target.value)} required autoFocus placeholder="Escreva o título..." style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.65rem 1.25rem', fontWeight: 'bold', cursor: 'pointer' }}>Criar Pasta & Adicionar Exercício</button>
                    <button type="button" onClick={() => setAddGrupoAberto(false)} style={{ backgroundColor: 'white', color: '#4b5563', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                </form>
            )}

            {Object.keys(gruposAcervo).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', border: '1px dashed #cbd5e1' }}>
                    <FolderKanban size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>O seu acervo está vazio</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Cadastre exercícios-modelo para agilizar as prescrições de rotina dos seus utentes.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {Object.entries(gruposAcervo).map(([nomeGrupo, dados]) => (
                        <div key={nomeGrupo} style={{ backgroundColor: 'white', border: `2px solid ${dados.cor}`, overflow: 'hidden' }}>
                            <div style={{ backgroundColor: dados.cor, color: 'white', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '1.1rem' }}>📁 {nomeGrupo} ({dados.itens.length} exercícios)</strong>
                                <button 
                                    onClick={() => onNovoExercicio(nomeGrupo, dados.cor)} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', color: dados.cor, border: 'none', padding: '0.35rem 0.85rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    <PlusCircle size={16} /> Adicionar Exercício nesta Pasta
                                </button>
                            </div>

                            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {dados.itens.map(treino => (
                                    <div key={treino.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', minHeight: '110px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{treino.titulo}</strong>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button onClick={() => onEditarExercicio(treino, nomeGrupo)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.2rem' }} title="Editar"><Edit2 size={16} /></button>
                                                    <button onClick={() => onDeletarItem(treino.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }} title="Remover"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                Tipo: {treino.tipo} {treino.focoMuscular ? `• ${treino.focoMuscular}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}