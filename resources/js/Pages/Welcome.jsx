import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

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
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${id}`);
    }
};

/* ================================================================== */
/*  CSS ANIMASI                                                        */
/* ================================================================== */
const css = `
@keyframes sc-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
@keyframes sc-drift { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(22px,-18px) scale(1.08) } }
@keyframes sc-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
@keyframes sc-nudge { 0%,100% { transform: translateX(0) } 50% { transform: translateX(5px) } }
@keyframes sc-ring { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,.45) } 70%,100% { box-shadow: 0 0 0 16px rgba(37,99,235,0) } }
@keyframes sc-twinkle { 0%,100% { opacity:.25; transform: scale(.8) } 50% { opacity:.9; transform: scale(1.15) } }

.sc-float  { animation: sc-float 6s ease-in-out infinite }
.sc-drift  { animation: sc-drift 14s ease-in-out infinite }
.sc-bounce { animation: sc-bounce 1.6s ease-in-out infinite }
.sc-nudge  { animation: sc-nudge 1.4s ease-in-out infinite }
.sc-ring   { animation: sc-ring 2.2s ease-out infinite }
.sc-twinkle{ animation: sc-twinkle 3s ease-in-out infinite }

/* efek kilau pada tombol */
.sc-shine { position: relative; overflow: hidden }
.sc-shine::after {
    content: ''; position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,.4), transparent);
    transform: skewX(-20deg); transition: left .7s ease;
}
.sc-shine:hover::after { left: 140% }

/* muncul saat di-scroll */
.sc-reveal { opacity: 0; transition: opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1) }
.sc-up    { transform: translateY(36px) }
.sc-left  { transform: translateX(-52px) }
.sc-right { transform: translateX(52px) }
.sc-zoom  { transform: scale(.88) }
.sc-reveal.sc-in { opacity: 1; transform: none }

@media (prefers-reduced-motion: reduce) {
    .sc-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
    .sc-float,.sc-drift,.sc-bounce,.sc-nudge,.sc-ring,.sc-twinkle { animation: none !important }
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

/* Gambar miring 3D mengikuti kursor */
const Tilt = ({ children, max = 7, className = '' }) => {
    const ref = useRef(null);
    const move = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale3d(1.02,1.02,1.02)`;
    };
    const leave = () => {
        if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };
    return (
        <div
            ref={ref}
            onMouseMove={move}
            onMouseLeave={leave}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
        >
            {children}
        </div>
    );
};

/* Angka naik dari 0 saat terlihat */
const CountUp = ({ to, suffix = '', duration = 1800 }) => {
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
                    setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.6 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [to, duration]);

    return (
        <span ref={ref}>
            {n.toLocaleString('id-ID')}
            {suffix}
        </span>
    );
};

/* ================================================================== */
/*  IKON (SVG inline)                                                  */
/* ================================================================== */
const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconBolt = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M13.5 2 4 13.5h6.2L9 22l10-12.2h-6.4L13.5 2Z" />
    </svg>
);
const IconBox = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
);
const IconChart = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <rect x="3" y="12" width="4.5" height="9" rx="1.2" />
        <rect x="9.75" y="7" width="4.5" height="14" rx="1.2" />
        <rect x="16.5" y="3" width="4.5" height="18" rx="1.2" />
    </svg>
);
const IconWallet = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" />
    </svg>
);
const IconStore = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M4 9.5 5.5 4h13L20 9.5" />
        <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
        <path d="M5 12.5V20h14v-7.5" />
        <path d="M10 20v-4.5h4V20" />
    </svg>
);
const IconUser = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <circle cx="12" cy="8" r="4.2" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7H4Z" />
    </svg>
);
const IconTag = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path
            fillRule="evenodd"
            d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7a1.5 1.5 0 0 1 1.1.4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.7 7.7a1.5 1.5 0 0 1-2.1 0l-7.3-7.3a1.5 1.5 0 0 1-.5-1Zm4.5-6.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        />
    </svg>
);
const IconArrow = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);
const IconChevronDown = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);
const IconChevronUp = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5}>
        <path d="m6 15 6-6 6 6" />
    </svg>
);
const IconSpark = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2 14 9l7 3-7 3-2 7-2-7-7-3 7-3 2-7Z" />
    </svg>
);
const IconMail = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
    </svg>
);
const IconPhone = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M6.6 2.5 9.5 3l1.3 4-2 1.5a12 12 0 0 0 6.7 6.7l1.5-2 4 1.3.5 2.9a2 2 0 0 1-2 2.3A17.5 17.5 0 0 1 4.3 4.5a2 2 0 0 1 2.3-2Z" />
    </svg>
);
const IconBag = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7 8V7a5 5 0 0 1 10 0v1h2.2a1 1 0 0 1 1 1.1l-1 11a1 1 0 0 1-1 .9H5.8a1 1 0 0 1-1-.9l-1-11a1 1 0 0 1 1-1.1H7Zm2 0h6V7a3 3 0 0 0-6 0v1Z" />
    </svg>
);
const IconHeart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 21s-8-5-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6-8 11-8 11Z" />
    </svg>
);
const IconHeadset = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 3a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h1v-7H6v-1a6 6 0 0 1 12 0v1h-2v7h2v.5A2.5 2.5 0 0 1 15.5 21H13v-1.5h2.5a1 1 0 0 0 1-1V19h1a3 3 0 0 0 3-3v-5a8 8 0 0 0-8-8Z" />
    </svg>
);
const IconCycle = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
        <path d="M18 3v4h-4M6 21v-4h4" />
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

const Badge = ({ icon, children }) => (
    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-semibold">
        {icon}
        {children}
    </div>
);

const FeatureItem = ({ icon, title, desc, tint }) => (
    <div className="group h-full rounded-2xl p-5 flex flex-col gap-3 cursor-default transition duration-300 hover:bg-white hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/10">
        <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 ${tint}`}
        >
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-sm text-slate-900 transition-colors group-hover:text-blue-700">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
        </div>
    </div>
);

