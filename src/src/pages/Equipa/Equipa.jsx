// src/pages/Acervo/Acervo.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, PlusCircle, Trash2, Edit2, Library, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../../contexts/authStore';
import { useAlert } from '../../components/AlertContext/AlertContext';
import { API_URL } from '../../config';
import FormPrescricaoModal from '../../components/Profissional/FormPrescricaoModal';

export default function Acervo() {
    const { usuario } = useAuthStore();
    const { showConfirm, showAlert } = useAlert();
    
    const [exercicios, setExercicios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    
    // Controles de Pesquisa e Filtro
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    
    // Controles de Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 8; // Quantidade de cards por página

    // Controle do Modal de Criação/Edição
    const [modalAberto, setModalAberto] = useState(false);
    const [exercicioEditando, setExercicioEditando] = useState(null);

    useEffect(() => {
        if (usuario?.id) {
            carregarAcervo();
        }
    }, [usuario]);

    // Sempre que o utilizador digitar na pesquisa ou mudar o filtro, volta para a página 1
    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, filtroTipo]);

    const carregarAcervo = async () => {
        setCarregando(true);
        try {
            const res = await fetch(`${API_URL}/api/acervo/${usuario.id}`);
            if (res.ok) {
                setExercicios(await res.json());
            }
        } catch (erro) {
            console.error("Erro ao carregar acervo:", erro);
        } finally {
            setCarregando(false);
        }
    };

    const deletarExercicio = async (id) => {
        if (!await showConfirm('Tem certeza que deseja excluir este modelo do seu acervo?')) return;
        try {
            const res = await fetch(`${API_URL}/api/acervo/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setExercicios(prev => prev.filter(e => e.id !== id));
                showAlert('Exercício excluído com sucesso!', 'sucesso');
                
                // Se apagar o último item da página atual, volta uma página
                if (exerciciosPaginados.length === 1 && paginaAtual > 1) {
                    setPaginaAtual(prev => prev - 1);
                }
            }
        } catch (erro) {
            showAlert('Erro ao excluir o exercício.', 'erro');
        }
    };

    // ==========================================
    // LÓGICA DE FILTRAGEM E PESQUISA
    // ==========================================
    const exerciciosFiltrados = exercicios.filter(ex => {
        const termoBusca = busca.toLowerCase();
        const bateBusca = ex.titulo.toLowerCase().includes(termoBusca) || 
                          (ex.grupo && ex.grupo.toLowerCase().includes(termoBusca)) || 
                          (ex.focoMuscular && ex.focoMuscular.toLowerCase().includes(termoBusca));
        
        const bateFiltro = filtroTipo === '' || ex.tipo === filtroTipo;
        
        return bateBusca && bateFiltro;
    });

    // ==========================================
    // LÓGICA DE PAGINAÇÃO
    // ==========================================
    const totalPaginas = Math.ceil(exerciciosFiltrados.length / itensPorPagina) || 1;
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const exerciciosPaginados = exerciciosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Library size={28} color="#2563eb" /> Meu Banco de Exercícios
                    </h1>
                    <p style={{ margin: 0, color: '#64748b' }}>Gerencie os modelos de treinos que você usa para prescrever aos pacientes.</p>
                </div>
                <button 
                    onClick={() => { setExercicioEditando(null); setModalAberto(true); }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                    <PlusCircle size={20} /> Criar Novo Modelo
                </button>
            </div>

            {/* BARRA DE PESQUISA E FILTROS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                
                {/* Search Bar */}
                <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, pasta ou músculo..." 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem' }}
                    />
                </div>

                {/* Filtro Dropdown */}
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select 
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem', backgroundColor: 'white', cursor: 'pointer' }}
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

            {/* LISTAGEM DOS EXERCÍCIOS (GRID) */}
            {carregando ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Carregando seu acervo...</div>
            ) : exerciciosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
                    <Dumbbell size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Nenhum exercício encontrado</h3>
                    <p style={{ margin: 0 }}>Tente mudar os termos da pesquisa ou adicione um novo modelo.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {exerciciosPaginados.map(ex => (
                            <div key={ex.id} className="fade-in" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                
                                {/* Header Colorido / Imagem */}
                                <div style={{ height: '140px', backgroundColor: ex.cor || '#e2e8f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {ex.gifUrl ? (
                                        ex.gifUrl.match(/\.(mp4|webm)$/i) || ex.gifUrl.startsWith('data:video') ? (
                                            <video src={ex.gifUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                        ) : (
                                            <img src={ex.gifUrl} alt={ex.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                        )
                                    ) : (
                                        <Dumbbell size={48} color="rgba(255,255,255,0.7)" />
                                    )}
                                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.6rem', borderRadius: '12px', textTransform: 'uppercase' }}>
                                        {ex.tipo}
                                    </span>
                                </div>

                                {/* Informações do Card */}
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: ex.cor || '#059669', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pasta: {ex.grupo}</span>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.2' }}>{ex.titulo}</h3>
                                    
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', flex: 1 }}>
                                        {ex.focoMuscular && <div style={{ marginBottom: '0.25rem' }}>🎯 <strong>Foco:</strong> {ex.focoMuscular}</div>}
                                        <div>
                                            ⚡ <strong>Métrica:</strong>{' '}
                                            {ex.tipo === 'tempo' && `${ex.duracaoMinutos} Minutos`}
                                            {['repeticao', 'carga'].includes(ex.tipo) && `${ex.series} Séries x ${ex.repeticoes} Repetições`}
                                            {ex.tipo === 'isometria' && `${ex.series} Séries x ${ex.duracaoMinutos} Segundos`}
                                            {ex.tipo === 'meta' && ex.meta}
                                        </div>
                                    </div>

                                    {/* Botões de Ação */}
                                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        <button 
                                            onClick={() => { setExercicioEditando(ex); setModalAberto(true); }}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            <Edit2 size={16} /> Editar
                                        </button>
                                        <button 
                                            onClick={() => deletarExercicio(ex.id)}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} /> Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINAÇÃO */}
                    {totalPaginas > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <button 
                                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaAtual === 1}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: paginaAtual === 1 ? '#f8fafc' : 'white', color: paginaAtual === 1 ? '#94a3b8' : '#334155', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>
                                Página {paginaAtual} de {totalPaginas}
                            </span>

                            <button 
                                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                                disabled={paginaAtual === totalPaginas}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: paginaAtual === totalPaginas ? '#f8fafc' : 'white', color: paginaAtual === totalPaginas ? '#94a3b8' : '#334155', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
            {modalAberto && (
                <FormPrescricaoModal 
                    alvo={{ tipo: 'acervo', treinoEditando: exercicioEditando }} 
                    onClose={() => { setModalAberto(false); setExercicioEditando(null); }}
                    onSucesso={carregarAcervo}
                />
            )}
        </div>
    );
}