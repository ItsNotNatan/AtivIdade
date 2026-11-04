// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../NavBar/Navbar';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            {/* 1. A Navbar fica fixa no topo */}
            <Navbar />

            {/* 2. O conteúdo dinâmico muda aqui dentro */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}