import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import usePublicTheme from '@/Hooks/usePublicTheme';

/* ================================================================== */
/*  KONFIGURASI                                                        */
/*  Letakkan semua gambar di: public/images/                           */
/*    - logo-smartcash.png       (logo yang sudah dirapikan)           */
/*    - hero-kasir.png           (ilustrasi kasir)                     */
/*    - dashboard-smartcash.png  (ilustrasi laptop / cara kerja)       */
/*    - tim-smartcash.png        (ilustrasi tim / tentang kami)        */
/* ================================================================== */
const IMG = {
    logo: '/images/logo-smartcash.png',
    hero: '/images/hero-kasir.png',
    dashboard: '/images/dashboard-smartcash.png',
    tim: '/images/tim-smartcash.png',
};

const NAV_ITEMS = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'fitur', label: 'Fitur' },
    { id: 'cara-kerja', label: 'Cara Kerja' },
    { id: 'tentang', label: 'Tentang Kami' },
];

const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${id}`);
    }
};

/* ================================================================== */
/*  CSS: TOKEN WARNA (TERANG + GELAP) DAN KOMPONEN                     */
/*  Palet: Navy Blue (judul & footer), Sky Blue (aksen), Indigo        */
/*  (tombol & sorotan di mode terang).                                 */
/* ================================================================== */
const css = `
/* ---------- token warna: mode terang ---------- */
.sc-landing {
    color-scheme: light;
    --sc-bg: #F3F7FF;
    --sc-bg-alt: #FFFFFF;
    --sc-surface: #FFFFFF;
    --sc-surface-2: #EAF1FF;
    --sc-border: #D3DFF3;
    --sc-border-strong: #A9BCE3;
    --sc-heading: #0F1F4D;
    --sc-text: #2B3A5E;
    --sc-muted: #4F5E82;
    --sc-hl: #3C4FD9;
    --sc-accent: #0369A1;
    --sc-accent-soft: #DCEEFD;
    --sc-indigo: #4338CA;
    --sc-indigo-soft: #E5E8FE;
    --sc-navy: #1E2F6B;
    --sc-navy-soft: #E3E8F4;
    --sc-primary: #3C4FD9;
    --sc-primary-hover: #2D3DB4;
    --sc-on-primary: #FFFFFF;
    --sc-nav: rgba(243, 247, 255, .88);
    --sc-logo-bg: transparent;
    --sc-stage: #E8F0FE;
    --sc-ok: #047857;
    --sc-ok-soft: #D7F5E8;
    --sc-danger: #B91C1C;
    --sc-danger-soft: #FDE4E4;
    --sc-ring: rgba(60, 79, 217, .28);
    --sc-shadow: 15, 31, 77;
    --sc-overlay: rgba(8, 14, 38, .55);
    --sc-footer: #0F1F4D;
    --sc-f-logo: transparent;
    --sc-f-brand-bg: #FFFFFF;
    --sc-select-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%234F5E82' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
}

/* ---------- token warna: mode gelap ---------- */
.sc-landing[data-mode='dark'] {
    color-scheme: dark;
    --sc-bg: #0A1230;
    --sc-bg-alt: #0D1839;
    --sc-surface: #121E4B;
    --sc-surface-2: #1A2866;
    --sc-border: #2A3B78;
    --sc-border-strong: #43569C;
    --sc-heading: #F2F6FF;
    --sc-text: #C9D4F0;
    --sc-muted: #9FAED3;
    --sc-hl: #7DD3FC;
    --sc-accent: #7DD3FC;
    --sc-accent-soft: rgba(56, 189, 248, .14);
    --sc-indigo: #A5B4FC;
    --sc-indigo-soft: rgba(129, 140, 248, .18);
    --sc-navy: #C9D4F0;
    --sc-navy-soft: rgba(148, 163, 214, .16);
    --sc-primary: #38BDF8;
    --sc-primary-hover: #7DD3FC;
    --sc-on-primary: #06122E;
    --sc-nav: rgba(10, 18, 48, .88);
    --sc-logo-bg: #EAF1FF;
    --sc-stage: #E3ECFC;
    --sc-ok: #34D399;
    --sc-ok-soft: rgba(52, 211, 153, .16);
    --sc-danger: #FCA5A5;
    --sc-danger-soft: rgba(248, 113, 113, .16);
    --sc-ring: rgba(125, 211, 252, .35);
    --sc-shadow: 0, 0, 0;
    --sc-overlay: rgba(3, 6, 20, .74);
    --sc-footer: #060C24;
    --sc-f-logo: #EAF1FF;
    --sc-f-brand-bg: transparent;
    --sc-select-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239FAED3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
}

/* ---------- dasar ---------- */
.sc-landing {
    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--sc-bg);
    color: var(--sc-text);
    -webkit-font-smoothing: antialiased;
}
.sc-landing ::selection { background: var(--sc-primary); color: var(--sc-on-primary); }
.sc-landing :is(a, button, [role='tab'], [role='switch'], summary) { cursor: pointer; }
.sc-landing :is(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--sc-hl);
    outline-offset: 3px;
}
.sc-landing .sc-bg { background: var(--sc-bg); }
.sc-landing .sc-bg-alt { background: var(--sc-bg-alt); }
.sc-landing .sc-h { color: var(--sc-heading); }
.sc-landing .sc-body { color: var(--sc-text); }
.sc-landing .sc-muted { color: var(--sc-muted); }
.sc-landing .sc-hl { color: var(--sc-hl); }
.sc-landing .sc-accent { color: var(--sc-accent); }

/* transisi halus saat berganti mode */
.sc-landing.sc-switching,
.sc-landing.sc-switching *,
.sc-landing.sc-switching *::before,
.sc-landing.sc-switching *::after {
    transition: background-color .35s ease, color .35s ease, border-color .35s ease, fill .35s ease, stroke .35s ease, box-shadow .35s ease !important;
}

/* lompat ke konten (aksesibilitas keyboard) */
.sc-landing .sc-skip {
    position: absolute; left: .75rem; top: -4rem; z-index: 100;
    padding: .7rem 1.1rem; border-radius: .75rem; font-size: .875rem; font-weight: 700;
    background: var(--sc-primary); color: var(--sc-on-primary); transition: top .2s ease;
}
.sc-landing .sc-skip:focus { top: .75rem; }

/* ---------- kartu ---------- */
.sc-landing .sc-card { background: var(--sc-surface); border: 1px solid var(--sc-border); }
.sc-landing .sc-card-lift {
    transition: transform .3s cubic-bezier(.22, 1, .36, 1), box-shadow .3s ease, border-color .3s ease, background-color .3s ease;
}
.sc-landing .sc-card-lift:hover {
    transform: translateY(-4px);
    border-color: var(--sc-border-strong);
    box-shadow: 0 18px 36px -16px rgba(var(--sc-shadow), .3);
}
.sc-landing .sc-shadow-md { box-shadow: 0 12px 28px -14px rgba(var(--sc-shadow), .35); }
.sc-landing .sc-shadow-lg { box-shadow: 0 28px 56px -26px rgba(var(--sc-shadow), .4); }
.sc-landing .sc-stage {
    background: var(--sc-stage);
    border: 1px solid var(--sc-border);
    overflow: hidden;
}
.sc-landing[data-mode='dark'] .sc-stage img { filter: brightness(.96); }

/* ---------- lencana, pil, titik status ---------- */
.sc-landing .sc-badge {
    display: inline-flex; align-items: center; gap: .6rem;
    font-size: .875rem; font-weight: 700; letter-spacing: .01em; color: var(--sc-accent);
}
.sc-landing .sc-pill {
    display: inline-flex; align-items: center; border-radius: 9999px;
    padding: .3rem .8rem; font-size: .75rem; font-weight: 700;
    background: var(--sc-accent-soft); color: var(--sc-hl);
}
.sc-landing .sc-dot { display: inline-block; width: .5rem; height: .5rem; border-radius: 9999px; }
.sc-landing .sc-dot-ok { background: var(--sc-ok); box-shadow: 0 0 0 4px var(--sc-ok-soft); }
.sc-landing .sc-dot-sky { background: var(--sc-accent); box-shadow: 0 0 0 4px var(--sc-accent-soft); }

