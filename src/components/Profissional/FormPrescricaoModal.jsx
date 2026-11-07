// src/components/Profissional/FormPrescricaoModal.jsx
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function FormPrescricaoModal({ alvo, onClose, onSucesso }) {
    // alvo pode ser { tipo: 'turma', dados: turma } ou { tipo: 'paciente', dados: paciente }
    const diasOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const coresOpcoes = ['#059669', '#2563eb', '#7c3aed', '#ea580c', '#db2777', '#0891b2', '#475569'];

    const [form, setForm] = useState({
        grupo: 'Treino A',
        diasSelecionados: ['Seg', 'Qua'],
        cor: alvo.dados?.cor || '#059669',
        titulo: '',
        tipo: 'repeticao',
        duracaoMinutos: 10,
        series: 3,
        repeticoes: 10,
        carga: '',
        meta: ''
    });

    const [salvando, setSalvando] = useState(false);

    const toggleDia = (dia) => {
        setForm(prev => ({
            ...prev,
            diasSelecionados: prev.diasSelecionados.includes(dia)
                ? prev.diasSelecionados.filter(d => d !== dia)
                : [...prev.diasSelecionados, dia]
        }));
    };

    const handleNumeroChange = (campo, valor) => {
        const num = valor.replace(/\D/g, '');
        setForm(prev => ({ ...prev, [campo]: num === '' ? '' : Math.max(1, parseInt(num, 10)) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim()) return alert('Dê um nome ao exercício.');
        setSalvando(true);

        try {
            const payload = {
                ...(alvo.tipo === 'turma' ? { turmaId: alvo.dados.id } : { usuarioId: alvo.dados.id }),
                grupo: form.grupo.trim(),
                diasDaSemana: form.diasSelecionados.join(','),
                cor: form.cor,
                titulo: form.titulo.trim(),
                tipo: form.tipo,
                duracaoMinutos: Number(form.duracaoMinutos) || null,
                series: Number(form.series) || null,
                repeticoes: Number(form.repeticoes) || null,
                carga: form.carga.trim(),
                meta: form.meta.trim()
            };

            const res = await fetch('http://localhost:3001/api/prescricoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`Treino prescrito com sucesso para ${alvo.tipo === 'turma' ? `todos da turma ${alvo.dados.nome}` : alvo.dados.nome}!`);
                onSucesso();
                onClose();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '14px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>
                            Prescrever Exercício
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Destino: <strong>{alvo.dados.nome}</strong> ({alvo.tipo === 'turma' ? 'Todos os alunos da turma' : 'Individual'})
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome da Rotina / Grupo</label>
                        <input type="text" value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })} placeholder="Ex: Treino A - Braços" required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Dias Recomendados:</label>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                {diasOpcoes.map(d => (
                                    <button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: `1px solid ${form.diasSelecionados.includes(d) ? form.cor : '#cbd5e1'}`, backgroundColor: form.diasSelecionados.includes(d) ? form.cor : 'white', color: form.diasSelecionados.includes(d) ? 'white' : '#4b5563', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cor:</label>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {coresOpcoes.map(c => (
                                    <div key={c} onClick={() => setForm({ ...form, cor: c })} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: form.cor === c ? '2px solid #000' : '2px solid transparent' }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1.2 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Tipo</label>
                            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                                <option value="repeticao">Repetições</option>
                                <option value="tempo">Tempo Contínuo</option>
                                <option value="isometria">Isometria</option>
                                <option value="carga">Com Carga</option>
                                <option value="meta">Meta Livre</option>
                            </select>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nome do Exercício</label>
                            <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Sentar e Levantar da Cadeira" required style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {form.tipo === 'tempo' && (
                            <input type="text" inputMode="numeric" placeholder="Minutos" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                        {['repeticao', 'isometria', 'carga'].includes(form.tipo) && (
                            <input type="text" inputMode="numeric" placeholder="Séries" value={form.series} onChange={e => handleNumeroChange('series', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                        {['repeticao', 'carga'].includes(form.tipo) && (
                            <input type="text" inputMode="numeric" placeholder="Repetições" value={form.repeticoes} onChange={e => handleNumeroChange('repeticoes', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                        {form.tipo === 'isometria' && (
                            <input type="text" inputMode="numeric" placeholder="Segundos" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                        {form.tipo === 'carga' && (
                            <input type="text" placeholder="Carga (ex: Peso 1kg)" value={form.carga} onChange={e => setForm({ ...form, carga: e.target.value })} style={{ flex: 1.5, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                        {form.tipo === 'meta' && (
                            <input type="text" placeholder="Meta da Tarefa" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} style={{ flex: 1.5, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" disabled={salvando} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: form.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            {salvando ? 'Gravando...' : 'Confirmar Prescrição'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}