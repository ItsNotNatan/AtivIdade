// src/components/Profissional/FormPrescricaoModal.jsx
import React, { useState, useEffect } from 'react';
import { X, LibraryBig, Download, Edit2 } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../AlertContext/AlertContext';
import MapaMuscular from '../MapaMuscular/MapaMuscular';

export default function FormPrescricaoModal({ alvo, onClose, onSucesso }) {
    const { usuario } = useAuthStore();
    const { showAlert } = useAlert();
    const diasOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const coresOpcoes = ['#059669', '#2563eb', '#7c3aed', '#ea580c', '#db2777', '#0891b2', '#475569'];

    const isAcervo = alvo.tipo === 'acervo';
    const isEdit = !!alvo.treinoEditando; 
    
    const [meuAcervo, setMeuAcervo] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const [form, setForm] = useState(() => {
        if (isEdit) return { ...alvo.treinoEditando, diasSelecionados: alvo.treinoEditando.diasDaSemana ? alvo.treinoEditando.diasDaSemana.split(',') : [] };
        return { grupo: isAcervo ? 'Modelos de Base' : 'Treino A', diasSelecionados: ['Seg', 'Qua'], cor: alvo.dados?.cor || '#059669', titulo: '', tipo: 'repeticao', focoMuscular: '', duracaoMinutos: 10, series: 3, repeticoes: 10, carga: '', meta: '' };
    });

    useEffect(() => {
        if (!isAcervo && !isEdit) {
            fetch(`http://localhost:3001/api/acervo/${usuario.id}`).then(res => res.json()).then(setMeuAcervo).catch(console.error);
        }
    }, [isAcervo, isEdit, usuario.id]);

    const handleCarregarModelo = (e) => {
        const modelo = meuAcervo.find(m => m.id === e.target.value);
        if (modelo) setForm(prev => ({ ...prev, grupo: modelo.grupo, cor: modelo.cor, titulo: modelo.titulo, tipo: modelo.tipo, focoMuscular: modelo.focoMuscular || '', duracaoMinutos: modelo.duracaoMinutos || 10, series: modelo.series || 3, repeticoes: modelo.repeticoes || 10, carga: modelo.carga || '', meta: modelo.meta || '' }));
    };

    const toggleDia = (dia) => setForm(prev => ({ ...prev, diasSelecionados: prev.diasSelecionados.includes(dia) ? prev.diasSelecionados.filter(d => d !== dia) : [...prev.diasSelecionados, dia] }));
    const handleNumeroChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor.replace(/\D/g, '') === '' ? '' : Math.max(1, parseInt(valor.replace(/\D/g, ''), 10)) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim()) return showAlert('Dê um nome ao exercício.', 'erro');
        if (!isAcervo && form.diasSelecionados.length === 0) return showAlert('Selecione pelo menos um dia para o treino.', 'erro');
        
        setSalvando(true);
        try {
            const endpointBase = isAcervo ? 'http://localhost:3001/api/acervo' : 'http://localhost:3001/api/prescricoes';
            const url = isEdit ? `${endpointBase}/${alvo.treinoEditando.id}` : endpointBase;
            
            const payload = {
                profissionalId: isAcervo ? usuario.id : undefined,
                turmaId: (!isAcervo && alvo.tipo === 'turma') ? alvo.dados.id : undefined,
                usuarioId: (!isAcervo && alvo.tipo === 'paciente') ? alvo.dados.id : undefined,
                grupo: form.grupo.trim(),
                diasDaSemana: isAcervo ? undefined : form.diasSelecionados.join(','),
                cor: form.cor, titulo: form.titulo.trim(), tipo: form.tipo, focoMuscular: form.focoMuscular,
                duracaoMinutos: Number(form.duracaoMinutos) || null, series: Number(form.series) || null,
                repeticoes: Number(form.repeticoes) || null, carga: form.carga.trim(), meta: form.meta.trim()
            };

            const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { showAlert(isEdit ? 'Atualizado!' : 'Criado!', 'sucesso'); onSucesso(); onClose(); }
        } catch (err) { showAlert('Falha ao comunicar com o servidor', 'erro'); } finally { setSalvando(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isEdit ? <Edit2 size={22} color="#2563eb" /> : null}
                            {isEdit ? 'Editar Exercício' : isAcervo ? 'Novo Modelo de Treino' : 'Prescrever Exercício'}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{isAcervo ? 'Adicionar à sua Biblioteca' : `Destino: ${alvo.dados.nome}`}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                </div>

                {!isAcervo && !isEdit && meuAcervo.length > 0 && (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}><Download size={16} /> Preencher Automaticamente a partir do Acervo:</label>
                        <select onChange={handleCarregarModelo} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <option value="">-- Selecione um modelo --</option>
                            {meuAcervo.map(m => <option key={m.id} value={m.id}>{m.grupo} - {m.titulo}</option>)}
                        </select>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Músculo Alvo (Opcional - Clique no Corpo)</label>
                        <MapaMuscular musculoAtivo={form.focoMuscular} onSelecionarMusculo={(musculo) => setForm({ ...form, focoMuscular: musculo })} />
                    </div>

                    <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome da Rotina / Grupo</label><input type="text" value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })} placeholder="Ex: Treino A - Braços" required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {!isAcervo && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Dias Recomendados:</label>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {diasOpcoes.map(d => <button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: `1px solid ${form.diasSelecionados.includes(d) ? form.cor : '#cbd5e1'}`, backgroundColor: form.diasSelecionados.includes(d) ? form.cor : 'white', color: form.diasSelecionados.includes(d) ? 'white' : '#4b5563', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>{d}</button>)}
                                </div>
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cor da Rotina:</label>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {coresOpcoes.map(c => <div key={c} onClick={() => setForm({ ...form, cor: c })} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: form.cor === c ? '2px solid #000' : '2px solid transparent' }} />)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1.2 }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Tipo</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}><option value="repeticao">Repetições</option><option value="tempo">Tempo Contínuo</option><option value="isometria">Isometria</option><option value="carga">Com Carga</option><option value="meta">Meta Livre</option></select></div>
                        <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome do Exercício</label><input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Rotação de Ombros" required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {form.tipo === 'tempo' && <input type="text" inputMode="numeric" placeholder="Minutos" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                        {['repeticao', 'isometria', 'carga'].includes(form.tipo) && <input type="text" inputMode="numeric" placeholder="Séries" value={form.series} onChange={e => handleNumeroChange('series', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                        {['repeticao', 'carga'].includes(form.tipo) && <input type="text" inputMode="numeric" placeholder="Repetições" value={form.repeticoes} onChange={e => handleNumeroChange('repeticoes', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                        {form.tipo === 'isometria' && <input type="text" inputMode="numeric" placeholder="Segundos" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                        {form.tipo === 'carga' && <input type="text" placeholder="Carga (ex: Peso 1kg)" value={form.carga} onChange={e => setForm({ ...form, carga: e.target.value })} style={{ flex: 1.5, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                        {form.tipo === 'meta' && <input type="text" placeholder="Meta da Tarefa" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} style={{ flex: 1.5, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: isEdit ? '#2563eb' : form.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{isAcervo ? <LibraryBig size={18} /> : null} {salvando ? 'A Processar...' : (isEdit ? 'Salvar Alterações' : isAcervo ? 'Salvar no Acervo' : 'Confirmar Prescrição')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}