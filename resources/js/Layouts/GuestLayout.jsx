import React, { useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan halaman lain)                  */
/* ================================================================== */
const css = `
@keyframes sc-up { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.94); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
@keyframes sc-slide { from { opacity: 0; transform: translateX(-14px) } to { opacity: 1; transform: none } }
.sc-up { animation: sc-up .6s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .2s cubic-bezier(.22,1,.36,1) backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-slide { animation: sc-slide .6s cubic-bezier(.22,1,.36,1) backwards }
@media (prefers-reduced-motion: reduce) {
    .sc-up, .sc-pop, .sc-slide { animation: none !important }
}
`;

const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const FEATURES = [
    {
        title: 'Transaksi Cepat',
        desc: 'Checkout dalam hitungan detik dengan kalkulator kembalian otomatis.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M13.5 2 4 13.5h6.2L9 22l10-12.2h-6.4L13.5 2Z" />
            </svg>
        ),
    },
    {
        title: 'Stok Real-Time',
        desc: 'Pantau pergerakan stok barang dan inventaris toko Anda.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
                <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
                <path d="m3 8 9 5 9-5M12 13v8" />
            </svg>
        ),
    },
    {
        title: 'Laporan Otomatis',
        desc: 'Rekap penjualan harian yang rapi, transparan, dan siap diunduh.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <rect x="3" y="12" width="4.5" height="9" rx="1.2" />
                <rect x="9.75" y="7" width="4.5" height="14" rx="1.2" />
                <rect x="16.5" y="3" width="4.5" height="18" rx="1.2" />
            </svg>
        ),
    },
];

/**
 * Layout untuk halaman tamu (Login, Register, Lupa Password, dll).
 * Letakkan di: resources/js/Layouts/GuestLayout.jsx
 */
export default function GuestLayout({ children }) {
    // halaman login/daftar memakai tema terakhir yang dipakai di perangkat ini
    useEffect(() => {
        let t = 'samudra';
        try {
            t = localStorage.getItem('sc-theme') || 'samudra';
        } catch (e) {
            // abaikan
        }
        document.documentElement.setAttribute('data-theme', t);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <style>{css}</style>

            {/* ===================== PANEL MEREK (DESKTOP) ===================== */}
            <aside className="relative hidden lg:flex flex-col justify-between bg-[#16255a] text-white p-12 xl:p-16 overflow-hidden">
                {/* hiasan bentuk datar */}
                <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
                <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-white/5" />
                <div className="absolute bottom-40 right-20 w-3 h-3 rounded-full bg-sky-400/70" />
                <div className="absolute top-1/3 right-16 w-2 h-2 rounded-full bg-white/30" />

                <Link href="/" className="relative group inline-flex items-center gap-3 w-fit">
                    <span className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                        <ApplicationLogo className="w-full h-full" />
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight">
                        Smart<span className="text-sky-400">Cash</span>
                    </span>
                </Link>

                <div className="relative max-w-lg">
                    <span className="inline-flex items-center gap-2 bg-white/10 text-[11px] font-semibold px-3.5 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        Solusi Kasir Modern untuk Bisnis Anda
                    </span>

                    <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] mt-5">
                        Kelola Transaksi
                        <br />
                        <span className="text-sky-400">Lebih Mudah &amp; Cepat</span>
                    </h1>

                    <p className="text-slate-300 leading-relaxed mt-4">
                        Satu aplikasi kasir untuk transaksi, stok barang, dan laporan penjualan toko Anda.
                    </p>

                    <ul className="mt-9 space-y-3">
                        {FEATURES.map((f, i) => (
                            <li
                                key={f.title}
                                style={{ animationDelay: `${200 + i * 120}ms` }}
                                className="sc-slide group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-300 hover:bg-white/10 hover:translate-x-1"
                            >
                                <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 text-sky-300 flex items-center justify-center transition duration-300 group-hover:bg-sky-400 group-hover:text-[#16255a]">
                                    {f.icon}
                                </span>
                                <div>
                                    <p className="font-bold text-sm">{f.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} SmartCash. All rights reserved.
                </p>
            </aside>

            {/* ===================== AREA FORM ===================== */}
            <main className="flex flex-col min-h-screen px-5 sm:px-10 py-8">
                {/* bar atas */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="group lg:hidden inline-flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center">
                            <ApplicationLogo className="w-full h-full" />
                        </span>
                        <span className="text-xl font-extrabold tracking-tight text-[#14214f]">
                            Smart<span className="text-blue-600">Cash</span>
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" {...ip} strokeWidth={2.5}>
                            <path d="M19 12H5M11 6l-6 6 6 6" />
                        </svg>
                        Kembali ke beranda
                    </Link>
                </div>

                {/* kartu form */}
                <div className="flex-1 flex items-center justify-center py-8">
                    <div className="sc-up w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">{children}</div>
                </div>

                <p className="lg:hidden text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} SmartCash. All rights reserved.
                </p>
            </main>
        </div>
    );
}