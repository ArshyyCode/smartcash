import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

/* ================================================================== */
/*  CSS (animasi dibuat ringan)                                        */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.7); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .4s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .25s cubic-bezier(.22,1,.36,1) backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1) }
.sc-reveal.sc-in { opacity: 1; transform: none }
@media (prefers-reduced-motion: reduce) {
    .sc-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
    .sc-rowin, .sc-pop { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER                                                             */
/* ================================================================== */
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

// banner bisa berupa link (https://...) atau path file unggahan di storage (banners/xxx.jpg)
const resolveBanner = (banner) => {
    if (!banner) return '';
    const b = String(banner);
    if (/^(https?:)?\/\//i.test(b) || b.startsWith('/') || b.startsWith('data:')) return b;
    return `/storage/${b.replace(/^\/+/, '')}`;
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

const IconStore = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M4 9.5 5.5 4h13L20 9.5" />
        <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
        <path d="M5 12.5V20h14v-7.5" />
        <path d="M10 20v-4.5h4V20" />
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
const IconBox = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
);
const IconTrend = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 17 9 11l4 4 8-8" />
        <path d="M15 7h6v6" />
    </svg>
);
const IconCart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 4h2.2l2.2 11h10.2l2-8H6.2" />
        <circle cx="9" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
);
const IconDownload = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 3v10m0 0-3.5-3.5M12 13l3.5-3.5" />
        <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4h-5l-1 2h-4l-1-2H4Z" />
    </svg>
);
const IconTag = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7a1.5 1.5 0 0 1 1.1.4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.7 7.7a1.5 1.5 0 0 1-2.1 0l-7.3-7.3a1.5 1.5 0 0 1-.5-1Z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
);
const IconChart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="4" y="3.5" width="16" height="17" rx="3" />
        <path d="M8.5 16.5v-4M12 16.5v-7M15.5 16.5v-2.5" />
    </svg>
);
const IconUsers = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.3c1.8.8 3 2.6 3 5.2" />
    </svg>
);
const IconList = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="5" y="4" width="14" height="17" rx="2.5" />
        <path d="M9 4.5V3h6v1.5M9 11h6M9 15h4" />
    </svg>
);
const IconAlert = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 3.5 2.8 19.5a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3.5Z" />
        <path d="M12 10v4.5M12 17.5v.1" />
    </svg>
);
const IconCopy = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="9" y="9" width="11" height="11" rx="2.5" />
        <path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" />
    </svg>
);
const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);
const IconArrow = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);
const IconInbox = ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.6}>
        <path d="M3 13.5 5.6 5.8A2 2 0 0 1 7.5 4.5h9a2 2 0 0 1 1.9 1.3L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z" />
        <path d="M3 13.5h5l1 2.5h6l1-2.5h5" />
    </svg>
);
const IconShield = ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.6}>
        <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
);
const IconClock = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon, children, right }) => (
    <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-slate-900">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">{icon}</span>
            {children}
        </h3>
        {right}
    </div>
);

const StatCard = ({ label, value, unit, icon }) => (
    <div className="group h-full bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-3 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
        <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight truncate">
                {value}
                {unit && <span className="text-sm font-semibold text-slate-400 ml-1.5">{unit}</span>}
            </h3>
        </div>
        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
            {icon}
        </div>
    </div>
);

const QuickAction = ({ href, icon, label, hint }) => (
    <Link
        href={href}
        className="group flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-4 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70 active:scale-[.98]"
    >
        <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
            {icon}
        </span>
        <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-slate-800 truncate">{label}</span>
            <span className="block text-[11px] text-slate-400 truncate">{hint}</span>
        </span>
        <span className="text-slate-300 transition duration-200 group-hover:text-blue-600 group-hover:translate-x-0.5">
            <IconArrow className="w-4 h-4" />
        </span>
    </Link>
);

