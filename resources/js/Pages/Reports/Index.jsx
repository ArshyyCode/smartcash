import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi modul Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan halaman lain)                  */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.94); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes sc-toast { from { opacity: 0; transform: translateY(-12px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes sc-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .35s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .2s cubic-bezier(.22,1,.36,1) backwards }
.sc-toast { animation: sc-toast .3s cubic-bezier(.22,1,.36,1) backwards }
.sc-fade { animation: sc-fade .2s ease backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1) }
.sc-reveal.sc-in { opacity: 1; transform: none }
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER                                                             */
/* ================================================================== */
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

// format tanggal lokal YYYY-MM-DD (untuk input type="date")
const toInputDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/* Warna grafik mengikuti tema aktif (membaca variabel CSS dari tema) */
const cssRgb = (name, fallback) => {
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v ? v.split(/\s+/).join(', ') : fallback;
    } catch (e) {
        return fallback;
    }
};

/*  Informasi diskon sebuah transaksi.
 *  - nominal diambil dari kolom discount_amount bila ada,
 *  - jika tidak ada, dihitung dari selisih subtotal item dan total bayar,
 *  - nama/jenis diskon dibaca dari relasi `discount` bila dikirim backend.            */
const getDiscountInfo = (trx) => {
    const details = trx.details || [];
    const subtotal = details.reduce((sum, d) => sum + Number(d.qty || 0) * Number(d.unit_price || 0), 0);
    const explicit = Number(trx.discount_amount ?? 0);
    const inferred = Math.max(0, subtotal - Number(trx.total_price || 0));
    const amount = explicit > 0 ? explicit : inferred >= 1 ? inferred : 0;
    const rel = trx.discount || null;
    const name = rel?.name || trx.discount_name || '';
    const label = rel ? (rel.type === 'percentage' ? `${Number(rel.value)}%` : rel.value ? rp(rel.value) : '') : '';
    return { has: amount > 0 || Boolean(rel), amount, subtotal, name, label };
};

const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.08 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`sc-reveal ${shown ? 'sc-in' : ''} ${className}`}>
            {children}
        </div>
    );
};

const CountUp = ({ to = 0, prefix = '', duration = 1100 }) => {
    const ref = useRef(null);
    const [n, setN] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                if (reduce) {
                    setN(to);
                    return;
                }
                const t0 = performance.now();
                const tick = (t) => {
                    const p = Math.min((t - t0) / duration, 1);
                    setN(p < 1 ? Math.round(to * (1 - Math.pow(1 - p, 3))) : to);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.5 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [to, duration]);

    return (
        <span ref={ref}>
            {prefix}
            {Number(n).toLocaleString('id-ID')}
        </span>
    );
};

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconChart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="4" y="3.5" width="16" height="17" rx="3" />
        <path d="M8.5 16.5v-4M12 16.5v-7M15.5 16.5v-2.5" />
    </svg>
);
const IconWallet = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" />
    </svg>
);
const IconReceipt = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9.5 8h5M9.5 12h5" />
    </svg>
);
const IconTrend = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 17 9 11l4 4 8-8" />
        <path d="M15 7h6v6" />
    </svg>
);
const IconCalendar = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);
const IconClose = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconCheck = ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconDownload = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5" />
        <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
);
const IconUndo = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
);
const IconTag = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7a1.5 1.5 0 0 1 1.1.4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.7 7.7a1.5 1.5 0 0 1-2.1 0l-7.3-7.3a1.5 1.5 0 0 1-.5-1Z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
);
const IconInbox = ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.6}>
        <path d="M3 13.5 5.6 5.8A2 2 0 0 1 7.5 4.5h9a2 2 0 0 1 1.9 1.3L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z" />
        <path d="M3 13.5h5l1 2.5h6l1-2.5h5" />
    </svg>
);
const IconChevron = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const inputCls =
    'w-full text-sm rounded-xl border-slate-200 bg-white transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon, children, right }) => (
    <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-slate-900">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">{icon}</span>
            {children}
        </h3>
        {right}
    </div>
);