/* ---------- ikon berwarna ---------- */
.sc-landing .sc-tone {
    transition: background-color .3s ease, color .3s ease, transform .3s ease;
}
.sc-landing .sc-tone-sky { background: var(--sc-accent-soft); color: var(--sc-accent); }
.sc-landing .sc-tone-indigo { background: var(--sc-indigo-soft); color: var(--sc-indigo); }
.sc-landing .sc-tone-navy { background: var(--sc-navy-soft); color: var(--sc-navy); }
.sc-landing .sc-tone-ok { background: var(--sc-ok-soft); color: var(--sc-ok); }
.sc-landing .group:hover .sc-tone { transform: scale(1.06); }

/* ---------- tombol ---------- */
.sc-landing .sc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
    min-height: 44px; padding: .65rem 1.5rem; border-radius: 9999px;
    border: 1px solid transparent; font-size: .875rem; font-weight: 700; line-height: 1.2;
    text-decoration: none; white-space: nowrap;
    transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease;
}
.sc-landing .sc-btn:active { transform: scale(.97); }
.sc-landing .sc-btn-block { width: 100%; }
.sc-landing .sc-btn-lg { min-height: 48px; padding: .85rem 1.75rem; }
.sc-landing .sc-btn-primary {
    background: var(--sc-primary); color: var(--sc-on-primary);
    box-shadow: 0 10px 20px -12px rgba(var(--sc-shadow), .6);
}
.sc-landing .sc-btn-primary:hover { background: var(--sc-primary-hover); transform: translateY(-2px); }
.sc-landing .sc-btn-primary:active { transform: scale(.97); }
.sc-landing .sc-btn-outline { background: transparent; color: var(--sc-heading); border-color: var(--sc-border-strong); }
.sc-landing .sc-btn-outline:hover { border-color: var(--sc-hl); color: var(--sc-hl); background: var(--sc-accent-soft); transform: translateY(-2px); }
.sc-landing .sc-btn-outline:active { transform: scale(.97); }
.sc-landing .sc-btn-soft { background: var(--sc-accent-soft); color: var(--sc-hl); }
.sc-landing .sc-btn-soft:hover { background: var(--sc-primary); color: var(--sc-on-primary); }
.sc-landing .sc-btn-icon {
    width: 44px; height: 44px; padding: 0;
    background: var(--sc-surface); color: var(--sc-heading); border-color: var(--sc-border);
}
.sc-landing .sc-btn-icon:hover { border-color: var(--sc-hl); color: var(--sc-hl); transform: translateY(-2px); }
.sc-landing .sc-btn-round { width: 48px; height: 48px; padding: 0; }
.sc-landing .sc-iconbtn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; flex-shrink: 0; border-radius: .75rem; color: var(--sc-muted);
    transition: background-color .2s ease, color .2s ease, transform .2s ease;
}
.sc-landing .sc-iconbtn:hover { background: var(--sc-surface-2); color: var(--sc-heading); }
.sc-landing .sc-iconbtn:active { transform: scale(.92); }
.sc-landing .sc-iconbtn-sm {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 9999px;
    background: var(--sc-surface-2); color: var(--sc-muted);
    transition: background-color .2s ease, color .2s ease, transform .2s ease;
}
.sc-landing .sc-iconbtn-sm:hover { background: var(--sc-danger-soft); color: var(--sc-danger); }
.sc-landing .sc-iconbtn-sm:active { transform: scale(.9); }
.sc-landing .sc-top {
    transition: opacity .3s ease, transform .3s ease, background-color .2s ease, visibility .3s ease;
}
/* tampil/sembunyi per ukuran layar (tidak tertimpa display milik tombol) */
.sc-landing .sc-sm-up { display: none; }
.sc-landing .sc-below-lg { display: inline-flex; }
@media (min-width: 640px) { .sc-landing .sc-sm-up { display: inline-flex; } }
@media (min-width: 1024px) { .sc-landing .sc-below-lg { display: none; } }
.sc-landing .sc-top.is-hidden { opacity: 0; transform: translateY(12px) scale(.8); pointer-events: none; visibility: hidden; }

/* ---------- toggle mode gelap/terang ---------- */
.sc-landing .sc-theme-btn { position: relative; overflow: hidden; }
.sc-landing .sc-theme-icon {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    transition: transform .45s cubic-bezier(.22, 1, .36, 1), opacity .3s ease;
}
.sc-landing .sc-theme-icon.is-off { opacity: 0; transform: rotate(-90deg) scale(.4); }

/* ---------- navbar ---------- */
.sc-landing .sc-header {
    background: var(--sc-nav);
    -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent;
    transition: border-color .3s ease, box-shadow .3s ease, background-color .3s ease;
}
.sc-landing .sc-header.is-scrolled {
    border-bottom-color: var(--sc-border);
    box-shadow: 0 10px 28px -20px rgba(var(--sc-shadow), .45);
}
.sc-landing .sc-logo-tile {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 4px; border-radius: 12px; background: var(--sc-logo-bg);
}
.sc-landing .sc-nav-link {
    position: relative; display: inline-flex; align-items: center; min-height: 44px;
    font-size: .875rem; font-weight: 500; color: var(--sc-text); transition: color .2s ease;
}
.sc-landing .sc-nav-link:hover { color: var(--sc-hl); }
.sc-landing .sc-nav-link[aria-current='true'] { color: var(--sc-hl); font-weight: 700; }
.sc-landing .sc-nav-bar {
    position: absolute; left: 0; right: 0; bottom: 4px; height: 2px; border-radius: 2px;
    background: var(--sc-hl); transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
}
.sc-landing .sc-nav-link[aria-current='true'] .sc-nav-bar { transform: scaleX(1); }
.sc-landing .sc-link {
    display: inline-flex; align-items: center; min-height: 44px; padding: 0 .5rem;
    font-size: .875rem; font-weight: 600; color: var(--sc-heading); transition: color .2s ease;
}
.sc-landing .sc-link:hover { color: var(--sc-hl); }
.sc-landing .sc-menu { background: var(--sc-bg-alt); border-top: 1px solid var(--sc-border); }
.sc-landing .sc-menu-link {
    display: flex; align-items: center; min-height: 48px; font-size: .9375rem; font-weight: 500;
    color: var(--sc-text); transition: color .2s ease;
}
.sc-landing .sc-menu-link:hover,
.sc-landing .sc-menu-link[aria-current='true'] { color: var(--sc-hl); }
.sc-landing .sc-progress { background: var(--sc-primary); }

/* ---------- form ---------- */
.sc-landing .sc-input {
    width: 100%; min-height: 44px; padding: .7rem .95rem; border-radius: .75rem;
    background-color: var(--sc-surface); color: var(--sc-heading);
    border: 1px solid var(--sc-border-strong); font-size: .875rem;
    transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
}
.sc-landing .sc-input::placeholder { color: var(--sc-muted); opacity: 1; }
.sc-landing .sc-input:hover { border-color: var(--sc-hl); }
.sc-landing .sc-input:focus { outline: none; border-color: var(--sc-hl); box-shadow: 0 0 0 4px var(--sc-ring); }
.sc-landing .sc-input.is-invalid { border-color: var(--sc-danger); }
.sc-landing .sc-input.is-invalid:focus { box-shadow: 0 0 0 4px var(--sc-danger-soft); }
.sc-landing .sc-input-search { padding-left: 2.8rem; padding-right: 2.75rem; }
.sc-landing select.sc-input {
    -webkit-appearance: none; appearance: none;
    background-image: var(--sc-select-arrow); background-repeat: no-repeat;
    background-position: right .8rem center; background-size: 1.2rem 1.2rem; padding-right: 2.6rem;
}
.sc-landing select.sc-input option { background: var(--sc-surface); color: var(--sc-heading); }
.sc-landing .sc-error { color: var(--sc-danger); font-size: .75rem; font-weight: 600; margin-top: .3rem; }

