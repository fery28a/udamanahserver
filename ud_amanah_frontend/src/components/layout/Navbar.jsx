// ud_amanah_frontend/src/components/layout/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const navStyle = {
    backgroundColor: 'var(--primary-color)', // #0071ce
    padding: '0 30px',
    display: 'flex', 
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Shadow yang lebih kuat
    zIndex: 1000,
};

const logoStyle = {
    color: 'var(--accent-color)', // #ffc220
    fontSize: '1.5em',
    fontWeight: '700',
    padding: '15px 0',
    textDecoration: 'none',
    marginRight: '30px',
};

const linkStyle = {
    color: 'var(--text-light)', // white
    textDecoration: 'none',
    padding: '15px 15px',
    transition: 'background-color 0.3s, color 0.3s',
    display: 'block',
    fontWeight: '600',
};

const Navbar = () => {
    return (
        <nav style={navStyle}>
            {/* Nama Aplikasi */}
            <Link to="/" style={logoStyle}>
                UD.AMANAH
            </Link>
            
            {/* Navigasi Utama */}
            <div style={{ marginLeft: 'auto', display: 'flex' }}>
                <Link to="/" className="nav-link" style={linkStyle}>Dashboard</Link>
                <Link to="/masterdata" className="nav-link" style={linkStyle}>Master Data</Link>
                <Link to="/pendapatan" className="nav-link" style={linkStyle}>Pendapatan</Link>
                <Link to="/tabungan" className="nav-link" style={linkStyle}>Tabungan</Link>
                <Link to="/kaskeluar" className="nav-link" style={linkStyle}>Kas Keluar</Link>
                <Link to="/hutang" className="nav-link" style={linkStyle}>Hutang</Link>
                <Link to="/piutang" className="nav-link" style={linkStyle}>Piutang</Link>
                <Link to="/laporan" className="nav-link" style={linkStyle}>Laporan</Link>
            </div>
        </nav>
    );
};

export default Navbar;