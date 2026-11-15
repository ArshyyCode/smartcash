import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
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
/*  Laporan & Analisis Penjualan                                       */
/*  Letakkan di: resources/js/Pages/Reports/Index.jsx                  */
/*  Membutuhkan: Components/DialogShell.jsx dan Components/Toast.jsx   */
/* ================================================================== */

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan halaman lain)                  */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.96); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .3s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .2s cubic-bezier(.22,1,.36,1) backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop { animation: none !important }
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

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

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
    'w-full min-h-[44px] text-base sm:text-sm rounded-xl bg-white placeholder:text-slate-400 transition duration-150 focus:ring-4';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';

const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-blue-700 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600';
const btnSecondary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold transition-colors duration-150 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed';
const textBtn =
    'inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-blue-600 transition-colors duration-150 hover:text-blue-800 active:opacity-70';
const dangerBtn =
    'inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-bold transition-colors duration-150 hover:bg-red-600 hover:border-red-600 hover:text-white active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed';
const chipCls = (active) =>
    `shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors duration-150 ${
        active
            ? 'bg-blue-600 border-blue-600 text-white active:brightness-90'
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50'
    }`;

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Ringkasan: satu panel, kolom dipisah garis tipis (lebih ringan daripada empat kartu) */
const SummaryStrip = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
        {items.map((it) => (
            <div key={it.label} className="flex items-center gap-3.5 bg-white p-4 sm:p-5">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">{it.icon}</span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-600">{it.label}</p>
                    <p className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight break-words">{it.value}</p>
                    {it.sub && <p className="text-xs text-slate-600 mt-0.5">{it.sub}</p>}
                </div>
            </div>
        ))}
    </div>
);

const StatusBadge = ({ cancelled }) => (
    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${cancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {cancelled ? 'Dibatalkan' : 'Selesai'}
    </span>
);

const DiscountBadge = () => (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
        <IconTag className="w-3 h-3" />
        Diskon
    </span>
);

/* Rincian belanja satu transaksi (dipakai di tabel dan kartu) */
const TrxDetails = ({ trx, disc, open, onToggle }) => {
    const details = trx.details || [];
    const visible = open ? details : details.slice(0, 2);
    const hiddenCount = details.length - 2;
    return (
        <div>
            <ul className="text-sm space-y-1.5">
                {visible.map((detail) => (
                    <li key={detail.id} className="flex items-start gap-2 text-slate-700">
                        <span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                        <span>
                            {detail.product?.name || 'Produk'}{' '}
                            <span className="text-slate-600">
                                ({detail.qty} x {rp(detail.unit_price)})
                            </span>
                        </span>
                    </li>
                ))}
            </ul>

            {disc.has && (
                <dl className="mt-3 border-t border-dashed border-slate-300 pt-2 text-sm max-w-[280px] space-y-1">
                    <div className="flex justify-between gap-4 text-slate-600">
                        <dt>Subtotal</dt>
                        <dd className="font-semibold text-slate-700">{rp(disc.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 text-emerald-700 font-semibold">
                        <dt>
                            {disc.name || 'Diskon'}
                            {disc.label && ` (${disc.label})`}
                        </dt>
                        <dd>- {rp(disc.amount)}</dd>
                    </div>
                </dl>
            )}

            {details.length > 2 && (
                <button type="button" onClick={onToggle} aria-expanded={open} className={`${textBtn} mt-1`}>
                    {open ? 'Sembunyikan' : `Lihat ${hiddenCount} lainnya`}
                    <span className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
                        <IconChevron />
                    </span>
                </button>
            )}
        </div>
    );
};

/* Memantau perubahan tema aplikasi agar warna grafik ikut berganti */
function useThemeTick() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const mo = new MutationObserver(() => setTick((t) => t + 1));
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => mo.disconnect();
    }, []);
    return tick;
}

/* ================================================================== */
/*  HALAMAN LAPORAN                                                    */
/* ================================================================== */
const PRESETS = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'week', label: '7 Hari' },
    { key: 'month30', label: '30 Hari' },
    { key: 'thisMonth', label: 'Bulan Ini' },
];

// rentang tanggal untuk setiap pintasan: [mulai, selesai]
const presetRange = (key) => {
    const today = new Date();
    let start = new Date(today);
    if (key === 'week') start.setDate(today.getDate() - 6);
    if (key === 'month30') start.setDate(today.getDate() - 29);
    if (key === 'thisMonth') start = new Date(today.getFullYear(), today.getMonth(), 1);
    return [toInputDate(start), toInputDate(today)];
};