/* ---------- modal bantuan ---------- */
.sc-landing .sc-overlay { background: var(--sc-overlay); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
.sc-landing .sc-modal {
    background: var(--sc-surface); border: 1px solid var(--sc-border);
    box-shadow: 0 40px 90px -30px rgba(0, 0, 0, .55);
}
.sc-landing .sc-modal:focus { outline: none; }
.sc-landing .sc-modal-head { border-bottom: 1px solid var(--sc-border); }
.sc-landing .sc-tab {
    display: inline-flex; align-items: center; gap: .5rem; flex-shrink: 0;
    min-height: 44px; padding: 0 1rem; margin-bottom: -1px;
    font-size: .875rem; font-weight: 700; color: var(--sc-muted);
    border-bottom: 2px solid transparent;
    transition: color .2s ease, border-color .2s ease;
}
.sc-landing .sc-tab:hover { color: var(--sc-heading); border-bottom-color: var(--sc-border-strong); }
.sc-landing .sc-tab[aria-selected='true'] { color: var(--sc-hl); border-bottom-color: var(--sc-hl); }
.sc-landing .sc-num {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 1.35rem; height: 1.35rem; border-radius: 9999px; margin-top: 1px;
    background: var(--sc-surface-2); color: var(--sc-muted); font-size: .6875rem; font-weight: 700;
}
.sc-landing .sc-faq {
    background: var(--sc-surface); border: 1px solid var(--sc-border); border-radius: 1rem;
    transition: border-color .2s ease, background-color .2s ease;
}
.sc-landing .sc-faq:hover { border-color: var(--sc-border-strong); }
.sc-landing .sc-faq.is-open { border-color: var(--sc-hl); background: var(--sc-accent-soft); }
.sc-landing .sc-chev {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 1.9rem; height: 1.9rem; border-radius: 9999px;
    background: var(--sc-surface-2); color: var(--sc-muted);
    transition: background-color .3s ease, color .3s ease, transform .3s ease;
}
.sc-landing .sc-faq.is-open .sc-chev { background: var(--sc-primary); color: var(--sc-on-primary); transform: rotate(180deg); }

/* ---------- footer (latar navy gelap di kedua mode) ---------- */
.sc-landing .sc-footer { background: var(--sc-footer); color: #C3CFEA; }
.sc-landing .sc-footer .sc-f-h { color: #FFFFFF; }
.sc-landing .sc-footer .sc-f-sky { color: #7DD3FC; }
.sc-landing .sc-footer .sc-f-muted { color: #AEBBDD; }
.sc-landing .sc-footer .sc-f-link {
    display: inline-flex; align-items: center; min-height: 40px; text-align: left; color: #C3CFEA;
    transition: color .2s ease, transform .3s ease;
}
.sc-landing .sc-footer .sc-f-link:hover { color: #FFFFFF; transform: translateX(6px); }
.sc-landing .sc-footer .sc-f-line { border-top: 1px solid rgba(255, 255, 255, .12); }
.sc-landing .sc-footer :is(a, button):focus-visible { outline-color: #7DD3FC; }
/* blok logo + tulisan SmartCash: warna tulisan mengikuti mode.
   Mode terang: kartu putih berisi tulisan navy/indigo. Mode gelap: tanpa kartu, tulisan terang. */
.sc-landing .sc-f-brand {
    padding: .5rem 1rem .5rem .5rem; border-radius: 1rem; background: var(--sc-f-brand-bg);
    transition: background-color .3s ease, padding .3s ease;
}
.sc-landing[data-mode='dark'] .sc-f-brand { padding: 0; }
.sc-landing .sc-f-logo { background: var(--sc-f-logo); }
.sc-landing .sc-social {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; border-radius: .75rem;
    background: rgba(255, 255, 255, .1); color: #FFFFFF;
    transition: background-color .25s ease, transform .25s ease;
}
.sc-landing .sc-social:hover { background: #4F46E5; transform: translateY(-3px); }
.sc-landing .sc-footer-btn {
    display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; padding: 0 1.1rem;
    border-radius: .75rem; background: rgba(255, 255, 255, .1); color: #FFFFFF;
    font-size: .8125rem; font-weight: 700;
    transition: background-color .25s ease, color .25s ease, transform .2s ease;
}
.sc-landing .sc-footer-btn:hover { background: #38BDF8; color: #06122E; }
.sc-landing .sc-footer-btn:active { transform: scale(.96); }

/* ---------- animasi ---------- */
.sc-reveal { opacity: 0; transition: opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1) }
.sc-up    { transform: translateY(36px) }
.sc-left  { transform: translateX(-52px) }
.sc-right { transform: translateX(52px) }
.sc-zoom  { transform: scale(.88) }
.sc-reveal.sc-in { opacity: 1; transform: none }

@keyframes sc-pop { 0% { transform: scale(.96) translateY(8px); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes sc-fade { from { opacity: 0 } to { opacity: 1 } }
.sc-pop { animation: sc-pop .25s cubic-bezier(.22,1,.36,1) backwards }
.sc-fade { animation: sc-fade .2s ease backwards }

@media (prefers-reduced-motion: reduce) {
    .sc-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
    .sc-pop, .sc-fade { animation: none !important }
    .sc-landing .sc-card-lift:hover,
    .sc-landing .sc-btn:hover,
    .sc-landing .sc-btn:active,
    .sc-landing .sc-footer .sc-f-link:hover,
    .sc-landing .sc-social:hover { transform: none !important }
    .sc-landing .sc-theme-icon { transition: none }
}
`;

/* ================================================================== */
/*  HELPER INTERAKTIF                                                  */
/* ================================================================== */

/* Elemen muncul halus saat masuk layar */
const Reveal = ({ children, variant = 'up', delay = 0, className = '' }) => {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setShown(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`sc-reveal sc-${variant} ${shown ? 'sc-in' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

/* ================================================================== */
/*  IKON (SVG inline)                                                  */
/* ================================================================== */
const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconBolt = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M13.5 2 4 13.5h6.2L9 22l10-12.2h-6.4L13.5 2Z" />
    </svg>
);
const IconBox = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
);
const IconChart = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <rect x="3" y="12" width="4.5" height="9" rx="1.2" />
        <rect x="9.75" y="7" width="4.5" height="14" rx="1.2" />
        <rect x="16.5" y="3" width="4.5" height="18" rx="1.2" />
    </svg>
);
const IconStore = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M4 9.5 5.5 4h13L20 9.5" />
        <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
        <path d="M5 12.5V20h14v-7.5" />
        <path d="M10 20v-4.5h4V20" />
    </svg>
);
const IconUser = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4.2" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7H4Z" />
    </svg>
);
const IconTag = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7a1.5 1.5 0 0 1 1.1.4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.7 7.7a1.5 1.5 0 0 1-2.1 0l-7.3-7.3a1.5 1.5 0 0 1-.5-1Zm4.5-6.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        />
    </svg>
);
const IconArrow = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);
const IconChevronDown = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5} aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
    </svg>
);
const IconChevronUp = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5} aria-hidden="true">
        <path d="m6 15 6-6 6 6" />
    </svg>
);
const IconMail = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
    </svg>
);
const IconPhone = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M6.6 2.5 9.5 3l1.3 4-2 1.5a12 12 0 0 0 6.7 6.7l1.5-2 4 1.3.5 2.9a2 2 0 0 1-2 2.3A17.5 17.5 0 0 1 4.3 4.5a2 2 0 0 1 2.3-2Z" />
    </svg>
);
const IconBag = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M7 8V7a5 5 0 0 1 10 0v1h2.2a1 1 0 0 1 1 1.1l-1 11a1 1 0 0 1-1 .9H5.8a1 1 0 0 1-1-.9l-1-11a1 1 0 0 1 1-1.1H7Zm2 0h6V7a3 3 0 0 0-6 0v1Z" />
    </svg>
);
const IconHeart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 21s-8-5-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6-8 11-8 11Z" />
    </svg>
);
const IconHeadset = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 3a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h1v-7H6v-1a6 6 0 0 1 12 0v1h-2v7h2v.5A2.5 2.5 0 0 1 15.5 21H13v-1.5h2.5a1 1 0 0 0 1-1V19h1a3 3 0 0 0 3-3v-5a8 8 0 0 0-8-8Z" />
    </svg>
);
const IconSun = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
);
const IconMoon = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
    </svg>
);
const IconBook = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5v-15Z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5v-15Z" />
    </svg>
);
const IconHelp = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.100 1-1.100 1.800M12 16.500v.1" />
    </svg>
);
const IconXMark = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5} aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);
const IconSend = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <path d="M21 3 10 14M21 3l-6.500 18-3.500-7-7-3.500L21 3Z" />
    </svg>
);
const IconClock = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const Logo = ({ size = 'w-10 h-10' }) => (
    <img
        src={IMG.logo}
        alt="Logo SmartCash"
        className={`${size} object-contain transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110`}
    />
);