const ScrollHint = ({ to }) => (
    <div className="flex justify-center">
        <a
            href={`#${to}`}
            onClick={(e) => scrollToSection(e, to)}
            aria-label="Gulir ke bagian berikutnya"
            className="sc-bounce w-10 h-10 rounded-full bg-white shadow-md shadow-blue-900/10 text-blue-700 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
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

const SocialLink = ({ label, hover, children }) => (
    <a
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label={label}
        title={label}
        className={`w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:-translate-y-1 hover:shadow-lg transition duration-300 ${hover}`}
    >
        {children}
    </a>
);

/* Gambar ilustrasi: dilebur dengan latar & tepi dihaluskan */
const Illustration = ({ src, alt, fade = '70%', className = '' }) => {
    const mask = `radial-gradient(ellipse 68% 66% at 50% 50%, #000 ${fade}, transparent 100%)`;
    return (
        <img
            src={src}
            alt={alt}
            draggable={false}
            className={`w-full h-auto select-none ${className}`}
            style={{ mixBlendMode: 'multiply', WebkitMaskImage: mask, maskImage: mask }}
        />
    );
};

/* ================================================================== */
/*  HALAMAN UTAMA                                                      */
/* ================================================================== */
export default function Welcome({ canLogin, canRegister, auth }) {
    const [active, setActive] = useState('beranda');

    // halaman beranda publik selalu memakai tema bawaan (Samudra)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'samudra');
    }, []);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const progressRef = useRef(null);
    const heroRef = useRef(null);

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

            // parallax
            document.querySelectorAll('[data-parallax]').forEach((el) => {
                const section = el.closest('section') || el.parentElement;
                const r = section.getBoundingClientRect();
                const offset = r.top + r.height / 2 - vh / 2;
                el.style.transform = `translate3d(0, ${(-offset * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
            });
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

    /* Cahaya lembut mengikuti kursor di hero */
    const onHeroMove = (e) => {
        const el = heroRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    const go = (e, id) => {
        setMenuOpen(false);
        scrollToSection(e, id);
    };

    const features = [
        { icon: <IconBolt />, title: 'Transaksi Cepat', desc: 'POS 4 kolom dengan tombol pecahan pintas dan kalkulator kembalian otomatis.', tint: 'bg-blue-100 text-blue-600' },
        { icon: <IconBox />, title: 'Manajemen Stok', desc: 'Pantau pergerakan stok barang secara real-time dan kelola inventaris toko.', tint: 'bg-indigo-100 text-indigo-600' },
        { icon: <IconChart />, title: 'Laporan Penjualan', desc: 'Rekap penjualan dan performa transaksi toko secara otomatis dan transparan.', tint: 'bg-blue-100 text-blue-600' },
        { icon: <IconStore />, title: 'Sistem Multi-Tenant', desc: 'Kelola banyak toko dalam satu aplikasi dengan data terisolasi dan Kode Unik Toko.', tint: 'bg-indigo-100 text-indigo-600' },
        { icon: <IconUser />, title: 'Kelola Karyawan', desc: 'Atur peran (Admin & Kasir), hak akses, dan aktivitas staf lewat pop-up praktis.', tint: 'bg-blue-100 text-blue-600' },
        { icon: <IconTag />, title: 'Diskon & Promo Fleksibel', desc: 'Atur promo toko dan aktifkan atau nonaktifkan kapan saja untuk menarik pelanggan.', tint: 'bg-violet-100 text-violet-600' },
    ];

    const steps = [
        { title: 'Daftar Akun', desc: 'Buat akun SmartCash dengan cepat.' },
        { title: 'Atur Toko', desc: 'Masukkan data toko dan produk Anda.' },
        { title: 'Mulai Transaksi', desc: 'Aplikasi siap digunakan untuk operasional bisnis.' },
    ];

    const stats = [
        { icon: <IconBag />, value: <CountUp to={10000} suffix="+" />, label: 'Pengguna Aktif' },
        { icon: <IconHeart />, value: <CountUp to={98} suffix="%" />, label: 'Tingkat Kepuasan' },
        { icon: <IconHeadset />, value: '24/7', label: 'Dukungan Pelanggan' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
            <Head title="SmartCash - Solusi Kasir Modern" />
            <style>{css}</style>

            {/* ===================== NAVBAR ===================== */}
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                    scrolled || menuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white/60 backdrop-blur-sm'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
                    <a href="#beranda" onClick={(e) => go(e, 'beranda')} className="group flex items-center gap-2.5">
                        <Logo size="w-11 h-11" />
                        <span className="text-[22px] font-extrabold tracking-tight text-[#14214f]">
                            Smart<span className="text-blue-600">Cash</span>
                        </span>
                    </a>

                    <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-700">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                                className={`relative py-2 transition-colors ${
                                    active === item.id ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
                                }`}
                            >
                                {item.label}
                                <span
                                    className={`absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-blue-600 transition-transform duration-300 origin-left ${
                                        active === item.id ? 'scale-x-100' : 'scale-x-0'
                                    }`}
                                />
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-5">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="sc-shine bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-blue-500/25 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="group sc-shine hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-blue-500/25 transition items-center gap-2"
                                    >
                                        Mulai Sekarang
                                        <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                )}
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700"
                            aria-label="Buka menu"
                            aria-expanded={menuOpen}
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" {...iconProps}>
                                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                            </svg>
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <nav className="md:hidden border-t border-slate-100 bg-white px-6 py-3 flex flex-col">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => go(e, item.id)}
                                className={`py-3 text-sm font-medium ${active === item.id ? 'text-blue-600' : 'text-slate-700'}`}
                            >
                                {item.label}
                            </a>
                        ))}
                        {!auth?.user && canRegister && (
                            <Link
                                href={route('register')}
                                className="mt-2 mb-2 bg-blue-600 text-white text-center px-5 py-3 rounded-full text-sm font-semibold"
                            >
                                Mulai Sekarang
                            </Link>
                        )}
                    </nav>
                )}

                {/* garis progress scroll */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent">
                    <div
                        ref={progressRef}
                        className="h-full w-0 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-600 rounded-r-full"
                    />
                </div>
            </header>

            <main>
                {/* ===================== BERANDA ===================== */}
                <section
                    id="beranda"
                    ref={heroRef}
                    onMouseMove={onHeroMove}
                    className="relative scroll-mt-[72px] min-h-screen pt-[72px] flex flex-col bg-gradient-to-b from-blue-50/70 via-blue-50/30 to-white overflow-hidden"
                >
                    {/* cahaya mengikuti kursor */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(420px circle at var(--mx, 70%) var(--my, 35%), rgba(37,99,235,.10), transparent 65%)',
                        }}
                    />
                    {/* hiasan latar */}
                    <div data-parallax="0.12" className="absolute -top-16 -left-24 w-80 h-80 pointer-events-none">
                        <div className="sc-drift w-full h-full rounded-full bg-blue-200/40 blur-3xl" />
                    </div>
                    <div data-parallax="-0.08" className="absolute top-1/3 -right-24 w-96 h-96 pointer-events-none">
                        <div className="sc-drift w-full h-full rounded-full bg-indigo-200/40 blur-3xl" style={{ animationDelay: '-6s' }} />
                    </div>
                    <div data-parallax="0.2" className="absolute top-[28%] left-[46%] pointer-events-none hidden lg:block">
                        <span className="sc-twinkle block w-2.5 h-2.5 rounded-full bg-blue-400" />
                    </div>
                    <div data-parallax="0.3" className="absolute top-[70%] left-[8%] pointer-events-none hidden lg:block">
                        <span className="sc-twinkle block w-3 h-3 rounded-full bg-indigo-300" style={{ animationDelay: '-1.2s' }} />
                    </div>

                    <div className="relative flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12">
                        <div className="space-y-6 max-w-xl">
                            <Reveal>
                                <Badge icon={<IconSpark />}>Solusi Kasir Modern untuk Bisnis Anda</Badge>
                            </Reveal>

                            <Reveal delay={120}>
                                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#14214f] tracking-tight leading-[1.1]">
                                    Kelola Transaksi
                                    <br />
                                    <span className="text-blue-600">Lebih Mudah &amp; Cepat</span>
                                </h1>
                            </Reveal>

                            <Reveal delay={240}>
                                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                                    SmartCash membantu Anda mengelola transaksi, stok barang, dan laporan penjualan dalam satu
                                    aplikasi kasir yang praktis dan modern.
                                </p>
                            </Reveal>

                            {!auth?.user && canRegister && (
                                <Reveal delay={360}>
                                    <div className="pt-2">
                                        <Link
                                            href={route('register')}
                                            className="group sc-shine sc-ring inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 text-white px-8 py-4 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/30 transition"
                                        >
                                            Mulai Sekarang
                                            <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                                        </Link>
                                    </div>
                                </Reveal>
                            )}
                        </div>

                        <Reveal variant="zoom" delay={200}>
                            <div data-parallax="0.05">
                                <Tilt>
                                    <div className="sc-float">
                                        <Illustration src={IMG.hero} alt="Kasir menggunakan aplikasi SmartCash" fade="78%" />
                                    </div>
                                </Tilt>
                            </div>
                        </Reveal>
                    </div>

                    <div className="relative pb-6">
                        <ScrollHint to="fitur" />
                    </div>
                </section>

                {/* ===================== FITUR ===================== */}
                <section id="fitur" className="relative scroll-mt-[72px] min-h-screen flex items-center bg-white py-20 overflow-hidden">
                    <div data-parallax="0.1" className="absolute top-10 right-[-6rem] w-72 h-72 pointer-events-none">
                        <div className="sc-drift w-full h-full rounded-full bg-blue-100/60 blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-5">
                            <Reveal variant="left">
                                <Badge icon={<IconSpark />}>Fitur Unggulan</Badge>
                            </Reveal>
                            <Reveal variant="left" delay={100}>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14214f] tracking-tight leading-tight">
                                    Semua yang Anda Butuhkan
                                    <br />
                                    <span className="text-blue-600">dalam Satu Aplikasi</span>
                                </h2>
                            </Reveal>
                            <Reveal variant="left" delay={200}>
                                <p className="text-slate-600 leading-relaxed max-w-md">
                                    Berbagai fitur lengkap yang dirancang untuk memudahkan operasional bisnis Anda.
                                </p>
                            </Reveal>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3">
                            {features.map((f, i) => (
                                <div
                                    key={f.title}
                                    className={`border-slate-100 ${i % 3 !== 0 ? 'sm:border-l' : ''} ${i >= 3 ? 'sm:border-t' : ''}`}
                                >
                                    <Reveal delay={i * 90} className="h-full">
                                        <FeatureItem {...f} />
                                    </Reveal>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===================== CARA KERJA ===================== */}
                <section
                    id="cara-kerja"
                    className="relative scroll-mt-[72px] min-h-screen flex items-center bg-gradient-to-b from-white via-blue-50/50 to-white py-20 overflow-hidden"
                >
                    <div data-parallax="-0.1" className="absolute bottom-0 left-[-5rem] w-72 h-72 pointer-events-none">
                        <div className="sc-drift w-full h-full rounded-full bg-indigo-100/70 blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6 space-y-8">
                            <div className="space-y-5">
                                <Reveal variant="left">
                                    <Badge icon={<IconCycle />}>Cara Kerja</Badge>
                                </Reveal>
                                <Reveal variant="left" delay={100}>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14214f] tracking-tight leading-tight">
                                        Mulai Menggunakan <span className="text-blue-600">SmartCash</span>
                                        <br />
                                        dalam 3 Langkah Mudah
                                    </h2>
                                </Reveal>
                            </div>

                            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                                {steps.map((s, i) => (
                                    <li key={s.title}>
                                        <Reveal delay={200 + i * 180}>
                                            <div className="group flex sm:flex-col gap-3 rounded-2xl p-3 -m-3 transition duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/30 transition duration-300 group-hover:scale-125 group-hover:bg-indigo-600">
                                                        {i + 1}
                                                    </span>
                                                    {i < steps.length - 1 && (
                                                        <span className="sc-nudge hidden sm:block text-slate-400 ml-auto mr-2">
                                                            <IconArrow className="w-5 h-5" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{s.desc}</p>
                                                </div>
                                            </div>
                                        </Reveal>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="lg:col-span-6">
                            <Reveal variant="right" delay={150}>
                                <div data-parallax="0.05">
                                    <Tilt max={6}>
                                        <div className="sc-float" style={{ animationDelay: '-2s' }}>
                                            <Illustration
                                                src={IMG.dashboard}
                                                alt="Tampilan dashboard SmartCash di laptop"
                                                fade="58%"
                                            />
                                        </div>
                                    </Tilt>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ===================== TENTANG KAMI ===================== */}
                <section
                    id="tentang"
                    className="relative scroll-mt-[72px] min-h-screen flex items-center bg-gradient-to-b from-white to-blue-50/60 py-20 overflow-hidden"
                >
                    <div data-parallax="0.1" className="absolute top-20 right-[-4rem] w-80 h-80 pointer-events-none">
                        <div className="sc-drift w-full h-full rounded-full bg-blue-200/40 blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 max-w-xl">
                            <Reveal variant="left">
                                <Badge icon={<IconCycle />}>Tentang Kami</Badge>
                            </Reveal>
                            <Reveal variant="left" delay={100}>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14214f] tracking-tight leading-tight">
                                    Bersama Membangun
                                    <br />
                                    <span className="text-blue-600">Bisnis yang Lebih Baik</span>
                                </h2>
                            </Reveal>
                            <Reveal variant="left" delay={200}>
                                <p className="text-slate-600 leading-relaxed">
                                    SmartCash adalah solusi kasir modern yang dirancang untuk membantu para pelaku usaha di
                                    Indonesia mengelola bisnis secara lebih mudah, efisien, dan aman.
                                </p>
                            </Reveal>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                                {stats.map((s, i) => (
                                    <Reveal key={s.label} delay={300 + i * 120}>
                                        <div className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1">
                                            <span className="text-blue-600 transition duration-300 group-hover:scale-125 group-hover:rotate-6">
                                                {s.icon}
                                            </span>
                                            <div>
                                                <div className="font-extrabold text-[#14214f] leading-none">{s.value}</div>
                                                <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        <Reveal variant="right" delay={150}>
                            <div data-parallax="0.05">
                                <Tilt max={6}>
                                    <div className="sc-float" style={{ animationDelay: '-4s' }}>
                                        <Illustration
                                            src={IMG.tim}
                                            alt="Tim SmartCash bekerja bersama"
                                            fade="58%"
                                        />
                                    </div>
                                </Tilt>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ===================== FOOTER ===================== */}
            <footer className="bg-[#16255a] text-slate-300">
                <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <Reveal className="space-y-4">
                        <a href="#beranda" onClick={(e) => go(e, 'beranda')} className="group flex items-center gap-2.5">
                            <span className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center">
                                <Logo size="w-full h-full" />
                            </span>
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                Smart<span className="text-sky-400">Cash</span>
                            </span>
                        </a>
                        <p className="text-sm leading-relaxed max-w-[220px]">Solusi kasir modern untuk mengelola bisnis Anda.</p>
                        <div className="flex items-center gap-3 pt-1">
                            <SocialLink label="Facebook" hover="hover:bg-[#1877F2]">{SocialIcons.facebook}</SocialLink>
                            <SocialLink label="Instagram" hover="hover:bg-gradient-to-tr hover:from-amber-400 hover:via-pink-500 hover:to-purple-600">{SocialIcons.instagram}</SocialLink>
                            <SocialLink label="LinkedIn" hover="hover:bg-[#0A66C2]">{SocialIcons.linkedin}</SocialLink>
                            <SocialLink label="YouTube" hover="hover:bg-[#FF0000]">{SocialIcons.youtube}</SocialLink>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <h5 className="text-white font-semibold text-sm mb-4">Navigasi</h5>
                        <ul className="space-y-2.5 text-sm">
                            {NAV_ITEMS.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        onClick={(e) => go(e, item.id)}
                                        className="inline-block hover:text-white hover:translate-x-1.5 transition duration-300"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={200}>
                        <h5 className="text-white font-semibold text-sm mb-4">Dukungan</h5>
                        <ul className="space-y-2.5 text-sm">
                            {['Pusat Bantuan', 'Hubungi Kami', 'FAQ'].map((t) => (
                                <li key={t}>
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="inline-block hover:text-white hover:translate-x-1.5 transition duration-300"
                                    >
                                        {t}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={300}>
                        <h5 className="text-white font-semibold text-sm mb-4">Hubungi Kami</h5>
                        <ul className="space-y-3 text-sm">
                            <li className="group flex items-center gap-3 hover:text-white transition-colors">
                                <span className="text-sky-400 transition-transform duration-300 group-hover:scale-125">
                                    <IconMail />
                                </span>
                                support@smartcash.id
                            </li>
                            <li className="group flex items-center gap-3 hover:text-white transition-colors">
                                <span className="text-sky-400 transition-transform duration-300 group-hover:scale-125">
                                    <IconPhone />
                                </span>
                                (021) 1234 5678
                            </li>
                        </ul>
                    </Reveal>
                </div>

                <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} SmartCash. All rights reserved. Developed by Rashhff and FernCode.
                </div>
            </footer>

            {/* tombol kembali ke atas */}
            <button
                type="button"
                onClick={(e) => scrollToSection(e, 'beranda')}
                aria-label="Kembali ke atas"
                className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition duration-300 hover:bg-blue-700 hover:-translate-y-1 ${
                    showTop ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                }`}
            >
                <IconChevronUp />
            </button>
        </div>
    );
}