const fmtDay = (v) => {
    if (!v) return '';
    const [y, m, d] = String(v).slice(0, 10).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

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

    const themeTick = useThemeTick(); // eslint-disable-line no-unused-vars

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

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
        const [s, e] = presetRange(key);
        setStartDate(s);
        setEndDate(e);
        applyFilter(s, e);
    };

    const isPresetActive = (key) => {
        const [s, e] = presetRange(key);
        return filters.start_date === s && filters.end_date === e;
    };

    const periodText =
        filters.start_date && filters.end_date
            ? filters.start_date === filters.end_date
                ? fmtDay(filters.start_date)
                : `${fmtDay(filters.start_date)} - ${fmtDay(filters.end_date)}`
            : filters.start_date
            ? `Mulai ${fmtDay(filters.start_date)}`
            : filters.end_date
            ? `Sampai ${fmtDay(filters.end_date)}`
            : 'Semua periode';

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
    const filtersActive = Boolean(q) || statusFilter !== 'all';

    const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lineRgb = cssRgb('--p-500', '79, 99, 224');
    const surfaceRgb = cssRgb('--surface', '255, 255, 255');
    const gridColor = `rgb(${cssRgb('--s-200', '211, 223, 243')})`;
    const tickColor = `rgb(${cssRgb('--s-500', '79, 94, 130')})`;

    const data = {
        labels: chartData.map((item) => item.date),
        datasets: [
            {
                label: 'Omset Harian (Rp)',
                data: chartData.map((item) => item.total),
                borderColor: `rgb(${lineRgb})`,
                backgroundColor: `rgba(${lineRgb}, 0.12)`,
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: `rgb(${surfaceRgb})`,
                pointBorderColor: `rgb(${lineRgb})`,
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduceMotion ? false : { duration: 500 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 10,
                cornerRadius: 10,
                displayColors: false,
                titleFont: { size: 12 },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (ctx) => ` ${rp(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 }, maxRotation: 0, autoSkip: true } },
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                border: { display: false },
                ticks: { color: tickColor, font: { size: 12 }, callback: (v) => shortRp(v) },
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
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
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

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* ===================== FILTER TANGGAL ===================== */}
                <Panel className="p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:items-end">
                            <div>
                                <label htmlFor="rep-start" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tanggal mulai
                                </label>
                                <input id="rep-start" type="date" className={`${inputCls} ${okBorder}`} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="rep-end" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tanggal selesai
                                </label>
                                <input id="rep-end" type="date" className={`${inputCls} ${okBorder}`} value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className={`${btnPrimary} flex-1 sm:flex-none`}>
                                    Terapkan
                                </button>
                                <button type="button" onClick={handleReset} className={`${btnSecondary} flex-1 sm:flex-none`}>
                                    <IconUndo />
                                    Reset
                                </button>
                            </div>
                        </form>

                        {/* pintasan rentang tanggal */}
                        <div>
                            <p id="rep-preset-label" className="text-sm font-semibold text-slate-700 mb-1.5">
                                Pintasan
                            </p>
                            <div role="group" aria-labelledby="rep-preset-label" className="sc-noscroll flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                                {PRESETS.map((p) => (
                                    <button key={p.key} type="button" onClick={() => applyPreset(p.key)} aria-pressed={isPresetActive(p.key)} className={chipCls(isPresetActive(p.key))}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600" role="status">
                        Periode laporan: <b className="text-slate-800">{periodText}</b>
                    </p>
                </Panel>

                {/* ===================== RINGKASAN ===================== */}
                <SummaryStrip
                    items={[
                        { icon: <IconWallet />, label: 'Total pendapatan (omset)', value: rp(totalRevenue) },
                        { icon: <IconReceipt />, label: 'Transaksi berhasil', value: `${Number(totalTransactions).toLocaleString('id-ID')} transaksi` },
                        { icon: <IconTrend />, label: 'Rata-rata per transaksi', value: rp(average) },
                        { icon: <IconCalendar />, label: 'Hari terbaik', value: bestDay ? rp(bestDay.total) : '-', sub: bestDay ? bestDay.date : 'Belum ada data' },
                    ]}
                />

                {/* ===================== GRAFIK ===================== */}
                <Panel className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-900 text-base">Tren Pendapatan Harian</h3>
                        {chartData.length > 0 && <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{chartData.length} hari</span>}
                    </div>

                    {chartData.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-slate-400 inline-block">
                                <IconChart className="w-10 h-10" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">Belum ada data grafik</p>
                            <p className="text-sm text-slate-600 mt-1">Ubah rentang tanggal untuk periode lain.</p>
                        </div>
                    ) : (
                        <>
                            <div
                                role="img"
                                aria-label={`Grafik garis omset harian selama ${chartData.length} hari. Hari terbaik ${bestDay.date} sebesar ${rp(bestDay.total)}. Data lengkap tersedia pada tabel di bawah grafik.`}
                                className="mt-4 w-full h-[240px] sm:h-[300px]"
                            >
                                <Line data={data} options={options} />
                            </div>

                            <details className="group mt-3">
                                <summary className={`${textBtn} list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden`}>
                                    Lihat data dalam tabel
                                    <span className="transition-transform duration-150 group-open:rotate-180">
                                        <IconChevron />
                                    </span>
                                </summary>
                                <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <caption className="sr-only">Omset per hari</caption>
                                        <thead className="sticky top-0 bg-slate-50 text-slate-600 text-xs">
                                            <tr>
                                                <th scope="col" className="px-4 py-2.5 font-semibold">Tanggal</th>
                                                <th scope="col" className="px-4 py-2.5 font-semibold text-right">Omset</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.map((item) => (
                                                <tr key={item.date} className="border-t border-slate-100">
                                                    <td className="px-4 py-2 text-slate-700">{item.date}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-slate-800">{rp(item.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        </>
                    )}
                </Panel>

                {/* ===================== RIWAYAT TRANSAKSI ===================== */}
                <Panel className="overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-slate-900 text-base">Riwayat &amp; Status Transaksi</h3>
                                <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                    {filtersActive ? `${shownTransactions.length} dari ${transactions.length}` : transactions.length}
                                </span>
                            </div>
                            <button type="button" onClick={downloadCsv} disabled={shownTransactions.length === 0} className={btnSecondary}>
                                <IconDownload />
                                Unduh CSV
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            {discountedCount > 0 && (
                                <>
                                    <b className="text-slate-800">{discountedCount}</b> transaksi memakai diskon, total potongan{' '}
                                    <b className="text-emerald-700">{rp(totalDiscountGiven)}</b> (tidak termasuk yang dibatalkan).{' '}
                                </>
                            )}
                            Transaksi hanya bisa dibatalkan dalam 24 jam.
                        </p>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div role="group" aria-label="Filter status transaksi" className="sc-noscroll flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                                {statusTabs.map((tab) => {
                                    const active = statusFilter === tab.key;
                                    return (
                                        <button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)} aria-pressed={active} className={chipCls(active)}>
                                            {tab.label}
                                            <span className={`text-xs font-bold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="relative w-full lg:w-72">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <IconSearch />
                                </span>
                                <input
                                    type="text"
                                    inputMode="search"
                                    autoComplete="off"
                                    aria-label="Cari transaksi berdasarkan kode, kasir, atau produk"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kode, kasir, atau produk..."
                                    className={`${inputCls} pl-10 pr-12 ${okBorder}`}
                                />
                                {search && (
                                    <span className="absolute right-1 top-1/2 -translate-y-1/2">
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            aria-label="Hapus pencarian"
                                            className="sc-pop w-10 h-10 rounded-xl text-slate-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200 flex items-center justify-center transition-colors duration-150"
                                        >
                                            <IconClose />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {shownTransactions.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <IconInbox />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">
                                {transactions.length === 0 ? 'Belum ada riwayat transaksi' : 'Transaksi tidak ditemukan'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {transactions.length === 0 ? 'Belum ada penjualan pada periode ini.' : 'Coba ubah filter atau kata kunci.'}
                            </p>
                            {filtersActive && (
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }}
                                        className={btnSecondary}
                                    >
                                        Reset filter
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Tabel (layar lebar) */}
                            <div className="hidden xl:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Riwayat transaksi penjualan beserta status dan aksi</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Kode / tanggal</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Kasir</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Detail belanja</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Total bayar</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shownTransactions.map((trx, i) => {
                                            const canCancel = trx.status !== 'batal' && isWithin24Hours(trx.created_at);
                                            const disc = getDiscountInfo(trx);
                                            return (
                                                <tr
                                                    key={trx.id}
                                                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                    className="sc-rowin border-t border-slate-100 align-top transition-colors duration-150 hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-blue-600">{trx.invoice_code || `TRX-${trx.id}`}</p>
                                                        {disc.has && (
                                                            <div className="mt-1">
                                                                <DiscountBadge />
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-slate-600 mt-1">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                                            <span aria-hidden="true" className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                                                {(trx.user?.name || 'K').charAt(0).toUpperCase()}
                                                            </span>
                                                            {trx.user?.name || 'Kasir'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <TrxDetails trx={trx} disc={disc} open={!!expanded[trx.id]} onToggle={() => toggleExpanded(trx.id)} />
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className="font-bold text-slate-800">{rp(trx.total_price)}</span>
                                                        {disc.has && disc.amount > 0 && <span className="block text-xs font-semibold text-emerald-700 mt-0.5">Hemat {rp(disc.amount)}</span>}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <StatusBadge cancelled={trx.status === 'batal'} />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {canCancel ? (
                                                            <button type="button" onClick={() => handleCancelTransaction(trx)} disabled={cancellingId === trx.id} className={dangerBtn}>
                                                                {cancellingId === trx.id && <Spinner />}
                                                                Batalkan
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-slate-600">{trx.status === 'batal' ? 'Dibatalkan' : 'Lewat 24 jam'}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP & tablet): enam kolom terlalu sempit di layar kecil */}
                            <ul role="list" className="xl:hidden divide-y divide-slate-100">
                                {shownTransactions.map((trx, i) => {
                                    const canCancel = trx.status !== 'batal' && isWithin24Hours(trx.created_at);
                                    const disc = getDiscountInfo(trx);
                                    return (
                                        <li key={trx.id} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }} className="sc-rowin px-4 py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-blue-600 break-all">{trx.invoice_code || `TRX-${trx.id}`}</p>
                                                    <p className="text-xs text-slate-600 mt-0.5">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <StatusBadge cancelled={trx.status === 'batal'} />
                                                    {disc.has && <DiscountBadge />}
                                                </div>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-700 mt-2">Kasir: {trx.user?.name || 'Kasir'}</p>

                                            <div className="mt-2">
                                                <TrxDetails trx={trx} disc={disc} open={!!expanded[trx.id]} onToggle={() => toggleExpanded(trx.id)} />
                                            </div>

                                            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
                                                <div>
                                                    <p className="text-xs text-slate-600">Total bayar</p>
                                                    <p className="font-bold text-slate-900">{rp(trx.total_price)}</p>
                                                    {disc.has && disc.amount > 0 && <p className="text-xs font-semibold text-emerald-700">Hemat {rp(disc.amount)}</p>}
                                                </div>
                                                {canCancel ? (
                                                    <button type="button" onClick={() => handleCancelTransaction(trx)} disabled={cancellingId === trx.id} className={dangerBtn}>
                                                        {cancellingId === trx.id && <Spinner />}
                                                        Batalkan
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-slate-600">{trx.status === 'batal' ? 'Dibatalkan' : 'Lewat 24 jam'}</span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= DIALOG KONFIRMASI ================= */}
            {confirmState && (
                <DialogShell
                    onClose={() => setConfirmState(null)}
                    role="alertdialog"
                    labelledBy="judul-konfirmasi"
                    describedBy="isi-konfirmasi"
                    size="sm"
                    z="z-[70]"
                    initialFocus="cancel"
                >
                    <div className="p-6 text-center">
                        <span className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center" aria-hidden="true">
                            <IconUndo className="w-5 h-5" />
                        </span>
                        <h3 id="judul-konfirmasi" className="text-base font-bold text-slate-900 mt-4">
                            {confirmState.title}
                        </h3>
                        <p id="isi-konfirmasi" className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {confirmState.message}
                        </p>
                        <div className="flex gap-2 mt-6 pb-[env(safe-area-inset-bottom)]">
                            <button type="button" data-dialog-cancel onClick={() => setConfirmState(null)} className={`${btnSecondary} flex-1`}>
                                Kembali
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmState.onConfirm();
                                    setConfirmState(null);
                                }}
                                className="inline-flex flex-1 items-center justify-center min-h-[44px] rounded-xl bg-red-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-red-700 active:brightness-90"
                            >
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </DialogShell>
            )}
        </AuthenticatedLayout>
    );
}