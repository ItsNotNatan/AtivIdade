// src/components/Profissional/FormPrescricaoModal.jsx
import React, { useState, useEffect } from 'react';
import { X, LibraryBig, Edit2, Loader2, UploadCloud, Link as LinkIcon, CheckCircle2, Film, PlusCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../AlertContext/AlertContext';
import MapaMuscular from '../MapaMuscular/MapaMuscular';
import { buscarExerciciosAPI } from '../../services/apiExercicios';
import { API_URL } from '../../config';

export default function FormPrescricaoModal({ alvo, onClose, onSucesso }) {
    const { usuario } = useAuthStore();
    const { showAlert } = useAlert();
    const diasOpcoes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const isAcervo = alvo.tipo === 'acervo';
    const isEdit = !!alvo.treinoEditando; 
    
    // GESTÃO DOS PASSOS DO MODAL (escolha -> form OU selecao_acervo)
    const [passo, setPasso] = useState(isEdit ? 'form' : 'escolha');
    
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
        if (!isEdit) {
            fetch(`${API_URL}/api/acervo/${usuario.id}`).then(res => res.json()).then(setMeuAcervo).catch(console.error);
        }
    }, [isEdit, usuario.id]);

    const handleSelecionarExercicioApi = (e, exApi) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const nomeDaApi = exApi.name || 'Exercício';
        const nomeFormatado = nomeDaApi.charAt(0).toUpperCase() + nomeDaApi.slice(1);
        
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
        } else {
            setForm(prev => ({ ...prev, titulo: '' }));
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
            const endpointBase = isAcervo ? `${API_URL}/api/acervo` : `${API_URL}/api/prescricoes`;
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

    // =========================================================================
    // RENDERIZAÇÃO: PASSO 1 - TELA DE ESCOLHA INICIAL
    // =========================================================================
    if (passo === 'escolha') {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem', boxSizing: 'border-box' }}>
                <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b' }}>Adicionar Exercício</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}><X size={24} /></button>
                    </div>

                    <p style={{ color: '#475569', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                        Como deseja adicionar o exercício em <strong>"{alvo.grupoPreDefinido || 'Treino'}"</strong>?
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => {
                                if (meuAcervo.length === 0) showAlert('O seu Acervo está vazio! Crie exercícios do zero primeiro.', 'info');
                                else setPasso('selecao_acervo');
                            }} 
                            style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2.5rem 1.5rem', backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <LibraryBig size={48} color="#2563eb" />
                            <div style={{ textAlign: 'center' }}>
                                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem' }}>Puxar do Acervo</strong>
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Usar um modelo de exercício que você já salvou anteriormente.</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => setPasso('form')} 
                            style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2.5rem 1.5rem', backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <PlusCircle size={48} color="#059669" />
                            <div style={{ textAlign: 'center' }}>
                                <strong style={{ display: 'block', fontSize: '1.15rem', color: '#166534', marginBottom: '0.5rem' }}>Criar Novo</strong>
                                <span style={{ fontSize: '0.9rem', color: '#15803d' }}>Configurar um exercício do zero (séries, músculos, vídeo).</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // RENDERIZAÇÃO: PASSO 2A - SELECIONAR DO ACERVO
    // =========================================================================
    if (passo === 'selecao_acervo') {
        return (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem', boxSizing: 'border-box' }}>
                <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', boxSizing: 'border-box' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button onClick={() => setPasso('escolha')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', padding: '0.4rem' }} title="Voltar">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Puxar Exercício do Acervo</h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>1. Selecione o Exercício do seu Banco</label>
                            <select required onChange={handleCarregarModelo} style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '1rem' }}>
                                <option value="">-- Escolha um modelo --</option>
                                {meuAcervo.map(m => <option key={m.id} value={m.id}>{m.titulo} (Pasta: {m.grupo})</option>)}
                            </select>
                        </div>

                        {/* NOVO CARTÃO RICO PARA O EXERCÍCIO SELECIONADO */}
                        {form.titulo && (
                            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                
                                {/* Miniatura */}
                                {form.gifUrl ? (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'white', border: '1px solid #cbd5e1' }}>
                                        {form.gifUrl.match(/\.(mp4|webm)$/i) || form.gifUrl.startsWith('data:video') ? (
                                            <video src={form.gifUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted playsInline />
                                        ) : (
                                            <img src={form.gifUrl} alt={form.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                                        🏋️
                                    </div>
                                )}
                                
                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.85rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                                        <CheckCircle2 size={16} /> Pronto para prescrever:
                                    </p>
                                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        {form.titulo}
                                    </strong>
                                    
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569' }}>
                                        <span style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                                            {form.tipo}
                                        </span>
                                        
                                        {form.focoMuscular && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}>
                                                🎯 {form.focoMuscular}
                                            </span>
                                        )}

                                        <span style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            {form.tipo === 'tempo' && form.duracaoMinutos ? `⏳ ${form.duracaoMinutos} Minutos` : ''}
                                            {['repeticao', 'carga'].includes(form.tipo) && form.series && form.repeticoes ? `🔄 ${form.series} Séries x ${form.repeticoes} Repetições` : ''}
                                            {form.tipo === 'isometria' && form.series && form.duracaoMinutos ? `⏸️ ${form.series} Séries x ${form.duracaoMinutos} Segundos` : ''}
                                            {form.tipo === 'carga' && form.carga ? ` ⚖️ Carga: ${form.carga}` : ''}
                                            {form.tipo === 'meta' && form.meta ? ` 🎯 Meta: ${form.meta}` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isAcervo && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.5rem' }}>2. Dias Recomendados <span style={{color: 'red'}}>*</span></label>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {diasOpcoes.map(d => (
                                        <button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.55rem 0.85rem', borderRadius: '6px', border: `1px solid ${form.diasSelecionados.includes(d) ? form.cor : '#cbd5e1'}`, backgroundColor: form.diasSelecionados.includes(d) ? form.cor : 'white', color: form.diasSelecionados.includes(d) ? 'white' : '#4b5563', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>{d}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Cancelar</button>
                            <button type="submit" disabled={salvando || !form.titulo} style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: form.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                                {salvando ? 'A Processar...' : 'Confirmar e Adicionar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // =========================================================================
    // RENDERIZAÇÃO: PASSO 2B - FORMULÁRIO COMPLETO (CRIAR NOVO OU EDITAR)
    // =========================================================================
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem', boxSizing: 'border-box' }}>
            <div className="fade-in" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '880px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            
                            {/* Botão de Voltar só aparece se estiver a criar, e não a editar */}
                            {!isEdit && (
                                <button type="button" onClick={() => setPasso('escolha')} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', padding: '0.3rem' }} title="Voltar">
                                    <ArrowLeft size={18} />
                                </button>
                            )}

                            {isEdit ? <Edit2 size={24} color="#2563eb" /> : null} 
                            {isEdit ? 'Editar Exercício' : isAcervo ? `Novo Exercício em "${form.grupo}"` : `Prescrever Exercício para "${form.grupo}"`}
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: !isEdit ? '34px' : '0' }}>{isAcervo ? 'Adicionar à sua Biblioteca' : `Destino: ${alvo.dados.nome}`}</span>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', boxSizing: 'border-box' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Músculos Alvo <span style={{color: 'red'}}>*</span></label>
                        <MapaMuscular musculoAtivo={form.focoMuscular} onSelecionarMusculo={(musculos) => setForm({ ...form, focoMuscular: musculos })} />
                    </div>

                    {/* GALERIA DE EXERCÍCIOS COM SELEÇÃO VISÍVEL */}
                    {form.focoMuscular && (
                        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1rem', borderRadius: '12px', boxSizing: 'border-box' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span>Demonstrações Sugeridas (Clique sobre a imagem para escolher):</span>
                                {carregandoApi && <Loader2 size={16} className="girar" />}
                            </label>
                            
                            <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '0.75rem', paddingTop: '0.25rem' }}>
                                {exerciciosApi.map((ex) => {
                                    const selecionado = form.gifUrl === ex.gifUrl;
                                    return (
                                        <button 
                                            type="button"
                                            key={ex.id} 
                                            onClick={(e) => handleSelecionarExercicioApi(e, ex)} 
                                            style={{ 
                                                minWidth: '160px', maxWidth: '160px', cursor: 'pointer', borderRadius: '10px', padding: '0.5rem', 
                                                border: `4px solid ${selecionado ? '#059669' : '#e2e8f0'}`, 
                                                backgroundColor: selecionado ? '#ecfdf5' : 'white', 
                                                boxShadow: selecionado ? '0 8px 16px rgba(5,150,105,0.3)' : '0 2px 4px rgba(0,0,0,0.05)', 
                                                transition: 'all 0.2s ease', position: 'relative', boxSizing: 'border-box',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center'
                                            }}
                                        >
                                            {selecionado && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#059669', color: 'white', borderRadius: '50%', padding: '4px', display: 'flex', zIndex: 2 }}>
                                                    <CheckCircle2 size={20} strokeWidth={3} />
                                                </div>
                                            )}
                                            <img 
                                                src={ex.gifUrl} 
                                                alt={ex.name || 'Exercício'} 
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#fff', opacity: selecionado ? 1 : 0.8 }} 
                                                loading="lazy" 
                                            />
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold', color: selecionado ? '#059669' : '#334155', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ex.name || 'Exercício'}>
                                                {ex.name || 'Exercício'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* PRÉVIA AO VIVO DA IMAGEM / VÍDEO SELECIONADO */}
                    {form.gifUrl && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxSizing: 'border-box' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {form.gifUrl.includes('data:video') || form.gifUrl.match(/\.(mp4|webm)$/i) ? (
                                    <video src={form.gifUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={form.gifUrl} alt="Prévia" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <Film size={18} /> Demonstração selecionada com sucesso!
                                </span>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>
                                    {form.gifUrl.startsWith('data:') ? 'Arquivo carregado localmente.' : 'Link da galeria associado ao treino.'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, gifUrl: '' })} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '6px' }}>
                                Remover
                            </button>
                        </div>
                    )}

                    {/* OPÇÃO MANUAL: LINK OU UPLOAD */}
                    <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Ou envie um vídeo próprio (Cole o link ou suba um arquivo):</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                                <LinkIcon size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                <input type="text" value={form.gifUrl || ''} onChange={e => setForm({ ...form, gifUrl: e.target.value })} placeholder="Ex: https://meusite.com/video.mp4" style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>OU</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.7rem 1.2rem', backgroundColor: 'white', color: '#334155', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid #cbd5e1', transition: 'background 0.2s', boxSizing: 'border-box' }}>
                                <UploadCloud size={18} color="#2563eb" /> Subir Arquivo
                                <input type="file" accept="image/gif, video/mp4, video/webm, image/jpeg, image/png" style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Tipo de Exercício</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}><option value="repeticao">Repetições</option><option value="tempo">Tempo Contínuo</option><option value="isometria">Isometria</option><option value="carga">Com Carga</option><option value="meta">Meta Livre</option></select></div>
                        <div style={{ flex: 2, minWidth: '250px' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Nome do Exercício <span style={{color: 'red'}}>*</span></label><input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Rotação de Ombros" style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Grupo (Pasta do Treino) <span style={{color: 'red'}}>*</span></label><input type="text" value={form.grupo} onChange={e => setForm({ ...form, grupo: e.target.value })} disabled={!!alvo.grupoPreDefinido} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: alvo.grupoPreDefinido ? '#f1f5f9' : 'white', cursor: alvo.grupoPreDefinido ? 'not-allowed' : 'text', boxSizing: 'border-box' }} /></div>
                        {!isAcervo && (<div style={{ flex: 1.2, minWidth: '250px' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>Dias Recomendados: <span style={{color: 'red'}}>*</span></label><div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>{diasOpcoes.map(d => (<button type="button" key={d} onClick={() => toggleDia(d)} style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: `1px solid ${form.diasSelecionados.includes(d) ? form.cor : '#cbd5e1'}`, backgroundColor: form.diasSelecionados.includes(d) ? form.cor : 'white', color: form.diasSelecionados.includes(d) ? 'white' : '#4b5563', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>{d}</button>))}</div></div>)}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {form.tipo === 'tempo' && (<div style={{ flex: 1, minWidth: '140px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Duração (Minutos) <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                        {['repeticao', 'isometria', 'carga'].includes(form.tipo) && (<div style={{ flex: 1, minWidth: '120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Séries <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.series} onChange={e => handleNumeroChange('series', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                        {['repeticao', 'carga'].includes(form.tipo) && (<div style={{ flex: 1, minWidth: '120px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Repetições <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.repeticoes} onChange={e => handleNumeroChange('repeticoes', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                        {form.tipo === 'isometria' && (<div style={{ flex: 1, minWidth: '140px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Sustentação (Seg) <span style={{color: 'red'}}>*</span></label><input type="text" inputMode="numeric" value={form.duracaoMinutos} onChange={e => handleNumeroChange('duracaoMinutos', e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                        {form.tipo === 'carga' && (<div style={{ flex: 2, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Carga / Equipamento <span style={{color: 'red'}}>*</span></label><input type="text" value={form.carga} onChange={e => setForm({ ...form, carga: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                        {form.tipo === 'meta' && (<div style={{ flex: 2, minWidth: '200px' }}><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Meta da Tarefa <span style={{color: 'red'}}>*</span></label><input type="text" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>Cancelar</button>
                        <button type="submit" disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: isEdit ? '#2563eb' : form.cor, color: 'white', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                            {isAcervo ? <LibraryBig size={20} /> : null} {salvando ? 'A Processar...' : (isEdit ? 'Salvar Alterações' : 'Salvar Exercício')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}