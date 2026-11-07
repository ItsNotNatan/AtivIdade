// src/components/Profissional/FormPrescricaoModal.jsx
import React, { useState, useEffect } from 'react';
import { X, LibraryBig, Download, Edit2, Loader2, UploadCloud, Link as LinkIcon, CheckCircle2, Film } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../AlertContext/AlertContext';
import MapaMuscular from '../MapaMuscular/MapaMuscular';
import { buscarExerciciosAPI } from '../../services/apiExercicios';

export default function FormPrescricaoModal({ alvo, onClose, onSucesso }) {
    const { usuario } = useAuthStore();
    const { showAlert } = useAlert();
    const diasOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const isAcervo = alvo.tipo === 'acervo';
    const isEdit = !!alvo.treinoEditando; 
    
    const [meuAcervo, setMeuAcervo] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const [exerciciosApi, setExerciciosApi] = useState([]);
    const [carregandoApi, setCarregandoApi] = useState(false);

    const [form, setForm] = useState(() => {
        if (isEdit) return { ...alvo.treinoEditando, diasSelecionados: alvo.treinoEditando.diasDaSemana ? alvo.treinoEditando.diasDaSemana.split(',') : [] };
        return { 
            grupo: alvo.grupoPreDefinido || (isAcervo ? 'Modelos de Base' : 'Treino A'), 
            diasSelecionados: ['Seg', 'Qua'], 
            cor: alvo.corPreDefinida || alvo.dados?.cor || '#059669', 
            titulo: '', tipo: 'repeticao', focoMuscular: '', gifUrl: '', duracaoMinutos: '', series: '', repeticoes: '', carga: '', meta: '' 
        };
    });

    useEffect(() => {
        if (form.focoMuscular) {
            const carregar = async () => {
                setCarregandoApi(true);
                const resultados = await buscarExerciciosAPI(form.focoMuscular);
                setExerciciosApi(resultados);
                setCarregandoApi(false);
            };
            carregar();
        } else {
            setExerciciosApi([]);
        }
    }, [form.focoMuscular]);

    useEffect(() => {
        if (!isAcervo && !isEdit) {
            fetch(`http://localhost:3001/api/acervo/${usuario.id}`).then(res => res.json()).then(setMeuAcervo).catch(console.error);
        }
    }, [isAcervo, isEdit, usuario.id]);

    const handleSelecionarExercicioApi = (exApi) => {
        const nomeFormatado = exApi.name.charAt(0).toUpperCase() + exApi.name.slice(1);
        setForm(prev => ({ 
            ...prev, 
            titulo: prev.titulo ? prev.titulo : nomeFormatado, 
            gifUrl: exApi.gifUrl 
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) return showAlert('O arquivo é muito grande. Limite de 15MB.', 'erro');

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({ ...prev, gifUrl: reader.result }));
            showAlert('Arquivo carregado com sucesso!', 'sucesso');
        };
        reader.readAsDataURL(file);
    };

    const handleCarregarModelo = (e) => {
        const modelo = meuAcervo.find(m => m.id === e.target.value);
        if (modelo) {
            setForm(prev => ({ 
                ...prev, 
                titulo: modelo.titulo, 
                tipo: modelo.tipo, 
                focoMuscular: modelo.focoMuscular || '', 
                gifUrl: modelo.gifUrl || '', 
                duracaoMinutos: modelo.duracaoMinutos || '', 
                series: modelo.series || '', 
                repeticoes: modelo.repeticoes || '', 
                carga: modelo.carga || '', 
                meta: modelo.meta || '' 
            }));
        }
    };

    const toggleDia = (dia) => setForm(prev => ({ ...prev, diasSelecionados: prev.diasSelecionados.includes(dia) ? prev.diasSelecionados.filter(d => d !== dia) : [...prev.diasSelecionados, dia] }));
    const handleNumeroChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor.replace(/\D/g, '') === '' ? '' : Math.max(1, parseInt(valor.replace(/\D/g, ''), 10)) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.focoMuscular) return showAlert('Selecione pelo menos um Músculo Alvo.', 'erro');
        if (!form.grupo || !form.grupo.trim()) return showAlert('O campo Grupo é obrigatório.', 'erro');
        if (!form.titulo || !form.titulo.trim()) return showAlert('O Nome do Exercício é obrigatório.', 'erro');
        if (!isAcervo && form.diasSelecionados.length === 0) return showAlert('Selecione pelo menos um dia da semana.', 'erro');
        
        if (form.tipo === 'tempo' && !form.duracaoMinutos) return showAlert('Informe a Duração em minutos.', 'erro');
        if (['repeticao', 'isometria', 'carga'].includes(form.tipo) && !form.series) return showAlert('Informe o número de Séries.', 'erro');
        if (['repeticao', 'carga'].includes(form.tipo) && !form.repeticoes) return showAlert('Informe o número de Repetições.', 'erro');
        if (form.tipo === 'isometria' && !form.duracaoMinutos) return showAlert('Informe o tempo de Sustentação.', 'erro');
        if (form.tipo === 'carga' && (!form.carga || !form.carga.trim())) return showAlert('Escreva qual é a Carga ou Equipamento.', 'erro');
        if (form.tipo === 'meta' && (!form.meta || !form.meta.trim())) return showAlert('Escreva qual é a Meta da tarefa.', 'erro');

        setSalvando(true);
        try {
            const endpointBase = isAcervo ? 'http://localhost:3001/api/acervo' : 'http://localhost:3001/api/prescricoes';
            const url = isEdit ? `${endpointBase}/${alvo.treinoEditando.id}` : endpointBase;
            
            const payload = {
                profissionalId: isAcervo ? usuario.id : undefined, 
                turmaId: (!isAcervo && alvo.tipo === 'turma') ? alvo.dados.id : undefined,
                usuarioId: (!isAcervo && alvo.tipo === 'paciente') ? alvo.dados.id : undefined, 
                grupo: String(form.grupo || '').trim(),
                diasDaSemana: isAcervo ? undefined : form.diasSelecionados.join(','),
                cor: form.cor, 
                titulo: String(form.titulo || '').trim(), 
                tipo: form.tipo, 
                focoMuscular: form.focoMuscular, 
                gifUrl: form.gifUrl,
                duracaoMinutos: Number(form.duracaoMinutos) || null, 
                series: Number(form.series) || null,
                repeticoes: Number(form.repeticoes) || null, 
                carga: String(form.carga || '').trim(), 
                meta: String(form.meta || '').trim()
            };

            const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (res.ok) { 
                showAlert(isEdit ? 'Atualizado com sucesso!' : 'Exercício gravado com sucesso!', 'sucesso'); 
                onSucesso(); 
                onClose(); 
            } else {
                let errData;
                try { errData = await res.json(); } catch (jsonErr) { errData = { erro: 'Servidor recusou os dados.' }; }
                showAlert(`Erro: ${errData.erro}`, 'erro');
            }
        } catch (err) { showAlert('Falha ao comunicar com o servidor.', 'erro'); } finally { setSalvando(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem' }}>
            <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '880px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '92vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isEdit ? <Edit2 size={24} color="#2563eb" /> : null} {isEdit ? 'Editar Exercício' : isAcervo ? `Novo Exercício em "${form.grupo}"` : `Prescrever Exercício para "${form.grupo}"`}
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{isAcervo ? 'Adicionar à sua Biblioteca' : `Destino: ${alvo.dados.nome}`}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                {!isAcervo && !isEdit && meuAcervo.length > 0 && (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}><Download size={18} /> Preencher a partir do Acervo:</label>
                        <select onChange={handleCarregarModelo} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                            <option value="">-- Selecione um modelo gravado --</option>
                            {meuAcervo.map(m => <option key={m.id} value={m.id}>{m.titulo} (Grupo: {m.grupo})</option>)}
                        </select>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Músculos Alvo <span style={{color: 'red'}}>*</span></label>
                        <MapaMuscular musculoAtivo={form.focoMuscular} onSelecionarMusculo={(musculos) => setForm({ ...form, focoMuscular: musculos })} />
                    </div>

                    {/* GALERIA DE EXERCÍCIOS COM SELEÇÃO VISÍVEL */}
                    {form.focoMuscular && (
                        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1rem', borderRadius: '12px' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.75rem' }}>
                                <span>Demonstrações Sugeridas (Clique sobre a imagem para escolher):</span>
                                {carregandoApi && <Loader2 size={16} className="girar" />}
                            </label>
                            
                            <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '0.5rem' }}>
                                {exerciciosApi.map((ex) => {
                                    const selecionado = form.gifUrl === ex.gifUrl;
                                    return (
                                        <div 
                                            key={ex.id} 
                                            onClick={() => handleSelecionarExercicioApi(ex)} 
                                            style={{ 
                                                minWidth: '150px', maxWidth: '150px', cursor: 'pointer', borderRadius: '10px', padding: '0.5rem', 
                                                border: `3px solid ${selecionado ? '#059669' : '#e2e8f0'}`, 
                                                backgroundColor: selecionado ? '#ecfdf5' : 'white', 
                                                boxShadow: selecionado ? '0 4px 12px rgba(5,150,105,0.25)' : '0 2px 4px rgba(0,0,0,0.05)', 
                                                transition: 'all 0.2s', position: 'relative'
                                            }}
                                        >
                                            {selecionado && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#059669', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                            <img 
                                                src={ex.gifUrl} 
                                                alt={ex.name} 
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#fff' }} 
                                                loading="lazy" 
                                            />
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: selecionado ? '#059669' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ex.name}>
                                                {ex.name}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* PRÉVIA AO VIVO DA IMAGEM / VÍDEO SELECIONADO */}
                    {form.gifUrl && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {form.gifUrl.includes('data:video') || form.gifUrl.match(/\.(mp4|webm)$/i) ? (
                                    <video src={form.gifUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={form.gifUrl} alt="Prévia" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Film size={16} /> Demonstração visual selecionada:
                                </span>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>
                                    {form.gifUrl.startsWith('data:') ? 'Arquivo de vídeo/imagem carregado localmente.' : form.gifUrl}
                                </p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, gifUrl: '' })} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                Remover
                            </button>
                        </div>
                    )}

                    {/* OPÇÃO MANUAL: LINK OU UPLOAD */}
                    <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Ou envie um vídeo próprio (Cole o link ou suba um arquivo):</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                                <LinkIcon size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                <input type="text" value={form.gifUrl || ''} onChange={e => setForm({ ...form, gifUrl: e.target.value })} placeholder="Ex: https://meusite.com/video.mp4" style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>OU</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.7rem 1.2rem', backgroundColor: 'white', color: '#334155', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #cbd5e1', transition: 'background 0.2s' }}>
                                <UploadCloud size={18} color="#2563eb" /> Subir Arquivo
                                <input type="file" accept="image/gif, video/mp4, video/webm, image/jpeg, image/png" style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem' }}>
                        <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Tipo de Exercício</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}><option value="repeticao">Repetições</option><option value="tempo">Tempo Contínuo</option><option value="isometria">Isometria</option><option value="carga">Com Carga</option><option value="meta">Meta Livre</option></select></div>
                        <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Nome do Exercício <span style={{color: 'red'}}>*</span></label><input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Rotação de Ombros" style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isAcervo ? '1fr' : '1.2fr 1fr', gap: '1.25rem' }}>
                        <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Grupo (Pasta do Treino) <span style={{color: 'red'}}>*</span></label><input type="text" value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })} disabled={!!alvo.grupoPreDefinido} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: alvo.grupoPreDefinido ? '#f1f5f9' : 'white', cursor: alvo.grupoPreDefinido ? 'not-allowed' : 'text' }} /></div>
                        {!isAcervo && (<div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Dias Recomendados: <span style={{color: 'red'}}>*</span></label><div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>{diasOpcoes.map(d => (<button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: `1px solid ${form.diasSelecionados.includes(d) ? form.cor : '#cbd5e1'}`, backgroundColor: form.diasSelecionados.includes(d) ? form.cor : 'white', color: form.diasSelecionados.includes(d) ? 'white' : '#4b5563', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>{d}</button>))}</div></div>)}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {form.tipo === 'tempo' && (<div style={{ flex: 1, minWidth: '160px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Duração (Minutos) <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                        {['repeticao', 'isometria', 'carga'].includes(form.tipo) && (<div style={{ flex: 1, minWidth: '120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Séries <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.series} onChange={e => handleNumeroChange('series', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                        {['repeticao', 'carga'].includes(form.tipo) && (<div style={{ flex: 1, minWidth: '120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Repetições <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.repeticoes} onChange={e => handleNumeroChange('repeticoes', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                        {form.tipo === 'isometria' && (<div style={{ flex: 1, minWidth: '160px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Sustentação (Seg) <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                        {form.tipo === 'carga' && (<div style={{ flex: 2, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Carga / Equipamento <span style={{color: 'red'}}>*</span></label><input type="text" value={form.carga} onChange={e => setForm({ ...form, carga: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                        {form.tipo === 'meta' && (<div style={{ flex: 2, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Meta da Tarefa <span style={{color: 'red'}}>*</span></label><input type="text" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: isEdit ? '#2563eb' : form.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            {isAcervo ? <LibraryBig size={20} /> : null} {salvando ? 'A Processar...' : (isEdit ? 'Salvar Alterações' : 'Salvar Exercício')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}