const StatCard = ({ label, value, sub, icon }) => (
    <div className="group h-full bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-3 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
        <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight truncate">{value}</h3>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sub}</p>}
        </div>
        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
            {icon}
        </div>
    </div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* ================================================================== */
/*  HALAMAN LAPORAN                                                    */
/* ================================================================== */
export default function Index({ auth, transactions = [], totalRevenue = 0, totalTransactions = 0, chartData = [], filters = {} }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // filter & pencarian riwayat (di sisi tampilan)
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState({});

    // notifikasi, dialog konfirmasi, dan status proses
    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setConfirmState(null);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* ---------- filter tanggal ---------- */
    const applyFilter = (start, end) => {
        router.get(route('reports.index'), { start_date: start, end_date: end }, { preserveState: true });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        applyFilter(startDate, endDate);
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('reports.index'));
    };

    // pintasan rentang tanggal
    const applyPreset = (key) => {
        const today = new Date();
        let start = new Date(today);
        if (key === 'week') start.setDate(today.getDate() - 6);
        if (key === 'month30') start.setDate(today.getDate() - 29);
        if (key === 'thisMonth') start = new Date(today.getFullYear(), today.getMonth(), 1);
        const s = toInputDate(start);
        const e = toInputDate(today);
        setStartDate(s);
        setEndDate(e);
        applyFilter(s, e);
    };

    const presets = [
        { key: 'today', label: 'Hari Ini' },
        { key: 'week', label: '7 Hari' },
        { key: 'month30', label: '30 Hari' },
        { key: 'thisMonth', label: 'Bulan Ini' },
    ];

    /* ---------- pembatalan transaksi ---------- */
    const handleCancelTransaction = (trx) => {
        setConfirmState({
            title: 'Batalkan transaksi ini?',
            message: `Transaksi ${trx.invoice_code || `TRX-${trx.id}`} akan dibatalkan dan stok barang dikembalikan ke inventaris.`,
            confirmLabel: 'Ya, batalkan',
            onConfirm: () => {
                setCancellingId(trx.id);
                router.post(
                    route('transactions.cancel', trx.id),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => showToast('success', 'Transaksi berhasil dibatalkan!'),
                        onError: (errors) => showToast('error', errors.message || 'Gagal membatalkan transaksi.'),
                        onFinish: () => setCancellingId(null),
                    }
                );
            },
        });
    };

    const isWithin24Hours = (createdAt) => {
        const trxDate = new Date(createdAt);
        const now = new Date();
        const diffInHours = (now - trxDate) / (1000 * 60 * 60);
        return diffInHours <= 24;
    };

    /* ---------- data turunan ---------- */
    const average = totalTransactions > 0 ? Math.round(Number(totalRevenue) / Number(totalTransactions)) : 0;
    const bestDay = chartData.length > 0 ? chartData.reduce((a, b) => (Number(b.total) > Number(a.total) ? b : a)) : null;
    const cancelledCount = transactions.filter((t) => t.status === 'batal').length;
    const doneCount = transactions.length - cancelledCount;
    const discountedCount = transactions.filter((t) => getDiscountInfo(t).has).length;
    // total diskon yang benar-benar diberikan (transaksi yang dibatalkan tidak dihitung)
    const totalDiscountGiven = transactions
        .filter((t) => t.status !== 'batal')
        .reduce((sum, t) => sum + getDiscountInfo(t).amount, 0);

    const q = search.trim().toLowerCase();
    const shownTransactions = transactions.filter((trx) => {
        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'batal'
                ? trx.status === 'batal'
                : statusFilter === 'diskon'
                ? getDiscountInfo(trx).has
                : trx.status !== 'batal';
        const code = String(trx.invoice_code || `TRX-${trx.id}`).toLowerCase();
        const matchesSearch =
            !q ||
            code.includes(q) ||
            (trx.user?.name || 'Kasir').toLowerCase().includes(q) ||
            (trx.details || []).some((d) => (d.product?.name || '').toLowerCase().includes(q));
        return matchesStatus && matchesSearch;
    });

    /* ---------- unduh CSV ---------- */
    const downloadCsv = () => {
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows = [['Kode', 'Tanggal', 'Kasir', 'Detail Belanjaan', 'Subtotal', 'Diskon', 'Nama Diskon', 'Total Bayar', 'Status']];
        shownTransactions.forEach((trx) => {
            const disc = getDiscountInfo(trx);
            rows.push([
                trx.invoice_code || `TRX-${trx.id}`,
                new Date(trx.created_at).toLocaleString('id-ID'),
                trx.user?.name || 'Kasir',
                (trx.details || []).map((d) => `${d.product?.name || 'Produk'} (${d.qty} x ${d.unit_price || 0})`).join('; '),
                disc.subtotal,
                disc.amount,
                disc.name || (disc.has ? 'Diskon' : ''),
                trx.total_price,
                trx.status === 'batal' ? 'Dibatalkan' : 'Selesai',
            ]);
        });
        const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-smartcash-${toInputDate(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', `${shownTransactions.length} transaksi diunduh sebagai CSV.`);
    };

    /* ---------- konfigurasi Chart.js ---------- */
    const shortRp = (v) => {
        const n = Number(v);
        if (n >= 1000000) return `${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
        if (n >= 1000) return `${(n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
        return n;
    };

    const primaryRgb = cssRgb('--p-600', '37, 99, 235');
    const surfaceRgb = cssRgb('--surface', '255, 255, 255');
    const gridColor = `rgb(${cssRgb('--s-100', '241, 245, 249')})`;
    const tickColor = `rgb(${cssRgb('--s-400', '148, 163, 184')})`;

    const data = {
        labels: chartData.map((item) => item.date),
        datasets: [
            {
                label: 'Omset Harian (Rp)',
                data: chartData.map((item) => item.total),
                borderColor: `rgb(${primaryRgb})`,
                backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: `rgb(${surfaceRgb})`,
                pointBorderColor: `rgb(${primaryRgb})`,
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 10,
                displayColors: false,
                callbacks: {
                    label: (ctx) => ` ${rp(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                border: { display: false },
                ticks: { color: tickColor, font: { size: 11 }, callback: (v) => shortRp(v) },
            },
        },
    };

    const statusTabs = [
        { key: 'all', label: 'Semua', count: transactions.length },
        { key: 'selesai', label: 'Selesai', count: doneCount },
        { key: 'batal', label: 'Dibatalkan', count: cancelledCount },
        { key: 'diskon', label: 'Berdiskon', count: discountedCount },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <IconChart />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Laporan <span className="text-blue-600">&amp; Analisis Penjualan</span>
                    </h2>
                </div>
            }
        >
            <Head title="Laporan & Analisis" />
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[60]">
                    <div
                        key={toast.id}
                        className={`sc-toast flex items-start gap-3 max-w-sm rounded-2xl px-4 py-3 border text-sm font-semibold ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <span
                            className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-white ${
                                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        >
                            {toast.type === 'success' ? <IconCheck /> : <IconClose className="w-3 h-3" />}
                        </span>
                        <span className="leading-snug">{toast.message}</span>
                        <button type="button" onClick={() => setToast(null)} aria-label="Tutup" className="ml-1 opacity-60 hover:opacity-100 transition">
                            <IconClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* ===================== FILTER TANGGAL ===================== */}
                <Reveal>
                    <Panel className="p-5">
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
                            <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-3">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Mulai</label>
                                    <input type="date" className={`${inputCls} py-2.5`} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Selesai</label>
                                    <input type="date" className={`${inputCls} py-2.5`} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Terapkan Filter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition duration-200 active:scale-95"
                                    >
                                        <IconUndo />
                                        Reset
                                    </button>
                                </div>
                            </form>

                            {/* pintasan rentang tanggal */}
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Pintasan</p>
                                <div className="sc-noscroll flex gap-2 overflow-x-auto">
                                    {presets.map((p) => (
                                        <button
                                            key={p.key}
                                            type="button"
                                            onClick={() => applyPreset(p.key)}
                                            className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 transition duration-200 active:scale-95"
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Panel>
                </Reveal>

                {/* ===================== RINGKASAN ===================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Reveal delay={60} className="h-full">
                        <StatCard label="Total Pendapatan (Omset)" value={<CountUp to={Number(totalRevenue)} prefix="Rp " />} icon={<IconWallet />} />
                    </Reveal>
                    <Reveal delay={120} className="h-full">
                        <StatCard
                            label="Transaksi Berhasil"
                            value={
                                <>
                                    <CountUp to={Number(totalTransactions)} />
                                    <span className="text-sm font-semibold text-slate-400 ml-1.5">Transaksi</span>
                                </>
                            }
                            icon={<IconReceipt />}
                        />
                    </Reveal>
                    <Reveal delay={180} className="h-full">
                        <StatCard label="Rata-rata / Transaksi" value={<CountUp to={average} prefix="Rp " />} icon={<IconTrend />} />
                    </Reveal>
                    <Reveal delay={240} className="h-full">
                        <StatCard
                            label="Hari Terbaik"
                            value={bestDay ? rp(bestDay.total) : '-'}
                            sub={bestDay ? bestDay.date : 'Belum ada data'}
                            icon={<IconCalendar />}
                        />
                    </Reveal>
                </div>

                {/* ===================== GRAFIK ===================== */}
                <Reveal delay={80}>
                    <Panel className="p-6 space-y-5">
                        <SectionTitle icon={<IconTrend className="w-4 h-4" />}>Grafik Tren Pendapatan Harian</SectionTitle>
                        {chartData.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-slate-300 inline-block">
                                    <IconChart className="w-10 h-10" />
                                </span>
                                <p className="text-slate-400 text-xs mt-2">Belum ada data grafik untuk periode ini.</p>
                            </div>
                        ) : (
                            <div className="w-full h-[300px]">
                                <Line data={data} options={options} />
                            </div>
                        )}
                    </Panel>
                </Reveal>

                {/* ===================== RIWAYAT TRANSAKSI ===================== */}
                <Reveal delay={80}>
                    <Panel className="overflow-hidden">
                        <div className="p-5 border-b border-slate-100 space-y-4">
                            <SectionTitle
                                icon={<IconReceipt className="w-4 h-4" />}
                                right={
                                    <button
                                        type="button"
                                        onClick={downloadCsv}
                                        disabled={shownTransactions.length === 0}
                                        className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 transition duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <IconDownload />
                                        Unduh CSV
                                    </button>
                                }
                            >
                                Riwayat &amp; Status Transaksi
                            </SectionTitle>

                            {discountedCount > 0 && (
                                <p className="flex items-center gap-2 text-xs text-slate-500 -mt-1">
                                    <span className="text-emerald-600">
                                        <IconTag />
                                    </span>
                                    <span>
                                        <b className="text-slate-700">{discountedCount}</b> transaksi memakai diskon, total potongan{' '}
                                        <b className="text-emerald-700">{rp(totalDiscountGiven)}</b> (tidak termasuk yang dibatalkan).
                                    </span>
                                </p>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="sc-noscroll flex gap-2 overflow-x-auto">
                                    {statusTabs.map((tab) => {
                                        const active = statusFilter === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setStatusFilter(tab.key)}
                                                aria-pressed={active}
                                                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition duration-200 active:scale-95 ${
                                                    active
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                                                }`}
                                            >
                                                {tab.label}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {tab.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="relative w-full md:w-72">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IconSearch />
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari kode, kasir, atau produk..."
                                        className={`${inputCls} text-xs pl-9 pr-9 py-2.5 placeholder:text-slate-400`}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            aria-label="Hapus pencarian"
                                            className="sc-pop absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                                        >
                                            <IconClose className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Kode / Tanggal</th>
                                        <th className="px-5 py-3.5 font-semibold">Kasir</th>
                                        <th className="px-5 py-3.5 font-semibold">Detail Belanjaan</th>
                                        <th className="px-5 py-3.5 font-semibold">Total Bayar</th>
                                        <th className="px-5 py-3.5 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shownTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-14 text-center">
                                                <span className="text-slate-300 inline-block">
                                                    <IconInbox />
                                                </span>
                                                <p className="text-slate-400 text-xs mt-2">
                                                    {transactions.length === 0
                                                        ? 'Belum ada riwayat transaksi penjualan pada periode ini.'
                                                        : 'Tidak ada transaksi yang cocok dengan filter atau pencarian.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        shownTransactions.map((trx, i) => {
                                            const canCancel = trx.status !== 'batal' && isWithin24Hours(trx.created_at);
                                            const details = trx.details || [];
                                            const isOpen = !!expanded[trx.id];
                                            const visibleDetails = isOpen ? details : details.slice(0, 2);
                                            const hidden = details.length - 2;
                                            const disc = getDiscountInfo(trx);

                                            return (
                                                <tr
                                                    key={trx.id}
                                                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                    className="sc-rowin border-t border-slate-100 align-top transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-blue-600">{trx.invoice_code || `TRX-${trx.id}`}</p>
                                                        {disc.has && (
                                                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                                <IconTag className="w-3 h-3" />
                                                                DISKON
                                                            </span>
                                                        )}
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                                            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                                                                {(trx.user?.name || 'K').charAt(0).toUpperCase()}
                                                            </span>
                                                            {trx.user?.name || 'Kasir'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ul className="text-xs space-y-1.5">
                                                            {visibleDetails.map((detail) => (
                                                                <li key={detail.id} className="flex items-start gap-2 text-slate-600">
                                                                    <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-blue-400" />
                                                                    <span>
                                                                        {detail.product?.name || 'Produk'}{' '}
                                                                        <span className="text-slate-400">
                                                                            ({detail.qty} x {rp(detail.unit_price)})
                                                                        </span>
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {disc.has && (
                                                            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[11px] space-y-1 max-w-[260px]">
                                                                <div className="flex justify-between gap-4 text-slate-500">
                                                                    <span>Subtotal</span>
                                                                    <span className="font-semibold text-slate-700">{rp(disc.subtotal)}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4 text-emerald-700 font-semibold">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <IconTag className="w-3 h-3" />
                                                                        {disc.name || 'Diskon'}
                                                                        {disc.label && ` (${disc.label})`}
                                                                    </span>
                                                                    <span>- {rp(disc.amount)}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {details.length > 2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpanded((prev) => ({ ...prev, [trx.id]: !prev[trx.id] }))}
                                                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                                                            >
                                                                {isOpen ? 'Sembunyikan' : `Lihat ${hidden} lainnya`}
                                                                <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                                    <IconChevron />
                                                                </span>
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {disc.has && disc.subtotal > Number(trx.total_price) && (
                                                            <span className="block text-[11px] text-slate-400 line-through">{rp(disc.subtotal)}</span>
                                                        )}
                                                        <span className="font-bold text-slate-800">{rp(trx.total_price)}</span>
                                                        {disc.has && disc.amount > 0 && (
                                                            <span className="block text-[10px] font-bold text-emerald-600 mt-0.5">Hemat {rp(disc.amount)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                                                                trx.status === 'batal' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                                            }`}
                                                        >
                                                            {trx.status === 'batal' ? 'Dibatalkan' : 'Selesai'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        {canCancel ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancelTransaction(trx)}
                                                                disabled={cancellingId === trx.id}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                                            >
                                                                {cancellingId === trx.id && <Spinner />}
                                                                Batalkan
                                                            </button>
                                                        ) : trx.status === 'batal' ? (
                                                            <span className="text-xs text-slate-400 italic">Dibatalkan</span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium" title="Pembatalan hanya bisa dalam 24 jam">
                                                                Kedaluwarsa
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </Reveal>
            </div>

            {/* ================= DIALOG KONFIRMASI ================= */}
            {confirmState && (
                <div onClick={() => setConfirmState(null)} className="sc-fade fixed inset-0 z-[70] bg-slate-900/50 flex justify-center items-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                        <span className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <IconUndo className="w-5 h-5" />
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-4">{confirmState.title}</h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{confirmState.message}</p>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setConfirmState(null)}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmState.onConfirm();
                                    setConfirmState(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}