import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import usePublicTheme from '@/Hooks/usePublicTheme';
import { Icons } from '@/Components/AuthUI';

/* ================================================================== */
/*  Kerangka halaman Login, Daftar, Lupa Password, dst.                */
/*  Letakkan di: resources/js/Layouts/GuestLayout.jsx                  */
/*                                                                     */
/*  Gambar di: public/images/                                          */
/*    - logo-smartcash.png                                             */
/*    - hero-kasir-2.png  (foto panel kiri)                             */
/*                                                                     */
/*  Tema hanya terang / gelap, memakai hook usePublicTheme sehingga    */
/*  TIDAK ikut berubah saat tema aplikasi diganti di dalam akun.        */
/*  Semua CSS halaman auth (token warna + kelas "sa-*") ada di sini.   */
/* ================================================================== */

const IMG = {
    logo: '/images/logo-smartcash.png',
    scene: '/images/hero-kasir-2.png',
};

const css = `
/* ---------- token warna: mode terang ---------- */
.sc-auth {
    color-scheme: light;
    --sa-bg: #F3F7FF;
    --sa-panel: #EAF1FF;
    --sa-stage: #E3ECFC;
    --sa-surface: #FFFFFF;
    --sa-surface-2: #EAF1FF;
    --sa-border: #D3DFF3;
    --sa-border-strong: #A9BCE3;
    --sa-heading: #0F1F4D;
    --sa-text: #2B3A5E;
    --sa-muted: #4F5E82;
    --sa-placeholder: #66739A;
    --sa-hl: #3C4FD9;
    --sa-accent-soft: #E5E8FE;
    --sa-primary: #3C4FD9;
    --sa-primary-hover: #2D3DB4;
    --sa-on-primary: #FFFFFF;
    --sa-ok: #065F46;
    --sa-ok-soft: #D7F5E8;
    --sa-ok-border: #9FDDC1;
    --sa-warn: #B45309;
    --sa-danger: #B91C1C;
    --sa-danger-soft: #FDE4E4;
    --sa-ring: rgba(60, 79, 217, .28);
    --sa-shadow: 15, 31, 77;
    --sa-logo-bg: transparent;
    --sa-photo-filter: none;
    --sa-check-img: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23FFFFFF' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3.5 8.5 3 3 6-7'/%3E%3C/svg%3E");
}

/* ---------- token warna: mode gelap ---------- */
.sc-auth[data-mode='dark'] {
    color-scheme: dark;
    --sa-bg: #0A1230;
    --sa-panel: #0D1839;
    --sa-stage: #E3ECFC;
    --sa-surface: #121E4B;
    --sa-surface-2: #1A2866;
    --sa-border: #2A3B78;
    --sa-border-strong: #43569C;
    --sa-heading: #F2F6FF;
    --sa-text: #C9D4F0;
    --sa-muted: #9FAED3;
    --sa-placeholder: #8A9ACB;
    --sa-hl: #7DD3FC;
    --sa-accent-soft: rgba(56, 189, 248, .14);
    --sa-primary: #38BDF8;
    --sa-primary-hover: #7DD3FC;
    --sa-on-primary: #06122E;
    --sa-ok: #34D399;
    --sa-ok-soft: rgba(52, 211, 153, .14);
    --sa-ok-border: rgba(52, 211, 153, .35);
    --sa-warn: #FBBF24;
    --sa-danger: #FCA5A5;
    --sa-danger-soft: rgba(248, 113, 113, .16);
    --sa-ring: rgba(125, 211, 252, .35);
    --sa-shadow: 0, 0, 0;
    --sa-logo-bg: #EAF1FF;
    --sa-photo-filter: brightness(.9) saturate(1.05);
    --sa-check-img: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2306122E' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3.5 8.5 3 3 6-7'/%3E%3C/svg%3E");
}

/* ---------- dasar ---------- */
.sc-auth {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--sa-bg);
    color: var(--sa-text);
    -webkit-font-smoothing: antialiased;
}
.sc-auth ::selection { background: var(--sa-primary); color: var(--sa-on-primary); }
.sc-auth :is(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--sa-hl);
    outline-offset: 3px;
}
.sc-auth .sa-h { color: var(--sa-heading); }
.sc-auth .sa-body { color: var(--sa-text); }
.sc-auth .sa-muted { color: var(--sa-muted); }
.sc-auth .sa-hl { color: var(--sa-hl); }

/* transisi halus saat berganti mode */
.sc-auth.sc-switching,
.sc-auth.sc-switching *,
.sc-auth.sc-switching *::before,
.sc-auth.sc-switching *::after {
    transition: background-color .35s ease, color .35s ease, border-color .35s ease, fill .35s ease, stroke .35s ease, box-shadow .35s ease !important;
}

/* ---------- kerangka ---------- */
.sc-auth .sa-panel { background: var(--sa-panel); border-right: 1px solid var(--sa-border); }
.sc-auth .sa-photo { background: var(--sa-stage); border: 1px solid var(--sa-border); }
.sc-auth .sa-photo img { filter: var(--sa-photo-filter); }
.sc-auth .sa-logo {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 4px; border-radius: 12px; background: var(--sa-logo-bg);
}
.sc-auth .sa-card {
    background: var(--sa-surface); border: 1px solid var(--sa-border);
    box-shadow: 0 30px 60px -34px rgba(var(--sa-shadow), .4);
}
.sc-auth .sa-tile {
    display: inline-flex; align-items: center; justify-content: center;
    width: 3rem; height: 3rem; border-radius: 1rem;
    background: var(--sa-accent-soft); color: var(--sa-hl);
}

/* ---------- navigasi atas ---------- */
.sc-auth .sa-back {
    display: inline-flex; align-items: center; gap: .5rem; min-height: 44px;
    font-size: .875rem; font-weight: 600; color: var(--sa-muted); transition: color .2s ease;
}
.sc-auth .sa-back:hover { color: var(--sa-hl); }
.sc-auth .sa-back .sa-back-icon { transition: transform .2s ease; }
.sc-auth .sa-back:hover .sa-back-icon { transform: translateX(-4px); }
.sc-auth .sa-iconbtn {
    position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; flex-shrink: 0; border-radius: 9999px;
    background: var(--sa-surface); color: var(--sa-heading); border: 1px solid var(--sa-border);
    transition: border-color .2s ease, color .2s ease, transform .2s ease, background-color .2s ease;
}
.sc-auth .sa-iconbtn:hover { border-color: var(--sa-hl); color: var(--sa-hl); transform: translateY(-2px); }
.sc-auth .sa-iconbtn:active { transform: scale(.94); }
.sc-auth .sa-theme-icon {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    transition: transform .45s cubic-bezier(.22, 1, .36, 1), opacity .3s ease;
}
.sc-auth .sa-theme-icon.is-off { opacity: 0; transform: rotate(-90deg) scale(.4); }

/* ---------- tombol ---------- */
.sc-auth .sa-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
    width: 100%; min-height: 48px; padding: .7rem 1.5rem; border-radius: 9999px;
    border: 1px solid transparent; font-size: .9375rem; font-weight: 700; line-height: 1.2;
    text-decoration: none; white-space: nowrap;
    transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease;
}
.sc-auth .sa-btn:active { transform: scale(.98); }
.sc-auth .sa-btn:disabled { opacity: .6; pointer-events: none; }
.sc-auth .sa-btn-primary {
    background: var(--sa-primary); color: var(--sa-on-primary);
    box-shadow: 0 12px 22px -14px rgba(var(--sa-shadow), .7);
}
.sc-auth .sa-btn-primary:hover { background: var(--sa-primary-hover); transform: translateY(-2px); }
.sc-auth .sa-btn-primary:active { transform: scale(.98); }
.sc-auth .sa-btn-outline { background: var(--sa-surface); color: var(--sa-heading); border-color: var(--sa-border-strong); }
.sc-auth .sa-btn-outline:hover { border-color: var(--sa-hl); color: var(--sa-hl); background: var(--sa-accent-soft); transform: translateY(-2px); }
.sc-auth .sa-btn-outline:active { transform: scale(.98); }
.sc-auth .sa-link {
    display: inline-block; padding: .5rem .25rem; margin: -.5rem -.25rem;
    font-size: inherit; font-weight: 700; color: var(--sa-hl); transition: color .2s ease;
}
.sc-auth .sa-link:hover { text-decoration: underline; text-underline-offset: 3px; }
.sc-auth .sa-link-sm { font-size: .8125rem; }

/* ---------- form ---------- */
.sc-auth .sa-label { display: block; font-size: .8125rem; font-weight: 700; color: var(--sa-heading); }
.sc-auth .sa-hint { margin-top: .375rem; font-size: .75rem; line-height: 1.5; color: var(--sa-muted); }
.sc-auth .sa-error { margin-top: .375rem; font-size: .8125rem; font-weight: 600; line-height: 1.5; color: var(--sa-danger); }
.sc-auth .sa-field {
    display: block; width: 100%; min-height: 48px; padding: .75rem 1rem; border-radius: .875rem;
    background-color: var(--sa-surface); color: var(--sa-heading);
    border: 1px solid var(--sa-border-strong); font-size: 1rem; line-height: 1.4;
    transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
}
@media (min-width: 640px) { .sc-auth .sa-field { font-size: .9375rem; } }
.sc-auth .sa-field.has-icon { padding-left: 2.9rem; }
.sc-auth .sa-field.has-eye { padding-right: 3.4rem; }
.sc-auth .sa-field::placeholder { color: var(--sa-placeholder); opacity: 1; }
.sc-auth .sa-field:hover { border-color: var(--sa-hl); }
.sc-auth .sa-field:focus,
.sc-auth .sa-field:focus-visible { outline: none; border-color: var(--sa-hl); box-shadow: 0 0 0 4px var(--sa-ring); }
.sc-auth .sa-field.is-invalid { border-color: var(--sa-danger); }
.sc-auth .sa-field.is-invalid:focus { box-shadow: 0 0 0 4px var(--sa-danger-soft); }
.sc-auth .sa-field[readonly] { background-color: var(--sa-surface-2); color: var(--sa-muted); cursor: default; }
.sc-auth .sa-field[readonly]:hover { border-color: var(--sa-border-strong); }
.sc-auth .sa-field.is-upper { text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
.sc-auth .sa-field.is-upper::placeholder { text-transform: none; letter-spacing: normal; font-weight: 400; }
.sc-auth .sa-field:-webkit-autofill {
    -webkit-text-fill-color: var(--sa-heading);
    box-shadow: 0 0 0 1000px var(--sa-surface) inset;
    transition: background-color 9999s ease-out;
}
.sc-auth .sa-field:-webkit-autofill:focus { box-shadow: 0 0 0 1000px var(--sa-surface) inset, 0 0 0 4px var(--sa-ring); }
.sc-auth .sa-field-icon { color: var(--sa-muted); transition: color .2s ease; }
.sc-auth .sa-field-wrap:focus-within .sa-field-icon { color: var(--sa-hl); }
.sc-auth .sa-eye {
    position: absolute; top: 50%; right: .3rem; transform: translateY(-50%);
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: .75rem; color: var(--sa-muted);
    transition: background-color .2s ease, color .2s ease;
}
.sc-auth .sa-eye:hover { background: var(--sa-surface-2); color: var(--sa-heading); }
.sc-auth .sa-eye:active { transform: translateY(-50%) scale(.92); }
.sc-auth .sa-checkrow { display: flex; align-items: center; gap: .75rem; width: fit-content; min-height: 44px; cursor: pointer; user-select: none; }
.sc-auth .sa-checkbox {
    -webkit-appearance: none; appearance: none; flex-shrink: 0; display: inline-block;
    width: 1.3rem; height: 1.3rem; border-radius: .4rem; cursor: pointer;
    background-color: var(--sa-surface); border: 1.5px solid var(--sa-border-strong);
    background-position: center; background-repeat: no-repeat; background-size: .9rem;
    transition: background-color .2s ease, border-color .2s ease; print-color-adjust: exact;
}
.sc-auth .sa-checkbox:hover { border-color: var(--sa-hl); }
.sc-auth .sa-checkbox:checked { background-color: var(--sa-primary); border-color: var(--sa-primary); background-image: var(--sa-check-img); }

/* ---------- pemberitahuan & indikator ---------- */
.sc-auth .sa-alert {
    display: flex; align-items: flex-start; gap: .7rem; padding: .85rem 1rem; border-radius: 1rem;
    font-size: .875rem; line-height: 1.5; font-weight: 600;
}
.sc-auth .sa-alert-ok { background: var(--sa-ok-soft); color: var(--sa-ok); border: 1px solid var(--sa-ok-border); }
.sc-auth .sa-alert-ico {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 1.25rem; height: 1.25rem; margin-top: .1rem; border-radius: 9999px;
    background: var(--sa-ok); color: var(--sa-surface);
}
.sc-auth .sa-meter { height: .375rem; border-radius: 9999px; background: var(--sa-surface-2); overflow: hidden; }
.sc-auth .sa-meter-bar { height: 100%; border-radius: 9999px; transition: width .3s ease, background-color .3s ease; }
.sc-auth .sa-bar-bad { background: var(--sa-danger); }
.sc-auth .sa-bar-warn { background: var(--sa-warn); }
.sc-auth .sa-bar-ok { background: var(--sa-ok); }
.sc-auth .sa-tx-bad { color: var(--sa-danger); }
.sc-auth .sa-tx-warn { color: var(--sa-warn); }
.sc-auth .sa-tx-ok { color: var(--sa-ok); }

/* ---------- saklar Masuk / Daftar ---------- */
.sc-auth .sa-seg {
    position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px;
    border-radius: 9999px; background: var(--sa-surface-2); border: 1px solid var(--sa-border);
}
.sc-auth .sa-seg-thumb {
    position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 9999px;
    background: var(--sa-surface); border: 1px solid var(--sa-border);
    box-shadow: 0 4px 10px -4px rgba(var(--sa-shadow), .4);
    transition: transform .55s cubic-bezier(.22, 1, .36, 1);
}
.sc-auth .sa-seg-tab {
    position: relative; z-index: 1; min-height: 44px; border-radius: 9999px;
    font-size: .875rem; font-weight: 700; color: var(--sa-muted); transition: color .3s ease;
}
.sc-auth .sa-seg-tab:hover { color: var(--sa-heading); }
.sc-auth .sa-seg-tab[aria-selected='true'] { color: var(--sa-hl); }
.sc-auth .sa-frame { transition: height .5s cubic-bezier(.22, 1, .36, 1); }
.sc-auth .sa-track { transition: transform .55s cubic-bezier(.22, 1, .36, 1); }

/* ---------- animasi ---------- */
@keyframes sa-pop { 0% { transform: scale(.96) translateY(6px); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes sa-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes sa-spin { to { transform: rotate(360deg) } }
.sc-auth .sa-pop { animation: sa-pop .25s cubic-bezier(.22, 1, .36, 1) backwards; }
.sc-auth .sa-rise { animation: sa-rise .55s cubic-bezier(.22, 1, .36, 1) backwards; }
.sc-auth .sa-spin { animation: sa-spin .8s linear infinite; }

@media (prefers-reduced-motion: reduce) {
    .sc-auth .sa-pop, .sc-auth .sa-rise { animation: none !important; }
    .sc-auth .sa-spin { animation-duration: 2s; }
    .sc-auth .sa-seg-thumb, .sc-auth .sa-frame, .sc-auth .sa-track, .sc-auth .sa-theme-icon { transition: none !important; }
    .sc-auth .sa-btn:hover, .sc-auth .sa-iconbtn:hover, .sc-auth .sa-btn:active { transform: none !important; }
}
`;

