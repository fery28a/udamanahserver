// UD-Amanah-main/ud_amanah_frontend/src/config/api.js

// Logika untuk menentukan Base URL:
// Di lingkungan lokal (localhost), gunakan port 8084.
// Di lingkungan produksi (server), gunakan path relatif /api (yang akan di-proxy oleh Nginx).
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:8084/api' 
    : '/api';

// --- ENDPOINTS UTAMA ---
export const DASHBOARD_URL = `${API_BASE_URL}/dashboard`;
export const MASTER_DATA_URL = `${API_BASE_URL}/masterdata`;
export const PENDAPATAN_URL = `${API_BASE_URL}/pendapatan`;
export const KASKELUAR_URL = `${API_BASE_URL}/kaskeluar`;
export const TABUNGAN_URL = `${API_BASE_URL}/tabungan`;
export const HUTANG_URL = `${API_BASE_URL}/hutang`;
export const PIUTANG_URL = `${API_BASE_URL}/piutang`;
export const LAPORAN_URL = `${API_BASE_URL}/laporan`;

// --- FUNGSI ENDPOINT KHUSUS ---

// Contoh: Mendapatkan URL Master Data spesifik (suppliers, customers, tabungan)
export const getMasterDataUrl = (endpoint) => `${MASTER_DATA_URL}/${endpoint}`;

// Contoh: Mendapatkan URL Dashboard Tabungan
export const getTabunganDashboardUrl = () => `${TABUNGAN_URL}/dashboard`;

// Contoh: Mendapatkan URL Hutang Principal spesifik (untuk PUT atau POST)
export const getHutangPrincipalUrl = (id = '') => `${HUTANG_URL}/principal/${id}`;
export const getHutangPaymentUrl = () => `${HUTANG_URL}/payment`; 

// Contoh: Mendapatkan URL Settle (Lunas) Piutang
export const getPiutangSettleUrl = (id) => `${PIUTANG_URL}/settle/${id}`;

// Contoh: Mendapatkan URL Dashboard Kas Keluar
export const getKasKeluarDashboardUrl = () => `${KASKELUAR_URL}/dashboard`;