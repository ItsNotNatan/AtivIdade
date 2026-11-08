// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../NavBar/Navbar';
import AlertaTelaPequena from '../AlertaTelaPequena/AlertaTelaPequena';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            {/* Monitor de largura para casos extremos */}
            <AlertaTelaPequena />

            {/* 1. Navbar fixa */}
            <Navbar />

            {/* 2. Conteúdo com suporte a rolagem responsiva */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}