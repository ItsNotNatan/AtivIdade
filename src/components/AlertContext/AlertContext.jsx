// src/components/AlertContext/AlertContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import './AlertContext.css';

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [toast, setToast] = useState({ show: false, message: '', type: 'sucesso' });
    const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null, onCancel: null });

    // Toast de sucesso/erro (some sozinho)
    const showAlert = (message, type = 'sucesso') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    // Modal de Confirmação (Substituto do window.confirm que usa Promises!)
    const showConfirm = (message) => {
        return new Promise((resolve) => {
            setConfirm({
                show: true,
                message,
                onConfirm: () => {
                    setConfirm(prev => ({ ...prev, show: false }));
                    resolve(true); // Retorna true se clicou Confirmar
                },
                onCancel: () => {
                    setConfirm(prev => ({ ...prev, show: false }));
                    resolve(false); // Retorna false se clicou Cancelar
                }
            });
        });
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* TOAST (Ex: "Guardado com Sucesso") */}
            {toast.show && (
                <div className={`custom-toast toast-${toast.type} fade-in-down`}>
                    {toast.type === 'sucesso' && <CheckCircle size={24} />}
                    {toast.type === 'erro' && <AlertCircle size={24} />}
                    {toast.type === 'info' && <Info size={24} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="toast-close">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO (Ex: "Tem certeza que deseja apagar?") */}
            {confirm.show && (
                <div className="custom-confirm-overlay fade-in">
                    <div className="custom-confirm-box scale-in">
                        <div className="custom-confirm-header">
                            <AlertTriangle size={32} color="#ef4444" />
                            <h3>Atenção Necessária</h3>
                        </div>
                        <p>{confirm.message}</p>
                        <div className="custom-confirm-actions">
                            <button className="btn-confirm-cancel" onClick={confirm.onCancel}>Cancelar</button>
                            <button className="btn-confirm-ok" onClick={confirm.onConfirm}>Sim, Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
}

export const useAlert = () => useContext(AlertContext);