const Badge = ({ children }) => (
    <div className="sc-badge">{children}</div>
);

const FeatureItem = ({ icon, title, desc, tone }) => (
    <div className="group sc-card sc-card-lift h-full rounded-3xl p-6 flex flex-col gap-4 cursor-default">
        <div className={`sc-tone sc-tone-${tone} w-14 h-14 rounded-2xl flex items-center justify-center`}>{icon}</div>
        <div>
            <h4 className="sc-h font-bold text-base">{title}</h4>
            <p className="sc-muted text-sm leading-relaxed mt-2">{desc}</p>
        </div>
    </div>
);

const ScrollHint = ({ to }) => (
    <div className="flex justify-center">
        <a
            href={`#${to}`}
            onClick={(e) => scrollToSection(e, to)}
            aria-label="Gulir ke bagian berikutnya"
            className="sc-btn sc-btn-icon"
        >
            <IconChevronDown />
        </a>
    </div>
);

/* Logo media sosial */
const SocialIcons = {
    facebook: (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor" aria-hidden="true">
            <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.8v8h3.2Z" />
        </svg>
    ),
    instagram: (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor" aria-hidden="true">
            <rect x="3.5" y="9" width="3.6" height="11.5" rx=".6" />
            <circle cx="5.3" cy="5.1" r="2.1" />
            <path d="M10 9h3.3v1.6c.6-1.1 1.9-1.9 3.6-1.9 3.2 0 3.8 2.1 3.8 4.9v6.9h-3.5v-6.1c0-1.5 0-2.8-1.7-2.8s-2 1.3-2 2.7v6.2H10V9Z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"
            />
        </svg>
    ),
};

const SocialLink = ({ label, children }) => (
    <a href="#" onClick={(e) => e.preventDefault()} aria-label={label} title={label} className="sc-social">
        {children}
    </a>
);

const Illustration = ({ src, alt, className = '', eager = false }) => (
    <img
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        className={`w-full h-auto select-none ${className}`}
    />
);

/* ================================================================== */
/*  PUSAT BANTUAN, FAQ, DAN HUBUNGI KAMI                               */
/*  Ubah isi di bagian konstanta ini sesuai data resmi SmartCash.      */
/* ================================================================== */
const CONTACT = {
    email: 'support@smartcash.id',
    phone: '(021) 1234 5678',
    phoneHref: 'tel:+622112345678',
    hours: 'Senin - Sabtu, 08.00 - 17.00 WIB',
};

const SUPPORT_LINKS = [
    { key: 'help', label: 'Pusat Bantuan' },
    { key: 'contact', label: 'Hubungi Kami' },
    { key: 'faq', label: 'FAQ' },
];

const HELP_TOPICS = [
    {
        id: 'mulai',
        title: 'Memulai SmartCash',
        steps: [
            'Klik "Mulai Sekarang", lalu isi nama toko, nama pemilik, username, email, dan kata sandi.',
            'Setelah terdaftar, Kode Unik Toko dibuat otomatis (contoh: STR-K7P2QX). Catat kode ini.',
            'Buka menu Pengaturan untuk melengkapi alamat, nomor telepon, dan banner toko.',
        ],
    },
    {
        id: 'login',
        title: 'Masuk ke Aplikasi',
        steps: [
            'Buka halaman Login, lalu isi Kode Toko, username, dan kata sandi.',
            'Staf memakai Kode Toko yang sama dengan pemilik, tetapi username dan kata sandi masing-masing.',
            'Lupa kata sandi? Klik "Lupa password?" lalu ikuti tautan yang dikirim ke email Anda.',
        ],
    },
    {
        id: 'pos',
        title: 'Melakukan Transaksi di POS Kasir',
        steps: [
            'Buka menu POS Kasir, cari atau pilih produk, lalu klik untuk memasukkannya ke keranjang.',
            'Atur jumlah barang dengan tombol + dan -, lalu pilih promo bila ada.',
            'Masukkan uang diterima dengan tombol pintasan nominal atau Uang Pas. Kembalian dihitung otomatis.',
            'Klik "Bayar & Cetak Struk" untuk menyelesaikan transaksi.',
        ],
    },
    {
        id: 'stok',
        title: 'Mengelola Produk dan Stok',
        steps: [
            'Di Kelola Produk, tambahkan barang beserta kategori, supplier, harga, stok, dan foto (berupa link).',
            'Saat barang masuk dari supplier, catat lewat Restock Barang agar stok bertambah otomatis.',
            'Produk dengan stok 10 atau kurang tampil di peringatan Stok Menipis pada Dashboard.',
        ],
    },
    {
        id: 'promo',
        title: 'Membuat Diskon dan Promo',
        steps: [
            'Buka Kelola Diskon, lalu klik "Buat Promo Baru".',
            'Pilih potongan persentase atau nominal, isi minimal belanja, dan atur masa berlaku.',
            'Promo berstatus Berlaku akan muncul sebagai pilihan di halaman POS Kasir.',
        ],
    },
    {
        id: 'laporan',
        title: 'Laporan dan Pembatalan Transaksi',
        steps: [
            'Buka Laporan Penjualan, lalu pilih rentang tanggal atau pintasan seperti 7 Hari.',
            'Riwayat transaksi menampilkan detail belanja, diskon, dan status setiap transaksi.',
            'Transaksi dapat dibatalkan dalam 24 jam lewat tombol Batalkan, dan stok barang dikembalikan otomatis.',
        ],
    },
    {
        id: 'staf',
        title: 'Mengatur Staf dan Hak Akses',
        steps: [
            'Buka Kelola Staf / User, lalu klik "Tambah User Baru".',
            'Pilih role Kasir (POS dan transaksi) atau Admin (akses penuh).',
            'Berikan Kode Toko, username, dan kata sandi kepada staf agar mereka bisa login.',
        ],
    },
    {
        id: 'tampilan',
        title: 'Tampilan dan Keamanan Akun',
        steps: [
            'Di Pengaturan > Tampilan, pilih salah satu dari empat tema warna aplikasi.',
            'Di Pengaturan > Profil & Banner, ganti banner Dashboard dengan foto unggahan atau link gambar.',
            'Di Pengaturan > Keamanan Akun, ubah nama, username, email, dan kata sandi Anda.',
        ],
    },
];

