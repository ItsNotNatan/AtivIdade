// FILE: src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../NavBar/Navbar';// Alterado de Navbar para Sidebar
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}