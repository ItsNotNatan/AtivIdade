// src/components/Profissional/AbaAcervo.jsx
import React, { useState, useEffect } from 'react';
import { 
    FolderKanban, FolderPlus, PlusCircle, Edit2, Trash2, 
    Search, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function AbaAcervo({ acervo = [], onNovoExercicio, onEditarExercicio, onDeletarItem }) {
    const [addGrupoAberto, setAddGrupoAberto] = useState(false);
    const [novoGrupoNome, setNovoGrupoNome] = useState('');

    // ==========================================
    // CONTROLES DE PESQUISA, FILTRO E PAGINAÇÃO
    // ==========================================
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [pagina, setPagina] = useState(1);
    const pastasPorPagina = 3;

    // Resetar a página para 1 sempre que o filtro ou a busca mudarem
    useEffect(() => {
        setPagina(1);
    }, [busca, filtroTipo]);

    // 1. Filtragem dos Exercícios
    const acervoFiltrado = (acervo || []).filter(ex => {
        const termo = busca.toLowerCase();
        const bateBusca = ex.titulo?.toLowerCase().includes(termo) || 
                          ex.grupo?.toLowerCase().includes(termo) || 
                          ex.focoMuscular?.toLowerCase().includes(termo);
        
        const bateFiltro = filtroTipo === '' || ex.tipo === filtroTipo;
        return bateBusca && bateFiltro;
    });

    // 2. Agrupamento em Pastas
    const gruposAcervo = acervoFiltrado.reduce((acc, item) => {
        const nome = item.grupo || 'Modelo';
        if (!acc[nome]) acc[nome] = { cor: item.cor || '#059669', itens: [] };
        acc[nome].itens.push(item);
        return acc;
    }, {});

    // 3. Lógica de Paginação das Pastas
    const chavesPastas = Object.keys(gruposAcervo);
    const totalPaginas = Math.ceil(chavesPastas.length / pastasPorPagina) || 1;
    const pastasPaginadas = chavesPastas.slice((pagina - 1) * pastasPorPagina, pagina * pastasPorPagina);
    const paginasNumeros = Array.from({ length: totalPaginas }, (_, i) => i + 1);

    // ==========================================
    // HANDLERS
    // ==========================================
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
            {/* CABEÇALHO */}
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

            {/* FORMULÁRIO DE NOVA PASTA */}
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

            {/* BARRA DE PESQUISA E FILTROS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar exercício, pasta ou músculo..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select 
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}
                    >
                        <option value="">Todos os Tipos</option>
                        <option value="repeticao">Repetições</option>
                        <option value="tempo">Tempo Contínuo</option>
                        <option value="isometria">Isometria</option>
                        <option value="carga">Com Carga</option>
                        <option value="meta">Meta Livre</option>
                    </select>
                </div>
            </div>

            {/* ESTADO VAZIO / LISTAGEM */}
            {pastasPaginadas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', border: '1px dashed #cbd5e1' }}>
                    <FolderKanban size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                        {busca || filtroTipo ? 'Nenhum exercício encontrado na pesquisa.' : 'O seu acervo está vazio'}
                    </h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Cadastre exercícios-modelo para agilizar as prescrições de rotina dos seus alunos.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* MAPEAMENTO DAS PASTAS PAGINADAS */}
                    {pastasPaginadas.map(nomeGrupo => {
                        const dados = gruposAcervo[nomeGrupo];
                        return (
                            <div key={nomeGrupo} style={{ backgroundColor: 'white', border: `2px solid ${dados.cor}`, overflow: 'hidden' }}>
                                
                                {/* CABEÇALHO DA PASTA */}
                                <div style={{ backgroundColor: dados.cor, color: 'white', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>📁 {nomeGrupo} ({dados.itens.length} exercícios)</strong>
                                    <button 
                                        onClick={() => onNovoExercicio(nomeGrupo, dados.cor)} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'white', color: dados.cor, border: 'none', padding: '0.35rem 0.85rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        <PlusCircle size={16} /> Adicionar Exercício nesta Pasta
                                    </button>
                                </div>

                                {/* LISTAGEM DOS EXERCÍCIOS DA PASTA */}
                                <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {dados.itens.map(treino => (
                                        <div key={treino.id} style={{ display: 'flex', gap: '0.75rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', minHeight: '90px' }}>
                                            
                                            {/* MINIATURA DA IMAGEM/GIF */}
                                            {treino.gifUrl ? (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'white', border: '1px solid #cbd5e1' }}>
                                                    {treino.gifUrl.match(/\.(mp4|webm)$/i) || treino.gifUrl.startsWith('data:video') ? (
                                                        <video src={treino.gifUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                                    ) : (
                                                        <img src={treino.gifUrl} alt={treino.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                                                    🏋️
                                                </div>
                                            )}

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                        <strong style={{ color: '#0f172a', fontSize: '1rem', lineHeight: '1.2' }}>{treino.titulo}</strong>
                                                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                                            <button onClick={() => onEditarExercicio(treino, nomeGrupo)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.2rem' }} title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => onDeletarItem(treino.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }} title="Remover"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                        Tipo: {treino.tipo} {treino.focoMuscular ? `• ${treino.focoMuscular}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CONTROLES DE PAGINAÇÃO NUMÉRICA */}
            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                    <button 
                        onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                        disabled={pagina === 1}
                        style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === 1 ? '#f8fafc' : 'white', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={20} color={pagina === 1 ? '#94a3b8' : '#334155'} />
                    </button>
                    
                    {paginasNumeros.map(num => (
                        <button
                            key={num}
                            onClick={() => setPagina(num)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                border: '1px solid #cbd5e1',
                                backgroundColor: pagina === num ? '#059669' : 'white',
                                color: pagina === num ? 'white' : '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {num}
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                        disabled={pagina === totalPaginas}
                        style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: pagina === totalPaginas ? '#f8fafc' : 'white', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={20} color={pagina === totalPaginas ? '#94a3b8' : '#334155'} />
                    </button>
                </div>
            )}
        </div>
    );
}