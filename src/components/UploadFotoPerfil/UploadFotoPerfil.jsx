// src/components/UploadFotoPerfil/UploadFotoPerfil.jsx
import React from 'react';
import { Camera, User } from 'lucide-react';
import { useAlert } from '../AlertContext/AlertContext';

export default function UploadFotoPerfil({ foto, setFoto, tamanho = 120 }) {
    const { showAlert } = useAlert();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showAlert('A imagem deve ter no máximo 2MB para não sobrecarregar o sistema.', 'erro');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFoto(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
                position: 'relative',
                width: `${tamanho}px`,
                height: `${tamanho}px`,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: '3px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                {foto ? (
                    <img src={foto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <User size={tamanho * 0.5} color="#94a3b8" />
                )}
                
                <label style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.4rem 0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}>
                    <Camera size={18} style={{ marginRight: '4px' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Alterar</span>
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />
                </label>
            </div>
            {!foto && <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Opcional: Adicione uma foto</span>}
        </div>
    );
}