const FAQ_ITEMS = [
    {
        q: 'Apa itu SmartCash?',
        a: 'SmartCash adalah aplikasi kasir (Point of Sale) berbasis web untuk membantu pelaku usaha mengelola transaksi, stok barang, promo, dan laporan penjualan dalam satu tempat.',
    },
    {
        q: 'Bagaimana cara mendaftarkan toko saya?',
        a: 'Klik tombol "Mulai Sekarang", lalu isi nama toko, nama pemilik, username, email, dan kata sandi. Setelah itu akun pemilik (Admin) langsung aktif dan Anda masuk ke Dashboard.',
    },
    {
        q: 'Apa itu Kode Unik Toko dan untuk apa?',
        a: 'Kode Unik Toko adalah identitas toko Anda di sistem. Saat login, Anda dan staf mengisi Kode Toko, username, dan kata sandi. Kode dibuat otomatis saat mendaftar dan dapat diganti oleh Admin di menu Pengaturan.',
    },
    {
        q: 'Bagaimana cara menambah kasir atau staf?',
        a: 'Masuk sebagai Admin, buka menu Kelola Staf / User, lalu klik "Tambah User Baru". Isi nama, username, email, dan kata sandi, kemudian pilih role Kasir atau Admin.',
    },
    {
        q: 'Apa bedanya role Admin dan Kasir?',
        a: 'Kasir dapat memakai Dashboard dan POS Kasir untuk melayani transaksi. Admin memiliki akses penuh, termasuk kelola produk, restock, supplier, diskon, laporan penjualan, staf, dan pengaturan toko.',
    },
    {
        q: 'Bagaimana stok diperbarui?',
        a: 'Stok berkurang otomatis setiap ada transaksi dan bertambah lewat menu Restock Barang saat barang masuk dari supplier. Produk dengan stok 10 atau kurang muncul sebagai peringatan di Dashboard.',
    },
    {
        q: 'Bagaimana cara membuat diskon atau promo?',
        a: 'Buka Kelola Diskon, lalu buat promo berupa potongan persentase atau nominal, dengan syarat minimal belanja dan masa berlaku. Promo yang sedang berlaku akan muncul di halaman POS Kasir.',
    },
    {
        q: 'Apakah transaksi yang salah bisa dibatalkan?',
        a: 'Bisa. Admin dapat membatalkan transaksi lewat menu Laporan Penjualan dalam waktu 24 jam. Stok barang akan dikembalikan otomatis dan transaksi tidak dihitung sebagai omzet.',
    },
    {
        q: 'Saya lupa kata sandi, apa yang harus dilakukan?',
        a: 'Di halaman Login, klik "Lupa password?", lalu masukkan email akun Anda. Tautan untuk membuat kata sandi baru akan dikirim ke email tersebut. Periksa juga folder spam.',
    },
    {
        q: 'Bisakah tampilan aplikasi disesuaikan?',
        a: 'Bisa. Admin dapat memilih tema warna dan mengganti banner Dashboard dengan foto sendiri lewat menu Pengaturan.',
    },
];

const SUPPORT_TOPICS = ['Pertanyaan umum', 'Kendala teknis', 'Akun dan kata sandi', 'Saran fitur', 'Lainnya'];

const SearchBox = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <span className="sc-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <IconSearch className="w-[18px] h-[18px]" />
        </span>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="sc-input sc-input-search"
        />
        {value && (
            <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Hapus pencarian"
                className="sc-iconbtn-sm absolute right-2 top-1/2 -translate-y-1/2"
            >
                <IconXMark className="w-3 h-3" />
            </button>
        )}
    </div>
);

const EmptyResult = ({ onContact }) => (
    <div className="text-center py-10">
        <span className="sc-muted inline-block">
            <IconHelp className="w-10 h-10" />
        </span>
        <p className="sc-h text-sm font-semibold mt-2">Tidak ada hasil yang cocok</p>
        <p className="sc-muted text-xs mt-1">Coba kata kunci lain, atau hubungi tim kami langsung.</p>
        <button type="button" onClick={onContact} className="sc-btn sc-btn-soft mt-4">
            Hubungi Kami
        </button>
    </div>
);

