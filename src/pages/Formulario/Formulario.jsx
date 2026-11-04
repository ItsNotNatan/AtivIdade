// src/pages/Formulario/Formulario.jsx
import React, { useState } from 'react';
import {
    FilePlus,
    Send,
    LayoutTemplate,
    UploadCloud,
    ListChecks,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';
import './Formulario.css';

export default function Formulario() {
    const [carregandoPdf, setCarregandoPdf] = useState(false);

    // Estado centralizado para guardar todas as informações do formulário
    const [dados, setDados] = useState({
        tipoSolicitacao: 'transmissao', // Começa por defeito como Transmissão
        remetente: '',
        destinatario: '',
        objeto: '',
        numeroTransmissao: '',
        projeto: '',
        contatoTecnico: '',
        dataSolicitacao: '',
        dataData: '',
        linkSyncplicity: '',
        itensConstrutivos: []
    });

    // Atualiza os campos de texto gerais do formulário
    const lidarComMudanca = (e) => {
        const { name, value } = e.target;
        setDados(prev => ({ ...prev, [name]: value }));
    };

    // Atualiza um campo específico dentro de um item da tabela
    const lidarMudancaItem = (index, campo, valor) => {
        const novosItens = [...dados.itensConstrutivos];
        novosItens[index][campo] = valor;
        setDados(prev => ({ ...prev, itensConstrutivos: novosItens }));
    };

    // Simula a receção dos dados do Backend após o upload do PDF
    const handleUploadPDF = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCarregandoPdf(true);

        // Imagem SVG verde embutida diretamente no código (não falha nem precisa de internet)
        const imgPlaceholder = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%2322c55e' rx='6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='white' font-weight='bold' text-anchor='middle' alignment-baseline='middle' font-family='sans-serif'%3ECAD%3C/text%3E%3C/svg%3E";

        setTimeout(() => {
            setDados(prev => ({
                ...prev,
                remetente: 'Sidney',
                destinatario: 'Cesar Marcantonio',
                objeto: 'UBII',
                numeroTransmissao: 'BB37-VW-ANCH-STW-UB2-0143-2025',
                projeto: 'BRBCBBB37',
                contatoTecnico: 'bruno.soares@comau.com',
                dataSolicitacao: '2026-03-27',
                dataData: '2026-03-28',
                linkSyncplicity: 'https://comau.syncplicity.com/Files/Default.aspx#home/1/9021399/COMPRAS/BWA/-%20VOLKSWAGEM/BRBCBBB37%20-%20VW%20ANCHIETA%20STW%20UB2/Transmiss%C3%B5es/BB37-VW-ANCH-STW-UB2-0143-2025',
                itensConstrutivos: [
                    { id: 1, urlImagem: imgPlaceholder, descricao: 'CONSOLE P/ PINÇA DE SOLDA ST2220', codigo: '51-38N_578227', qtd: '01DX+01EX' },
                    { id: 2, urlImagem: imgPlaceholder, descricao: 'CONSOLE P/PINO TUCKER ST2790', codigo: '51-38N_578229', qtd: '01' },
                    { id: 3, urlImagem: imgPlaceholder, descricao: 'CONSOLE P/ PINO TUCKER ST2790', codigo: '51-38N_578231', qtd: '01' },
                    { id: 4, urlImagem: imgPlaceholder, descricao: 'CONSOLE P/PINO TUCKER ST2790', codigo: '51-38N_578233', qtd: '01' },
                    { id: 5, urlImagem: imgPlaceholder, descricao: 'CONSOLE P/PINO TUCKER ST2790', codigo: '51-38N_578235', qtd: '01' },
                    { id: 6, urlImagem: '', descricao: 'CONSOLE P/ PINO TUCKER ST2790', codigo: '51-38N_578237', qtd: '01' }
                ]
            }));
            setCarregandoPdf(false);
        }, 1500);
    };

    // Função para submeter o formulário
    const lidarComEnvio = (e) => {
        e.preventDefault();
        alert(`Solicitação de ${dados.tipoSolicitacao === 'transmissao' ? 'Transmissão' : 'Eventual'} criada com sucesso!`);
        console.log("Dados a enviar para o Backend:", dados);
    };

    return (
        <div className="formulario-container">
            <div className="formulario-header">
                {/* O título muda dinamicamente com base na seleção */}
                <h2 className="formulario-title">
                    <FilePlus size={28} color="#2563eb" />
                    Nova Solicitação: {dados.tipoSolicitacao === 'transmissao' ? 'Transmissão' : 'Eventual'}
                </h2>
                <p>Faça o upload do documento PDF para auto-preencher os dados de construção e engenharia.</p>
            </div>

            <form onSubmit={lidarComEnvio} className="formulario-card">

                {/* SECÇÃO: TIPO DE SOLICITAÇÃO */}
                <div className="form-section">
                    <h3 className="section-title">1. Tipo de Solicitação</h3>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', padding: '0.5rem 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '500', color: '#374151' }}>
                            <input
                                type="radio"
                                name="tipoSolicitacao"
                                value="transmissao"
                                checked={dados.tipoSolicitacao === 'transmissao'}
                                onChange={lidarComMudanca}
                                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                            />
                            Transmissão de Desenhos
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '500', color: '#374151' }}>
                            <input
                                type="radio"
                                name="tipoSolicitacao"
                                value="eventual"
                                checked={dados.tipoSolicitacao === 'eventual'}
                                onChange={lidarComMudanca}
                                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                            />
                            Eventual
                        </label>
                    </div>
                </div>

                <hr className="divider" />

                {/* SECÇÃO: UPLOAD DO PDF */}
                <div className="form-section upload-section">
                    <div className="upload-box">
                        <UploadCloud size={40} color="#6b7280" />
                        <p>Clique ou arraste a Transmissão de Desenhos (PDF) aqui</p>
                        <input type="file" accept=".pdf" onChange={handleUploadPDF} className="file-input" />
                        {carregandoPdf && <p className="loading-text">A extrair imagens e dados do PDF...</p>}
                    </div>
                </div>

                <hr className="divider" />

                {/* SECÇÃO: CABEÇALHO DO DOCUMENTO */}
                <div className="form-section">
                    <h3 className="section-title"><LayoutTemplate size={20} /> Informações do Cabeçalho</h3>
                    <div className="formulario-grid">
                        <div className="form-group">
                            <label>Projeto</label>
                            <input type="text" name="projeto" value={dados.projeto} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>Transmissão n.º</label>
                            <input type="text" name="numeroTransmissao" value={dados.numeroTransmissao} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>Objeto</label>
                            <input type="text" name="objeto" value={dados.objeto} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>DE: (Remetente)</label>
                            <input type="text" name="remetente" value={dados.remetente} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>Para: (Destinatário)</label>
                            <input type="text" name="destinatario" value={dados.destinatario} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>Contacto Técnico</label>
                            <input type="email" name="contatoTecnico" value={dados.contatoTecnico} onChange={lidarComMudanca} placeholder="Extraído do PDF" />
                        </div>
                        <div className="form-group">
                            <label>Data de Solicitação</label>
                            <input type="date" name="dataSolicitacao" value={dados.dataSolicitacao} onChange={lidarComMudanca} />
                        </div>
                        <div className="form-group">
                            <label>Data (Emissão)</label>
                            <input type="date" name="dataData" value={dados.dataData} onChange={lidarComMudanca} />
                        </div>

                        {/* SECÇÃO: Link Syncplicity */}
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Documentação de Referência (Syncplicity)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="url"
                                    name="linkSyncplicity"
                                    value={dados.linkSyncplicity}
                                    onChange={lidarComMudanca}
                                    placeholder="Link extraído do PDF"
                                    style={{ flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }}
                                />
                                {dados.linkSyncplicity && (
                                    <a
                                        href={dados.linkSyncplicity}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '0 1rem', backgroundColor: '#e5e7eb',
                                            color: '#374151', textDecoration: 'none',
                                            borderRadius: '0.5rem', fontWeight: 'bold'
                                        }}
                                    >
                                        <ExternalLink size={18} /> Abrir Link
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                {/* SECÇÃO: TABELA DE ITENS */}
                <div className="form-section">
                    <h3 className="section-title"><ListChecks size={20} /> Itens para Construção (Extraídos do PDF)</h3>

                    {dados.itensConstrutivos.length === 0 ? (
                        <p className="empty-message">Nenhum item carregado. Faça o upload do PDF para visualizar a tabela.</p>
                    ) : (
                        <div className="table-container">
                            <table className="itens-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>ITEM</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>IMAGEM</th>
                                        <th>DESCRIÇÃO</th>
                                        <th>CÓDIGO</th>
                                        <th style={{ width: '100px' }}>QTD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.itensConstrutivos.map((item, index) => (
                                        <tr key={item.id}>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#6b7280' }}>
                                                {item.id}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {item.urlImagem ? (
                                                    <img
                                                        src={item.urlImagem}
                                                        alt={`Item ${item.id}`}
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn-table-img"
                                                        title="A imagem não foi encontrada. Clique para fazer upload manual."
                                                    >
                                                        <ImageIcon size={20} />
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.descricao}
                                                    onChange={(e) => lidarMudancaItem(index, 'descricao', e.target.value)}
                                                    className="table-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.codigo}
                                                    onChange={(e) => lidarMudancaItem(index, 'codigo', e.target.value)}
                                                    className="table-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.qtd}
                                                    onChange={(e) => lidarMudancaItem(index, 'qtd', e.target.value)}
                                                    className="table-input"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <hr className="divider" />

                <div className="form-actions">
                    <button type="submit" className="btn-enviar">
                        <Send size={18} /> Validar e Enviar Solicitação
                    </button>
                </div>
            </form>
        </div>
    );
}