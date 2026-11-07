// src/components/Profissional/FichaIndividualAluno.jsx
import React, { useState, useEffect } from 'react';
import { HeartHandshake, PlusCircle, Trash2, Edit2, Activity, ClipboardList, Library, FolderPlus } from 'lucide-react';
import { useAlert } from '../AlertContext/AlertContext';

export default function FichaIndividualAluno({ aluno, onAbrirPrescricaoIndividual, onAbrirAcervoParaAluno, onEditarPrescricao }) {
    const { showConfirm, showAlert } = useAlert();
    const [prescricoes, setPrescricoes] = useState([]);
    const [historico, setHistorico] = useState([]);
    
    const [gruposVazios, setGruposVazios] = useState([]);
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    useEffect(() => {
        if (aluno?.id) carregarDadosAluno();
    }, [aluno]);

    const carregarDadosAluno = async () => {
        try {
            const [resP, resH] = await Promise.all([ fetch(`http://localhost:3001/api/prescricoes/${aluno.id}`), fetch(`http://localhost:3001/api/atividades/${aluno.id}`) ]);
            if (resP.ok) {
                setPrescricoes(await resP.json());
                setGruposVazios([]); // Limpa ao atualizar
            }
            if (resH.ok) setHistorico(await resH.json());
        } catch (err) { console.error(err); }
    };

    const deletarPrescricao = async (id) => {
        if (!await showConfirm('Excluir exercício da agenda do aluno?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/prescricoes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPrescricoes(prev => prev.filter(p => p.id !== id));
                showAlert('Exercício excluído!', 'sucesso');
            }
        } catch (err) { showAlert('Erro ao excluir exercício.', 'erro'); }
    };

    const handleCriarGrupoVazio = (e) => {
        e.preventDefault();
        const nomeFinal = novoGrupoNome.trim();
        if(nomeFinal) {
            setGruposVazios(prev => [...prev, { nome: nomeFinal, cor: '#2563eb' }]);
        }
        setAddGrupoAberto(false);
        setNovoGrupoNome('');
    };

    const condicoesLista = aluno.condicoes ? aluno.condicoes.split(',').map(c => c.trim()).filter(Boolean) : [];

    // Agrupamento Visual dos Exercícios
    const gruposPrescritos = prescricoes.reduce((acc, p) => {
        const nomeGrupo = p.grupo || 'Geral';
        if(!acc[nomeGrupo]) acc[nomeGrupo] = { cor: p.cor || '#059669', dias: p.diasDaSemana || 'Livre', itens: [] };
        acc[nomeGrupo].itens.push(p);
        return acc;
    }, {});

    gruposVazios.forEach(gv => {
        if(!gruposPrescritos[gv.nome]) gruposPrescritos[gv.nome] = { cor: gv.cor, dias: 'Livre', itens: [] };
    });

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.4rem' }}>Ficha de: {aluno.nome}</h2>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Idade: {aluno.idade || '?'} anos | Telemóvel: {aluno.telemovel}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setAddGrupoAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}><FolderPlus size={18} /> Criar Grupo</button>
                    <button onClick={onAbrirAcervoParaAluno} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'white', color: '#059669', border: '2px solid #059669', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}><Library size={18} /> Puxar do Acervo</button>
                </div>
            </div>

            {addGrupoAberto && (
                <form onSubmit={handleCriarGrupoVazio} className="fade-in" style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '2px dashed #059669', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.35rem' }}>Nome do Grupo para este aluno</label>
                        <input type="text" value={novoGrupoNome} onChange={e => setNovoGrupoNome(e.target.value)} autoFocus required placeholder="Ex: Treino de Fisioterapia B..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Adicionar Pasta</button>
                    <button type="button" onClick={() => setAddGrupoAberto(false)} style={{ backgroundColor: 'white', color: '#4b5563', border: '1px solid #cbd5e1', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                </form>
            )}

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}><HeartHandshake size={18} /> Condições de Saúde & Articulações</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {condicoesLista.length > 0 ? condicoesLista.map((c, i) => <span key={i} style={{ backgroundColor: 'white', border: '1px solid #f87171', color: '#b91c1c', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>{c}</span>) : <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhuma limitação declarada.</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', color: '#1e293b' }}><ClipboardList size={20} color="#2563eb" /> Exercícios Agendados ({prescricoes.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.keys(gruposPrescritos).length > 0 ? Object.entries(gruposPrescritos).map(([nomeGrupo, dados]) => (
                            <div key={nomeGrupo} style={{ border: `1px solid ${dados.cor}40`, borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: `${dados.cor}15`, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${dados.cor}40` }}>
                                    <div>
                                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>{nomeGrupo}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dias: {dados.dias}</span>
                                    </div>
                                    <button onClick={() => onAbrirPrescricaoIndividual(nomeGrupo)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', color: dados.cor, border: `1px solid ${dados.cor}`, padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                        <PlusCircle size={14} /> Exercício
                                    </button>
                                </div>
                                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {dados.itens.length === 0 && <p style={{ margin: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>Pasta vazia.</p>}
                                    {dados.itens.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'white', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{p.titulo}</span>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button onClick={() => onEditarPrescricao(p)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={14} /></button>
                                                <button onClick={() => deletarPrescricao(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Sem exercícios pendentes.</p>}
                    </div>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', color: '#1e293b' }}><Activity size={20} color="#059669" /> Histórico Recente</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {historico.length > 0 ? historico.slice(0, 5).map(h => (
                            <div key={h.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{h.titulo}</div><small style={{ color: '#64748b' }}>{new Date(h.dataCriacao).toLocaleDateString('pt-PT')}</small></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: h.feedback === 'facil' ? '#dcfce7' : '#fee2e2', color: h.feedback === 'facil' ? '#166534' : '#991b1b' }}>{h.feedback?.toUpperCase()}</span>
                            </div>
                        )) : <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>Nenhum treino concluído ainda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}