/* ---------- tab: Pusat Bantuan ---------- */
function HelpTab({ onContact }) {
    const [q, setQ] = useState('');
    const query = q.trim().toLowerCase();
    const topics = HELP_TOPICS.filter((t) => !query || `${t.title} ${t.steps.join(' ')}`.toLowerCase().includes(query));

    return (
        <div className="space-y-5">
            <SearchBox value={q} onChange={setQ} placeholder="Cari panduan, misalnya: stok, diskon, laporan..." />

            {topics.length === 0 ? (
                <EmptyResult onContact={onContact} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topics.map((t) => (
                        <div key={t.id} className="group sc-card sc-card-lift rounded-2xl p-5">
                            <h4 className="sc-h text-sm font-bold flex items-center gap-2.5">
                                <span className="sc-tone sc-tone-sky w-9 h-9 shrink-0 rounded-lg flex items-center justify-center">
                                    <IconBook className="w-4 h-4" />
                                </span>
                                {t.title}
                            </h4>
                            <ol className="mt-3 space-y-2">
                                {t.steps.map((s, i) => (
                                    <li key={i} className="sc-body flex gap-2.5 text-xs leading-relaxed">
                                        <span className="sc-num">{i + 1}</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---------- tab: FAQ ---------- */
function FaqTab({ onContact }) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(0);
    const query = q.trim().toLowerCase();
    const items = FAQ_ITEMS.map((f, i) => ({ ...f, i })).filter((f) => !query || `${f.q} ${f.a}`.toLowerCase().includes(query));

    return (
        <div className="space-y-5">
            <SearchBox value={q} onChange={setQ} placeholder="Cari pertanyaan..." />

            {items.length === 0 ? (
                <EmptyResult onContact={onContact} />
            ) : (
                <div className="space-y-2.5">
                    {items.map((f) => {
                        const isOpen = open === f.i || Boolean(query);
                        return (
                            <div key={f.i} className={`sc-faq ${isOpen ? 'is-open' : ''}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(open === f.i ? -1 : f.i)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 min-h-[52px] rounded-2xl"
                                >
                                    <span className="sc-h text-sm font-bold">{f.q}</span>
                                    <span className="sc-chev">
                                        <IconChevronDown className="w-4 h-4" />
                                    </span>
                                </button>
                                <div
                                    aria-hidden={!isOpen}
                                    className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="sc-body px-5 pb-4 text-sm leading-relaxed">{f.a}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ---------- tab: Hubungi Kami ---------- */
function ContactTab() {
    const [form, setForm] = useState({ name: '', email: '', topic: SUPPORT_TOPICS[0], message: '' });
    const [touched, setTouched] = useState({});
    const [sent, setSent] = useState(false);

    const set = (k, v) => {
        setSent(false);
        setForm((f) => ({ ...f, [k]: v }));
    };
    const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));

    const errors = {
        name: form.name.trim().length < 2 ? 'Nama wajib diisi.' : '',
        email: !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Masukkan alamat email yang valid.' : '',
        message: form.message.trim().length < 10 ? 'Pesan minimal 10 karakter.' : '',
    };
    const hasError = Boolean(errors.name || errors.email || errors.message);

    const submit = (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, message: true });
        if (hasError) return;

        const subject = `[${form.topic}] Pesan dari ${form.name.trim()}`;
        const body = `Halo tim SmartCash,\n\n${form.message.trim()}\n\n---\nNama: ${form.name.trim()}\nEmail: ${form.email.trim()}\nTopik: ${form.topic}`;
        window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSent(true);
    };

    const fieldCls = (err) => `sc-input${err ? ' is-invalid' : ''}`;

    const channels = [
        { icon: <IconMail />, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
        { icon: <IconPhone />, label: 'Telepon', value: CONTACT.phone, href: CONTACT.phoneHref },
        { icon: <IconClock />, label: 'Jam Layanan', value: CONTACT.hours },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* saluran kontak */}
            <div className="md:col-span-2 space-y-3">
                {channels.map((c) => {
                    const inner = (
                        <>
                            <span className="sc-tone sc-tone-sky w-10 h-10 shrink-0 rounded-xl flex items-center justify-center">
                                {c.icon}
                            </span>
                            <span className="min-w-0">
                                <span className="sc-muted block text-xs font-semibold">{c.label}</span>
                                <span className="sc-h block text-sm font-bold break-words">{c.value}</span>
                            </span>
                        </>
                    );
                    return c.href ? (
                        <a key={c.label} href={c.href} className="group sc-card sc-card-lift flex items-center gap-3 rounded-2xl p-4">
                            {inner}
                        </a>
                    ) : (
                        <div key={c.label} className="sc-card flex items-center gap-3 rounded-2xl p-4">
                            {inner}
                        </div>
                    );
                })}
                <p className="sc-muted text-xs leading-relaxed px-1">
                    Untuk pertanyaan umum, cek dulu Pusat Bantuan dan FAQ. Jawabannya sering sudah ada di sana.
                </p>
            </div>

            {/* formulir */}
            <form onSubmit={submit} noValidate className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sc-contact-name" className="sc-h block text-xs font-semibold mb-1.5">Nama</label>
                        <input
                            id="sc-contact-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            onBlur={() => touch('name')}
                            placeholder="Nama Anda"
                            autoComplete="name"
                            aria-invalid={Boolean(touched.name && errors.name)}
                            className={fieldCls(touched.name && errors.name)}
                        />
                        {touched.name && errors.name && <p className="sc-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="sc-contact-email" className="sc-h block text-xs font-semibold mb-1.5">Email</label>
                        <input
                            id="sc-contact-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            onBlur={() => touch('email')}
                            placeholder="email@domain.com"
                            autoComplete="email"
                            aria-invalid={Boolean(touched.email && errors.email)}
                            className={fieldCls(touched.email && errors.email)}
                        />
                        {touched.email && errors.email && <p className="sc-error">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="sc-contact-topic" className="sc-h block text-xs font-semibold mb-1.5">Topik</label>
                    <select
                        id="sc-contact-topic"
                        value={form.topic}
                        onChange={(e) => set('topic', e.target.value)}
                        className={fieldCls(false)}
                    >
                        {SUPPORT_TOPICS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="sc-contact-message" className="sc-h block text-xs font-semibold">Pesan</label>
                        <span className="sc-muted text-xs tabular-nums">{form.message.trim().length} karakter</span>
                    </div>
                    <textarea
                        id="sc-contact-message"
                        rows={4}
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        onBlur={() => touch('message')}
                        placeholder="Tulis kendala atau pertanyaan Anda selengkap mungkin"
                        aria-invalid={Boolean(touched.message && errors.message)}
                        className={`${fieldCls(touched.message && errors.message)} resize-none`}
                    />
                    {touched.message && errors.message && <p className="sc-error">{errors.message}</p>}
                </div>

                <button type="submit" className="group sc-btn sc-btn-primary sc-btn-block">
                    Kirim Pesan
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                        <IconSend />
                    </span>
                </button>

                <p className="sc-muted text-xs leading-relaxed" aria-live="polite">
                    {sent
                        ? 'Aplikasi email Anda dibuka dengan pesan yang sudah terisi. Tekan Kirim di sana untuk menyelesaikan.'
                        : 'Tombol ini membuka aplikasi email Anda dengan pesan yang sudah terisi, ditujukan ke ' + CONTACT.email + '.'}
                </p>
            </form>
        </div>
    );
}

/* ---------- jendela dukungan (3 tab) ---------- */
function SupportModal({ tab, onTab, onClose }) {
    const panelRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const previous = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        if (panelRef.current) panelRef.current.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') {
                closeRef.current();
                return;
            }
            // perangkap fokus: Tab tetap berputar di dalam jendela
            if (e.key === 'Tab' && panelRef.current) {
                const focusable = panelRef.current.querySelectorAll(
                    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const current = document.activeElement;
                if (e.shiftKey && (current === first || current === panelRef.current)) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && current === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            if (previous && typeof previous.focus === 'function') previous.focus();
        };
    }, []);

    const tabs = [
        { key: 'help', label: 'Pusat Bantuan', icon: <IconBook className="w-4 h-4" /> },
        { key: 'faq', label: 'FAQ', icon: <IconHelp className="w-4 h-4" /> },
        { key: 'contact', label: 'Hubungi Kami', icon: <IconMail className="w-4 h-4" /> },
    ];
    const titles = {
        help: ['Pusat Bantuan', 'Panduan singkat memakai SmartCash dari awal sampai laporan.'],
        faq: ['Pertanyaan yang Sering Diajukan', 'Jawaban cepat untuk pertanyaan paling umum.'],
        contact: ['Hubungi Kami', 'Tim kami siap membantu kendala dan pertanyaan Anda.'],
    };

    return (
        <div onClick={onClose} className="sc-fade sc-overlay fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4">
            <div
                ref={panelRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={titles[tab][0]}
                className="sc-pop sc-modal w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[92dvh] flex flex-col overflow-hidden"
            >
                <div className="sc-modal-head px-5 sm:px-6 pt-5 pb-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="sc-h text-lg font-extrabold tracking-tight">{titles[tab][0]}</h3>
                            <p className="sc-muted text-xs mt-0.5">{titles[tab][1]}</p>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Tutup" className="sc-iconbtn -mt-1 -mr-2">
                            <IconXMark className="w-5 h-5" />
                        </button>
                    </div>

                    <div role="tablist" className="flex gap-1 mt-3 overflow-x-auto">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                role="tab"
                                aria-selected={tab === t.key}
                                onClick={() => onTab(t.key)}
                                className="sc-tab"
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div key={tab} className="sc-fade flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
                    {tab === 'help' && <HelpTab onContact={() => onTab('contact')} />}
                    {tab === 'faq' && <FaqTab onContact={() => onTab('contact')} />}
                    {tab === 'contact' && <ContactTab />}
                </div>
            </div>
        </div>
    );
}

/* ================================================================== */
/*  HALAMAN UTAMA                                                      */
/* ================================================================== */
export default function Welcome({ canLogin, canRegister, auth }) {
    const [active, setActive] = useState('beranda');
    const [scrolled, setScrolled] = useState(false);
    const [support, setSupport] = useState(null); // null | 'help' | 'faq' | 'contact'
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const progressRef = useRef(null);
    const rootRef = useRef(null);

    const { theme, isDark, toggleTheme } = usePublicTheme();

    /* Sinkronkan atribut tema ke dokumen (dipakai bagian lain aplikasi) */
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    /* Semua efek terkait scroll dalam satu listener (dibatasi rAF) */
    useEffect(() => {
        let ticking = false;

        const update = () => {
            ticking = false;
            const y = window.scrollY;
            const vh = window.innerHeight;

            setScrolled(y > 8);
            setShowTop(y > 600);

            // progress bar
            const max = document.documentElement.scrollHeight - vh;
            if (progressRef.current) progressRef.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

            // menu aktif
            let current = NAV_ITEMS[0].id;
            for (const item of NAV_ITEMS) {
                const el = document.getElementById(item.id);
                if (el && el.getBoundingClientRect().top - 120 <= 0) current = item.id;
            }
            if (vh + y >= document.body.scrollHeight - 4) current = NAV_ITEMS[NAV_ITEMS.length - 1].id;
            setActive(current);
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    /* Esc menutup menu mobile */
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const go = (e, id) => {
        setMenuOpen(false);
        scrollToSection(e, id);
    };

    const features = [
        { icon: <IconBolt />, title: 'Transaksi Cepat', desc: 'POS 4 kolom dengan tombol pecahan pintas dan kalkulator kembalian otomatis.', tone: 'indigo' },
        { icon: <IconBox />, title: 'Manajemen Stok', desc: 'Pantau pergerakan stok barang secara real-time dan kelola inventaris toko.', tone: 'indigo' },
        { icon: <IconChart />, title: 'Laporan Penjualan', desc: 'Rekap penjualan dan performa transaksi toko secara otomatis dan transparan.', tone: 'indigo' },
        { icon: <IconStore />, title: 'Sistem Multi-Tenant', desc: 'Kelola banyak toko dalam satu aplikasi dengan data terisolasi dan Kode Unik Toko.', tone: 'indigo' },
        { icon: <IconUser />, title: 'Kelola Karyawan', desc: 'Atur peran (Admin & Kasir), hak akses, dan aktivitas staf lewat pop-up praktis.', tone: 'indigo' },
        { icon: <IconTag />, title: 'Diskon & Promo Fleksibel', desc: 'Atur promo toko dan aktifkan atau nonaktifkan kapan saja untuk menarik pelanggan.', tone: 'indigo' },
    ];

    const steps = [
        { title: 'Daftar Akun', desc: 'Buat akun SmartCash dengan cepat.' },
        { title: 'Atur Toko', desc: 'Masukkan data toko dan produk Anda.' },
        { title: 'Mulai Transaksi', desc: 'Aplikasi siap digunakan untuk operasional bisnis.' },
    ];

    const stats = [
        { icon: <IconBag />, value: 'POS', label: 'Transaksi praktis' },
        { icon: <IconHeart />, value: 'Stok', label: 'Lebih terpantau' },
        { icon: <IconHeadset />, value: 'Data', label: 'Laporan terukur' },
    ];

    return (
        <div ref={rootRef} data-mode={isDark ? 'dark' : 'light'} className="sc-landing min-h-screen overflow-x-hidden">
            <Head title="SmartCash - Solusi Kasir Modern">
                <meta name="theme-color" content={isDark ? '#0A1230' : '#F3F7FF'} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
                />
            </Head>
            <style>{css}</style>

            <a href="#konten" className="sc-skip">
                Lewati ke konten utama
            </a>

            {/* ===================== NAVBAR ===================== */}
            <header className={`sc-header fixed top-0 inset-x-0 z-50 ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
                <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[72px] flex items-center justify-between gap-6">
                    <a href="#beranda" onClick={(e) => go(e, 'beranda')} className="group flex items-center gap-2.5" aria-label="SmartCash, kembali ke beranda">
                        <span className="sc-logo-tile">
                            <Logo size="w-10 h-10" />
                        </span>
                        <span>
                            <span className="sc-h block text-[22px] font-extrabold tracking-tight leading-none">
                                Smart<span className="sc-hl">Cash</span>
                            </span>
                            <span className="sc-muted hidden sm:block text-xs font-medium mt-1">Solusi Kasir Modern</span>
                        </span>
                    </a>

                    <nav className="hidden lg:flex items-center gap-6 xl:gap-9" aria-label="Navigasi utama">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                                aria-current={active === item.id ? 'true' : undefined}
                                className="sc-nav-link"
                            >
                                {item.label}
                                <span className="sc-nav-bar" />
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isDark}
                            onClick={() => toggleTheme(rootRef.current)}
                            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                            title={isDark ? 'Mode terang' : 'Mode gelap'}
                            className="sc-btn sc-btn-icon sc-theme-btn"
                        >
                            <span className={`sc-theme-icon ${isDark ? '' : 'is-off'}`}>
                                <IconSun />
                            </span>
                            <span className={`sc-theme-icon ${isDark ? 'is-off' : ''}`}>
                                <IconMoon />
                            </span>
                        </button>

                        {auth?.user ? (
                            <Link href={route('dashboard')} className="sc-btn sc-btn-primary sc-sm-up">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')} className="sc-link sc-sm-up">
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link href={route('register')} className="group sc-btn sc-btn-primary sc-sm-up">
                                        Mulai Sekarang
                                        <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="sc-btn sc-btn-icon sc-below-lg"
                            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                            aria-expanded={menuOpen}
                            aria-controls="sc-mobile-menu"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" {...iconProps} aria-hidden="true">
                                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                            </svg>
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <nav id="sc-mobile-menu" aria-label="Navigasi seluler" className="sc-menu lg:hidden px-5 sm:px-6 py-3 flex flex-col">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                                aria-current={active === item.id ? 'true' : undefined}
                                className="sc-menu-link"
                            >
                                {item.label}
                            </a>
                        ))}
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="sc-btn sc-btn-primary sc-btn-block mt-2 mb-2 sm:!hidden">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')} className="sc-menu-link sm:!hidden">
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link href={route('register')} className="sc-btn sc-btn-primary sc-btn-block mt-2 mb-2 sm:!hidden">
                                        Mulai Sekarang
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                )}

                {/* garis progress scroll */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent">
                    <div ref={progressRef} className="sc-progress h-full w-0 rounded-r-full" />
                </div>
            </header>

            <main id="konten" tabIndex={-1} className="outline-none">
                {/* ===================== BERANDA ===================== */}
                <section
                    id="beranda"
                    className="sc-bg relative scroll-mt-[72px] min-h-[calc(100svh-72px)] pt-[72px] flex flex-col overflow-hidden"
                >
                    <div className="relative flex-1 max-w-7xl w-full mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-12 lg:gap-20 items-center py-14 sm:py-20">
                        <div className="space-y-6 max-w-xl">
                            <Reveal>
                                <Badge>Satu sistem untuk bisnis yang terus bergerak</Badge>
                            </Reveal>

                            <Reveal delay={120}>
                                <h1 className="sc-h text-[2rem] sm:text-5xl lg:text-[60px] font-extrabold tracking-tight leading-[1.08]">
                                    Kasir Lebih Sigap.
                                    <br />
                                    <span className="sc-hl">Bisnis Lebih Terkendali.</span>
                                </h1>
                            </Reveal>

                            <Reveal delay={240}>
                                <p className="sc-body text-base sm:text-lg leading-relaxed max-w-lg">
                                    Layani pelanggan, pantau stok, dan pahami penjualan dari satu aplikasi kasir modern yang
                                    dibuat untuk menyederhanakan operasional toko.
                                </p>
                            </Reveal>

                            <Reveal delay={360}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                                    {!auth?.user && canRegister && (
                                        <Link href={route('register')} className="group sc-btn sc-btn-primary sc-btn-lg">
                                            Coba SmartCash
                                            <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                                        </Link>
                                    )}
                                    {auth?.user && (
                                        <Link href={route('dashboard')} className="group sc-btn sc-btn-primary sc-btn-lg">
                                            Buka Dashboard
                                            <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSupport('help')}
                                        className="sc-btn sc-btn-outline sc-btn-lg"
                                    >
                                        Lihat Pusat Bantuan
                                    </button>
                                </div>
                            </Reveal>

                            <Reveal delay={480}>
                                <div className="sc-muted flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-medium">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="sc-dot sc-dot-ok" />
                                        Transaksi dan stok dalam satu alur
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="sc-dot sc-dot-sky" />
                                        Akses mudah dari browser
                                    </span>
                                </div>
                            </Reveal>
                        </div>

                        <Reveal variant="zoom" delay={200}>
                            <div className="relative mx-auto w-full max-w-[620px]">
                                <div className="sc-card sc-shadow-lg relative rounded-3xl p-3 sm:p-5">
                                    <div className="flex items-center justify-between px-3 pb-3 pt-1">
                                        <div className="flex items-center gap-2" aria-hidden="true">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        </div>
                                        <span className="sc-pill">Smart POS</span>
                                    </div>
                                    <div className="sc-stage rounded-2xl">
                                        <Illustration
                                            src={IMG.hero}
                                            eager
                                            alt="Kasir menggunakan aplikasi SmartCash untuk melayani pelanggan"
                                        />
                                    </div>
                                </div>
                                <div className="sc-card sc-shadow-md absolute -left-2 top-[18%] hidden items-center gap-3 rounded-2xl p-3 sm:flex sm:-left-8 sm:p-4">
                                    <span className="sc-tone sc-tone-ok flex h-10 w-10 items-center justify-center rounded-xl">
                                        <IconBolt className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="sc-muted block text-xs font-semibold">Kasir aktif</span>
                                        <span className="sc-h block text-sm font-bold">Transaksi cepat</span>
                                    </span>
                                </div>
                                <div className="sc-card sc-shadow-md absolute -bottom-4 right-1 flex items-center gap-3 rounded-2xl p-3 sm:-right-5 sm:p-4">
                                    <span className="sc-tone sc-tone-indigo flex h-10 w-10 items-center justify-center rounded-xl">
                                        <IconChart className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="sc-muted block text-xs font-semibold">Ringkasan usaha</span>
                                        <span className="sc-h block text-sm font-bold">Semua lebih terpantau</span>
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="relative pb-6">
                        <ScrollHint to="fitur" />
                    </div>
                </section>

                {/* ===================== FITUR ===================== */}
                <section id="fitur" className="sc-bg-alt scroll-mt-[72px] py-20 sm:py-24">
                    <div className="max-w-7xl w-full mx-auto px-5 sm:px-6 space-y-10">
                        <div className="max-w-2xl space-y-4">
                            <Reveal>
                                <Badge>Fitur Unggulan</Badge>
                            </Reveal>
                            <Reveal delay={100}>
                                <h2 className="sc-h text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                    Semua kebutuhan toko, <span className="sc-hl">dalam satu tempat.</span>
                                </h2>
                            </Reveal>
                            <Reveal delay={200}>
                                <p className="sc-body max-w-xl leading-relaxed">
                                    Dari melayani pelanggan hingga memantau hasil penjualan, SmartCash membantu menjaga alur kerja tetap rapi.
                                </p>
                            </Reveal>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((f, i) => (
                                <Reveal key={f.title} delay={i * 70} className="h-full">
                                    <FeatureItem {...f} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===================== CARA KERJA ===================== */}
                <section id="cara-kerja" className="sc-bg scroll-mt-[72px] py-20 sm:py-24">
                    <div className="max-w-7xl w-full mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="max-w-2xl space-y-4">
                                <Reveal variant="left">
                                    <Badge>Cara Kerja</Badge>
                                </Reveal>
                                <Reveal variant="left" delay={100}>
                                    <h2 className="sc-h text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                        Mulai Menggunakan <span className="sc-hl">SmartCash</span>
                                        <br />
                                        dalam 3 Langkah Mudah
                                    </h2>
                                </Reveal>
                            </div>

                            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {steps.map((s, i) => (
                                    <li key={s.title}>
                                        <Reveal delay={200 + i * 120} className="h-full">
                                            <div className="group sc-card sc-card-lift h-full flex flex-col gap-5 rounded-2xl p-5">
                                                <span className="sc-tone sc-tone-indigo flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold">
                                                    0{i + 1}
                                                </span>
                                                <div>
                                                    <h4 className="sc-h font-bold text-sm">{s.title}</h4>
                                                    <p className="sc-muted text-sm leading-relaxed mt-1">{s.desc}</p>
                                                </div>
                                            </div>
                                        </Reveal>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="lg:col-span-5">
                            <Reveal variant="right" delay={150}>
                                <div className="sc-card sc-shadow-lg rounded-3xl p-3 sm:p-5">
                                    <div className="sc-stage rounded-2xl">
                                        <Illustration
                                            src={IMG.dashboard}
                                            alt="Tampilan dashboard SmartCash di laptop"
                                        />
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ===================== TENTANG KAMI ===================== */}
                <section id="tentang" className="sc-bg-alt scroll-mt-[72px] py-20 sm:py-24">
                    <div className="max-w-7xl w-full mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 space-y-6 max-w-xl lg:order-1">
                            <Reveal variant="left">
                                <Badge>Tentang SmartCash</Badge>
                            </Reveal>
                            <Reveal variant="left" delay={100}>
                                <h2 className="sc-h text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                    Bersama Membangun
                                    <br />
                                    <span className="sc-hl">Bisnis yang Lebih Baik</span>
                                </h2>
                            </Reveal>
                            <Reveal variant="left" delay={200}>
                                <p className="sc-body leading-relaxed">
                                    SmartCash adalah solusi kasir modern yang dirancang untuk membantu para pelaku usaha di
                                    Indonesia mengelola bisnis secara lebih mudah, efisien, dan aman.
                                </p>
                            </Reveal>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                                {stats.map((s, i) => (
                                    <Reveal key={s.label} delay={300 + i * 120} className="h-full">
                                        <div className="group sc-card sc-card-lift h-full flex flex-col gap-3 rounded-2xl px-4 py-4">
                                            <span className="sc-accent">{s.icon}</span>
                                            <div>
                                                <div className="sc-h font-extrabold leading-none">{s.value}</div>
                                                <div className="sc-muted text-xs mt-1">{s.label}</div>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                            {!auth?.user && canRegister && (
                                <Reveal delay={650}>
                                    <Link href={route('register')} className="group sc-btn sc-btn-primary">
                                        Mulai gunakan SmartCash
                                        <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Reveal>
                            )}
                        </div>

                        <Reveal variant="left" delay={150} className="order-1 lg:order-2">
                            <div className="sc-card sc-shadow-lg rounded-3xl p-3 sm:p-5">
                                <div className="sc-stage rounded-2xl">
                                    <Illustration
                                        src={IMG.tim}
                                        alt="Tim SmartCash bekerja bersama"
                                    />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ===================== FOOTER ===================== */}
            <footer className="sc-footer">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <Reveal className="space-y-4">
                        <a href="#beranda" onClick={(e) => go(e, 'beranda')} className="group sc-f-brand flex w-fit items-center gap-2.5" aria-label="SmartCash, kembali ke beranda">
                            <span className="sc-f-logo w-11 h-11 rounded-xl p-1.5 flex items-center justify-center">
                                <Logo size="w-full h-full" />
                            </span>
                            <span>
                                <span className="sc-h block text-2xl font-extrabold tracking-tight leading-none">
                                    Smart<span className="sc-hl">Cash</span>
                                </span>
                                <span className="sc-muted block text-xs font-medium mt-1">Solusi Kasir Modern</span>
                            </span>
                        </a>
                        <p className="text-sm leading-relaxed max-w-[220px]">Solusi kasir modern untuk mengelola bisnis Anda.</p>
                        <div className="flex items-center gap-3 pt-1">
                            <SocialLink label="Facebook">{SocialIcons.facebook}</SocialLink>
                            <SocialLink label="Instagram">{SocialIcons.instagram}</SocialLink>
                            <SocialLink label="LinkedIn">{SocialIcons.linkedin}</SocialLink>
                            <SocialLink label="YouTube">{SocialIcons.youtube}</SocialLink>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <h5 className="sc-f-h font-semibold text-sm mb-3">Navigasi</h5>
                        <ul className="text-sm">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.id}>
                                    <a href={`#${item.id}`} onClick={(e) => go(e, item.id)} className="sc-f-link">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={200}>
                        <h5 className="sc-f-h font-semibold text-sm mb-3">Dukungan</h5>
                        <ul className="text-sm">
                            {SUPPORT_LINKS.map((l) => (
                                <li key={l.key}>
                                    <button type="button" onClick={() => setSupport(l.key)} className="sc-f-link">
                                        {l.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={300}>
                        <h5 className="sc-f-h font-semibold text-sm mb-3">Hubungi Kami</h5>
                        <ul className="text-sm">
                            <li>
                                <a href={`mailto:${CONTACT.email}`} className="group sc-f-link gap-3">
                                    <span className="sc-f-sky transition-transform duration-300 group-hover:scale-125">
                                        <IconMail />
                                    </span>
                                    {CONTACT.email}
                                </a>
                            </li>
                            <li>
                                <a href={CONTACT.phoneHref} className="group sc-f-link gap-3">
                                    <span className="sc-f-sky transition-transform duration-300 group-hover:scale-125">
                                        <IconPhone />
                                    </span>
                                    {CONTACT.phone}
                                </a>
                            </li>
                            <li className="sc-f-muted flex items-center gap-3 min-h-[40px]">
                                <span className="sc-f-sky">
                                    <IconClock />
                                </span>
                                {CONTACT.hours}
                            </li>
                        </ul>
                        <button type="button" onClick={() => setSupport('contact')} className="sc-footer-btn mt-4">
                            Kirim Pesan
                            <IconArrow />
                        </button>
                    </Reveal>
                </div>

                <div className="sc-f-line sc-f-muted py-5 px-5 sm:px-6 text-center text-xs">
                    &copy; {new Date().getFullYear()} SmartCash. All rights reserved. Developed by Rashhff and FernCode.
                </div>
            </footer>

            {support && <SupportModal tab={support} onTab={setSupport} onClose={() => setSupport(null)} />}

            {/* tombol kembali ke atas */}
            <button
                type="button"
                onClick={(e) => scrollToSection(e, 'beranda')}
                aria-label="Kembali ke atas"
                tabIndex={showTop ? 0 : -1}
                className={`sc-btn sc-btn-primary sc-btn-round sc-top fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 sm:right-6 z-50 ${showTop ? '' : 'is-hidden'}`}
            >
                <IconChevronUp />
            </button>
        </div>
    );
}