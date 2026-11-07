// src/components/Profissional/ModalAcervo.jsx
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2, Library, Edit2, Send, FolderPlus } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../AlertContext/AlertContext';
import FormPrescricaoModal from './FormPrescricaoModal';

export default function ModalAcervo({ alvoPrescricao, onClose }) {
    const { usuario } = useAuthStore();
    const { showAlert, showConfirm } = useAlert();
    const [acervo, setAcervo] = useState([]);
    
    // GESTÃO DE GRUPOS
    const [gruposVazios, setGruposVazios] = useState([]);
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    const [modalAdd, setModalAdd] = useState(false); 
    const [grupoParaLote, setGrupoParaLote] = useState(null); 
    const [diasLote, setDiasLote] = useState(['Seg', 'Qua']);

    useEffect(() => { carregarAcervo(); }, []);

    const carregarAcervo = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/acervo/${usuario.id}`);
            if (res.ok) {
                setAcervo(await res.json());
                setGruposVazios([]); // Limpa grupos vazios temporários após recarregar
            }
        } catch (error) { console.error(error); }
    };

    const deletarModelo = async (id) => {
        if (!await showConfirm("Remover este exercício do seu acervo?")) return;
        try {
            const res = await fetch(`http://localhost:3001/api/acervo/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Removido do acervo.', 'sucesso');
                carregarAcervo();
            }
        } catch (error) { showAlert('Erro ao remover.', 'erro'); }
    };

    const handleCriarGrupoVazio = (e) => {
        e.preventDefault();
        const nomeFinal = novoGrupoNome.trim();
        if(nomeFinal) {
            setGruposVazios(prev => [...prev, { nome: nomeFinal, cor: '#059669' }]);
        }
        setAddGrupoAberto(false);
        setNovoGrupoNome('');
    };

    const isModoPrescricao = typeof alvoPrescricao === 'object' && alvoPrescricao !== null && alvoPrescricao.dados;

    const confirmarPrescricaoLote = async () => {
        if (diasLote.length === 0) return showAlert('Selecione pelo menos um dia.', 'erro');
        try {
            const payload = {
                turmaId: alvoPrescricao.tipo === 'turma' ? alvoPrescricao.dados.id : undefined,
                usuarioId: alvoPrescricao.tipo === 'paciente' ? alvoPrescricao.dados.id : undefined,
                treinos: grupoParaLote.itens,
                diasDaSemana: diasLote.join(',')
            };

            const res = await fetch('http://localhost:3001/api/prescricoes/lote', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });

            if (res.ok) {
                showAlert(`O Grupo Inteiro foi prescrito com sucesso para ${alvoPrescricao.dados.nome}!`, 'sucesso');
                setGrupoParaLote(null);
                onClose(); 
            }
        } catch (error) { showAlert('Erro ao prescrever lote.', 'erro'); }
    };

    const toggleDiaLote = (dia) => setDiasLote(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);

    // Combina os grupos que já existem na BD com os grupos vazios criados pelo utilizador agora
    const grupos = acervo.reduce((acc, item) => {
        if (!acc[item.grupo]) acc[item.grupo] = { cor: item.cor, itens: [] };
        acc[item.grupo].itens.push(item);
        return acc;
    }, {});

    gruposVazios.forEach(gv => {
        if (!grupos[gv.nome]) grupos[gv.nome] = { cor: gv.cor, itens: [] };
    });

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 900, padding: '1rem' }}>
            <div className="fade-in" style={{ backgroundColor: '#f8fafc', borderRadius: '14px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Library size={28} color="#059669" /> A Minha Biblioteca de Treinos
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>
                            {isModoPrescricao ? `Selecione um grupo para prescrever a: ${alvoPrescricao.dados.nome}` : 'Crie grupos de treinos e adicione exercícios para a sua biblioteca.'}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={28} /></button>
                </div>

                {!isModoPrescricao && (
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setAddGrupoAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}>
                            <FolderPlus size={20} /> Criar Grupo de Treinos
                        </button>
                    </div>
                )}

                {addGrupoAberto && (
                    <form onSubmit={handleCriarGrupoVazio} className="fade-in" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '2px dashed #059669', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>Nome do Novo Grupo (Ex: Treino A - Pernas)</label>
                            <input type="text" value={novoGrupoNome} onChange={e => setNovoGrupoNome(e.target.value)} autoFocus required placeholder="Escreva o nome do grupo..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <button type="submit" style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Criar</button>
                        <button type="button" onClick={() => setAddGrupoAberto(false)} style={{ backgroundColor: '#f1f5f9', color: '#4b5563', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                    </form>
                )}

                {Object.keys(grupos).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', fontSize: '1.1rem' }}>A sua biblioteca está vazia. Comece por criar um Grupo de Treinos.</p></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {Object.entries(grupos).map(([nomeGrupo, dados]) => (
                            <div key={nomeGrupo} style={{ backgroundColor: 'white', border: `2px solid ${dados.cor}`, borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: dados.cor, color: 'white', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <strong style={{ fontSize: '1.15rem' }}>{nomeGrupo} ({dados.itens.length} exercícios)</strong>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!isModoPrescricao && (
                                            <button onClick={() => setModalAdd({ grupoPreDefinido: nomeGrupo, corPreDefinida: dados.cor })} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                <PlusCircle size={16} /> Adicionar Exercício Aqui
                                            </button>
                                        )}
                                        {isModoPrescricao && dados.itens.length > 0 && (
                                            <button onClick={() => setGrupoParaLote({ nomeGrupo, itens: dados.itens, cor: dados.cor })} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'white', color: dados.cor, border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                <Send size={16} /> Prescrever Grupo Inteiro
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {dados.itens.length === 0 ? (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>Grupo vazio. Adicione exercícios aqui.</p>
                                    ) : (
                                        dados.itens.map(treino => (
                                            <div key={treino.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div><strong style={{ display: 'block', color: '#1e293b', fontSize: '1.05rem' }}>{treino.titulo}</strong><span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Tipo: {treino.tipo}</span></div>
                                                {!isModoPrescricao && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => setModalAdd({ ...treino, grupoPreDefinido: nomeGrupo, treinoEditando: treino })} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.25rem' }} title="Editar"><Edit2 size={18} /></button>
                                                        <button onClick={() => deletarModelo(treino.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }} title="Remover"><Trash2 size={18} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalAdd && <FormPrescricaoModal alvo={{ tipo: 'acervo', dados: { nome: 'Meu Acervo' }, grupoPreDefinido: modalAdd.grupoPreDefinido, corPreDefinida: modalAdd.corPreDefinida, treinoEditando: modalAdd.treinoEditando }} onClose={() => setModalAdd(false)} onSucesso={carregarAcervo} />}
            
            {grupoParaLote && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <div className="scale-in" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', border: `2px solid ${grupoParaLote.cor}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Em quais dias o grupo "{grupoParaLote.nomeGrupo}" será feito?</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                <button key={d} onClick={() => toggleDiaLote(d)} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: `2px solid ${diasLote.includes(d) ? grupoParaLote.cor : '#cbd5e1'}`, backgroundColor: diasLote.includes(d) ? grupoParaLote.cor : 'white', color: diasLote.includes(d) ? 'white' : '#4b5563', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>{d}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setGrupoParaLote(null)} style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', color: '#4b5563', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={confirmarPrescricaoLote} style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', backgroundColor: grupoParaLote.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Prescrição</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}