/* Logo + nama aplikasi (dipakai di panel kiri dan header ponsel) */
const Brand = ({ compact = false }) => (
    <Link href="/" className="group flex w-fit items-center gap-3" aria-label="SmartCash, kembali ke beranda">
        <span className="sa-logo">
            <img
                src={IMG.logo}
                alt=""
                className={`${compact ? 'h-9 w-9' : 'h-11 w-11'} object-contain transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110`}
            />
        </span>
        <span>
            <span className={`sa-h block font-extrabold leading-none tracking-tight ${compact ? 'text-xl' : 'text-2xl'}`}>
                Smart<span className="sa-hl">Cash</span>
            </span>
            <span className="sa-muted mt-1 block text-xs font-medium">Solusi Kasir Modern</span>
        </span>
    </Link>
);

export default function GuestLayout({ children }) {
    const rootRef = useRef(null);
    const { isDark, toggleTheme } = usePublicTheme();

    return (
        <div
            ref={rootRef}
            data-mode={isDark ? 'dark' : 'light'}
            className="sc-auth min-h-screen lg:grid lg:grid-cols-2 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
        >
            <Head>
                <meta name="theme-color" content={isDark ? '#0A1230' : '#F3F7FF'} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                />
            </Head>
            <style>{css}</style>

            {/* ===================== PANEL KIRI (hanya layar lebar) ===================== */}
            <aside className="sa-panel hidden lg:sticky lg:top-0 lg:flex lg:h-screen flex-col gap-8 p-10 xl:p-14">
                <Brand />

                <div className="max-w-md">
                    <h2 className="sa-h text-3xl font-extrabold leading-[1.15] tracking-tight xl:text-4xl">
                        Kasir lebih sigap, <span className="sa-hl">bisnis lebih terkendali.</span>
                    </h2>
                    <p className="sa-body mt-4 leading-relaxed">
                        Catat transaksi, pantau stok, dan lihat laporan penjualan dari satu aplikasi.
                    </p>
                </div>

                <div className="sa-photo relative min-h-0 flex-1 overflow-hidden rounded-3xl">
                    <img
                        src={IMG.scene}
                        alt="Kasir melayani pelanggan memakai aplikasi SmartCash"
                        width={1151}
                        height={863}
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full select-none object-cover object-[50%_60%]"
                    />
                </div>
            </aside>

            {/* ===================== KOLOM FORM ===================== */}
            <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 lg:px-10">
                    <div className="lg:hidden">
                        <Brand compact />
                    </div>
                    <div className="hidden lg:block">
                        <Link href="/" className="sa-back">
                            <span className="sa-back-icon">
                                <Icons.ArrowLeft />
                            </span>
                            Kembali ke beranda
                        </Link>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={isDark}
                        onClick={() => toggleTheme(rootRef.current)}
                        aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                        title={isDark ? 'Mode terang' : 'Mode gelap'}
                        className="sa-iconbtn"
                    >
                        <span className={`sa-theme-icon ${isDark ? '' : 'is-off'}`}>
                            <Icons.Sun />
                        </span>
                        <span className={`sa-theme-icon ${isDark ? 'is-off' : ''}`}>
                            <Icons.Moon />
                        </span>
                    </button>
                </header>

                <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
                    <div className="w-full max-w-[460px]">
                        <div className="sa-card sa-rise rounded-3xl p-6 sm:p-8">{children}</div>
                    </div>
                </main>

                <footer className="sa-muted px-5 pb-6 text-center text-xs sm:px-8">
                    &copy; {new Date().getFullYear()} SmartCash. Solusi Kasir Modern.
                </footer>
            </div>
        </div>
    );
}