/* Grafik batang: nilai transaksi terakhir */
const TrendChart = ({ items }) => {
    const [hover, setHover] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 200);
        return () => clearTimeout(t);
    }, []);

    const data = items
        .slice(0, 12)
        .reverse()
        .map((t) => ({
            id: t.id,
            value: Number(t.total_price) || 0,
            time: t.created_at,
            cashier: t.user?.name || 'Kasir',
        }));

    if (data.length === 0) {
        return (
            <div className="h-52 flex flex-col items-center justify-center text-center">
                <span className="text-slate-300">
                    <IconChart className="w-10 h-10" />
                </span>
                <p className="text-xs text-slate-400 mt-2">Grafik akan muncul setelah ada transaksi.</p>
            </div>
        );
    }

    const max = Math.max(...data.map((d) => d.value), 1);
    const total = data.reduce((s, d) => s + d.value, 0);
    const avg = Math.round(total / data.length);
    const active = hover !== null ? data[hover] : null;

    return (
        <div>
            {/* keterangan yang berubah saat bar disorot */}
            <div className="min-h-[44px] mb-4">
                {active ? (
                    <div key={active.id} className="sc-pop">
                        <p className="text-xl font-extrabold text-blue-600 tracking-tight">{rp(active.value)}</p>
                        <p className="text-[11px] text-slate-500">
                            #{active.id} &middot; {active.cashier} &middot; {new Date(active.time).toLocaleString('id-ID')}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">{rp(total)}</p>
                        <p className="text-[11px] text-slate-500">
                            dari {data.length} transaksi terakhir &middot; rata-rata {rp(avg)}
                        </p>
                    </div>
                )}
            </div>

            {/* bar */}
            <div className="relative h-40">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ top: `${(i / 3) * 100}%` }} />
                ))}
                <div className="relative h-full flex items-end gap-2" onMouseLeave={() => setHover(null)}>
                    {data.map((d, i) => (
                        <button
                            key={d.id}
                            type="button"
                            onMouseEnter={() => setHover(i)}
                            onFocus={() => setHover(i)}
                            onBlur={() => setHover(null)}
                            aria-label={`Transaksi ${d.id}: ${rp(d.value)}`}
                            className="flex-1 h-full flex items-end focus:outline-none"
                        >
                            <span
                                className={`block w-full rounded-t-md transition-all duration-700 ease-out ${
                                    hover === i ? 'bg-blue-600' : hover === null ? 'bg-blue-500' : 'bg-blue-200'
                                }`}
                                style={{ height: ready ? `${Math.max(5, (d.value / max) * 100)}%` : '0%', transitionDelay: ready ? `${i * 30}ms` : '0ms' }}
                            />
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                {data.map((d) => (
                    <span key={d.id} className="flex-1 text-center text-[10px] text-slate-400 truncate">
                        #{d.id}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ================================================================== */
/*  HALAMAN DASHBOARD                                                  */
/* ================================================================== */
export default function Dashboard({ auth, store, stats, recentTransactions = [], lowStockProducts = [] }) {
    const [copied, setCopied] = useState(false);
    const [bannerFailed, setBannerFailed] = useState(false);
    const [now, setNow] = useState(() => new Date());
    const [trxSearch, setTrxSearch] = useState('');

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);

    const isAdmin = auth.user.role === 'admin';
    const currentCode = store?.code || '';
    const bannerSrc = resolveBanner(store?.banner);
    const bannerOverlay = Math.min(80, Math.max(0, Number(store?.banner_overlay ?? 45)));
    const hasBanner = Boolean(bannerSrc) && !bannerFailed;

    // reset status gagal-muat saat gambar banner diganti
    useEffect(() => setBannerFailed(false), [bannerSrc]);

    const hour = now.getHours();
    const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    const dateText = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

    const totalSales = Number(stats?.totalSales || 0);
    const totalTransactions = Number(stats?.totalTransactions || 0);
    const averageSale = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // clipboard bisa diblokir di koneksi non-HTTPS; abaikan saja
        }
    };

    /* performa kasir dari transaksi terbaru */
    const cashierMap = {};
    recentTransactions.forEach((trx) => {
        const name = trx.user?.name || 'Kasir';
        if (!cashierMap[name]) cashierMap[name] = { name, count: 0, total: 0 };
        cashierMap[name].count += 1;
        cashierMap[name].total += Number(trx.total_price) || 0;
    });
    const cashiers = Object.values(cashierMap).sort((a, b) => b.total - a.total);
    const topCashierTotal = Math.max(...cashiers.map((c) => c.total), 1);

    /* pencarian transaksi */
    const q = trxSearch.trim().toLowerCase();
    const shownTransactions = recentTransactions.filter(
        (trx) => !q || String(trx.id).includes(q.replace('#', '')) || (trx.user?.name || 'Kasir').toLowerCase().includes(q)
    );

    const quickActions = [
        { href: route('pos.index'), icon: <IconCart />, label: 'Buka POS Kasir', hint: 'Mulai transaksi baru', show: true },
        { href: isAdmin ? route('products.index') : null, icon: <IconBox className="w-5 h-5" />, label: 'Kelola Produk', hint: 'Tambah & ubah barang', show: isAdmin },
        { href: isAdmin ? route('purchases.index') : null, icon: <IconDownload />, label: 'Restock Barang', hint: 'Catat barang masuk', show: isAdmin },
        { href: isAdmin ? route('discounts.index') : null, icon: <IconTag />, label: 'Kelola Diskon', hint: 'Atur promo toko', show: isAdmin },
        { href: isAdmin ? route('reports.index') : null, icon: <IconChart />, label: 'Laporan Penjualan', hint: 'Lihat rekap lengkap', show: isAdmin },
        { href: isAdmin ? route('users.index') : null, icon: <IconUsers />, label: 'Kelola Staf', hint: 'Admin & kasir', show: isAdmin },
    ].filter((a) => a.show);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <IconStore />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight">
                        Dashboard <span className="text-blue-600">Toko</span>
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard" />
            <style>{css}</style>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* ===================== BANNER ===================== */}
                <Reveal>
                    <div className="relative overflow-hidden bg-[rgb(var(--banner))] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        {/* foto banner (opsional) + lapisan gelap agar tulisan tetap terbaca */}
                        {hasBanner && (
                            <>
                                <img
                                    src={bannerSrc}
                                    alt=""
                                    onError={() => setBannerFailed(true)}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900" style={{ opacity: bannerOverlay / 100 }} />
                            </>
                        )}

                        <div className="relative">
                            <span className="inline-flex items-center gap-2 bg-white/15 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                                <IconClock className="w-3.5 h-3.5" />
                                {dateText} &middot; {timeText}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                                {greeting}, selamat datang di {store?.name || 'Toko Anda'}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1.5 max-w-xl leading-relaxed">
                                Kelola penjualan, stok barang, dan staf kasir toko Anda dalam satu panel serbaguna.
                            </p>
                        </div>

                        <div
                            className={`relative border border-white/15 p-4 rounded-xl flex flex-col items-center shrink-0 w-full md:w-auto ${
                                hasBanner ? 'bg-slate-900/50 backdrop-blur-sm' : 'bg-[rgb(var(--banner-card))]'
                            }`}
                        >
                            <span className="text-xs text-blue-100 font-medium">Kode Unik Toko</span>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-2xl font-black tracking-widest text-white">{currentCode || '-'}</span>
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    disabled={!currentCode}
                                    aria-label="Salin kode toko"
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                                        copied ? 'bg-emerald-500 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'
                                    }`}
                                >
                                    <span key={copied ? 'ok' : 'copy'} className="sc-pop">
                                        {copied ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                                    </span>
                                    {copied ? 'Tersalin' : 'Salin'}
                                </button>
                            </div>
                            {isAdmin && (
                                <Link
                                    href={route('settings.index', { tab: 'code' })}
                                    className="mt-2.5 text-[11px] font-semibold text-blue-100 hover:text-white underline-offset-2 hover:underline transition-colors"
                                >
                                    Ubah kode toko
                                </Link>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* ===================== AKSI CEPAT ===================== */}
                <Reveal delay={60}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {quickActions.map((a) => (
                            <QuickAction key={a.label} href={a.href} icon={a.icon} label={a.label} hint={a.hint} />
                        ))}
                    </div>
                </Reveal>

                {/* ===================== STATISTIK ===================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Reveal delay={80} className="h-full">
                        <StatCard label="Total Omzet" value={<CountUp to={totalSales} prefix="Rp " />} icon={<IconWallet />} />
                    </Reveal>
                    <Reveal delay={140} className="h-full">
                        <StatCard label="Total Transaksi" value={<CountUp to={totalTransactions} />} unit="Struk" icon={<IconReceipt />} />
                    </Reveal>
                    <Reveal delay={200} className="h-full">
                        <StatCard label="Jenis Produk" value={<CountUp to={Number(stats?.totalProducts || 0)} />} unit="Barang" icon={<IconBox />} />
                    </Reveal>
                    <Reveal delay={260} className="h-full">
                        <StatCard label="Rata-rata / Transaksi" value={<CountUp to={averageSale} prefix="Rp " />} icon={<IconTrend />} />
                    </Reveal>
                </div>

                {/* ===================== GRAFIK & KASIR ===================== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Reveal delay={80} className="lg:col-span-2">
                        <Panel className="h-full">
                            <SectionTitle icon={<IconChart />}>Nilai Transaksi Terakhir</SectionTitle>
                            <TrendChart items={recentTransactions} />
                        </Panel>
                    </Reveal>

                    <Reveal delay={160} className="lg:col-span-1">
                        <Panel className="h-full">
                            <SectionTitle icon={<IconUsers />}>Performa Kasir</SectionTitle>

                            {cashiers.length > 0 ? (
                                <div className="space-y-4">
                                    {cashiers.map((c, i) => (
                                        <div key={c.name} style={{ animationDelay: `${i * 60}ms` }} className="sc-rowin group">
                                            <div className="flex items-center gap-3">
                                                <span className="w-9 h-9 shrink-0 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-bold text-slate-800 truncate">
                                                            {i === 0 && cashiers.length > 1 && (
                                                                <span className="mr-1.5 text-[9px] font-bold uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                                                    Teratas
                                                                </span>
                                                            )}
                                                            {c.name}
                                                        </p>
                                                        <span className="text-[11px] font-bold text-slate-700 shrink-0">{rp(c.total)}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400">{c.count} transaksi</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                                    style={{ width: `${Math.max(6, (c.total / topCashierTotal) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-[10px] text-slate-400 pt-1">Dihitung dari {recentTransactions.length} transaksi terbaru.</p>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <span className="text-slate-300 inline-block">
                                        <IconUsers className="w-10 h-10" />
                                    </span>
                                    <p className="text-xs text-slate-400 mt-2">Belum ada aktivitas kasir.</p>
                                </div>
                            )}
                        </Panel>
                    </Reveal>
                </div>

                {/* ===================== TRANSAKSI & STOK ===================== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Reveal delay={80} className="lg:col-span-2">
                        <Panel className="h-full">
                            <SectionTitle
                                icon={<IconList />}
                                right={
                                    recentTransactions.length > 0 && (
                                        <div className="relative w-40 sm:w-52">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconSearch />
                                            </span>
                                            <input
                                                type="text"
                                                value={trxSearch}
                                                onChange={(e) => setTrxSearch(e.target.value)}
                                                placeholder="Cari ID / kasir"
                                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border-slate-200 bg-slate-50 placeholder:text-slate-400 transition hover:border-blue-300 focus:bg-[rgb(var(--surface))] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    )
                                }
                            >
                                Aktivitas Transaksi Terakhir
                            </SectionTitle>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                            <th className="px-3 py-2">ID / Waktu</th>
                                            <th className="px-3 py-2">Kasir</th>
                                            <th className="px-3 py-2 text-right">Total Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shownTransactions.length > 0 ? (
                                            shownTransactions.map((trx, i) => (
                                                <tr
                                                    key={trx.id}
                                                    style={{ animationDelay: `${i * 40}ms` }}
                                                    className="sc-rowin group text-xs border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                                                >
                                                    <td className="px-3 py-3 font-semibold text-slate-900">
                                                        #{trx.id}
                                                        <br />
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            {new Date(trx.created_at).toLocaleString('id-ID')}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-600">
                                                        <span className="inline-flex items-center gap-2">
                                                            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                                                                {(trx.user?.name || 'K').charAt(0).toUpperCase()}
                                                            </span>
                                                            {trx.user?.name || 'Kasir'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-bold text-blue-600">{rp(trx.total_price)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-3 py-10 text-center">
                                                    <span className="text-slate-300 inline-block">
                                                        <IconInbox />
                                                    </span>
                                                    <p className="text-slate-400 text-xs mt-2">
                                                        {recentTransactions.length === 0 ? 'Belum ada transaksi tercatat.' : 'Tidak ada transaksi yang cocok.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    </Reveal>

                    <Reveal delay={160} className="lg:col-span-1">
                        <Panel className="h-full">
                            <SectionTitle
                                icon={<IconAlert />}
                                right={
                                    lowStockProducts.length > 0 && (
                                        <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                                            {lowStockProducts.length} produk
                                        </span>
                                    )
                                }
                            >
                                Stok Menipis (&le; 10)
                            </SectionTitle>

                            <div className="space-y-1">
                                {lowStockProducts.length > 0 ? (
                                    lowStockProducts.map((prod, i) => {
                                        const critical = Number(prod.stock) <= 3;
                                        const pct = Math.max(6, Math.min(100, (Number(prod.stock) / 10) * 100));
                                        return (
                                            <div
                                                key={prod.id}
                                                style={{ animationDelay: `${i * 40}ms` }}
                                                className="sc-rowin rounded-xl p-3 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <div className="flex justify-between items-center gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-xs text-slate-800 truncate">{prod.name}</h4>
                                                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                                            {prod.code}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${
                                                            critical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                    >
                                                        Sisa: {prod.stock}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${critical ? 'bg-red-500' : 'bg-amber-400'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <span className="text-emerald-300 inline-block">
                                            <IconShield />
                                        </span>
                                        <p className="text-slate-400 text-xs mt-2">Aman! Belum ada produk dengan stok menipis.</p>
                                    </div>
                                )}
                            </div>

                            {isAdmin && lowStockProducts.length > 0 && (
                                <Link
                                    href={route('purchases.index')}
                                    className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl py-2.5 transition duration-200 active:scale-[.98]"
                                >
                                    <IconDownload className="w-4 h-4" />
                                    Restock sekarang
                                </Link>
                            )}
                        </Panel>
                    </Reveal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}