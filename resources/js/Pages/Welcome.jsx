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

@keyframes sc-pop { 0% { transform: scale(.96) translateY(8px); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes sc-fade { from { opacity: 0 } to { opacity: 1 } }
.sc-pop { animation: sc-pop .25s cubic-bezier(.22,1,.36,1) backwards }
.sc-fade { animation: sc-fade .2s ease backwards }

@media (prefers-reduced-motion: reduce) {
    .sc-reveal { opacity: 1 !important; transform: none !important; transition: none !important }
    .sc-float,.sc-drift,.sc-bounce,.sc-nudge,.sc-ring,.sc-twinkle,.sc-pop,.sc-fade { animation: none !important }
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

const IconBook = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5v-15Z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5v-15Z" />
    </svg>
);
const IconHelp = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.100 1-1.100 1.800M12 16.500v.1" />
    </svg>
);
const IconXMark = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} strokeWidth={2.5}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);
const IconSend = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <path d="M21 3 10 14M21 3l-6.500 18-3.500-7-7-3.500L21 3Z" />
    </svg>
);
const IconClock = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

const SearchBox = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch className="w-[18px] h-[18px]" />
        </span>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-11 pr-10 py-3 text-sm rounded-xl border-slate-200 bg-slate-50 placeholder:text-slate-400 transition duration-200 hover:border-blue-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        {value && (
            <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
            >
                <IconXMark className="w-3 h-3" />
            </button>
        )}
    </div>
);

const EmptyResult = ({ onContact }) => (
    <div className="text-center py-10">
        <span className="text-slate-300 inline-block">
            <IconHelp className="w-10 h-10" />
        </span>
        <p className="text-sm font-semibold text-slate-600 mt-2">Tidak ada hasil yang cocok</p>
        <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain, atau hubungi tim kami langsung.</p>
        <button
            type="button"
            onClick={onContact}
            className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition active:scale-95"
        >
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
                        <div
                            key={t.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70"
                        >
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
                                <span className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <IconBook className="w-4 h-4" />
                                </span>
                                {t.title}
                            </h4>
                            <ol className="mt-3 space-y-2">
                                {t.steps.map((s, i) => (
                                    <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
                                        <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center mt-px">
                                            {i + 1}
                                        </span>
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
                            <div
                                key={f.i}
                                className={`rounded-2xl border transition duration-200 ${isOpen ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(open === f.i ? -1 : f.i)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                                >
                                    <span className="text-sm font-bold text-slate-900">{f.q}</span>
                                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition duration-300 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                                        <IconChevronDown className="w-4 h-4" />
                                    </span>
                                </button>
                                <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
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

    const fieldCls = (err) =>
        `w-full text-sm rounded-xl bg-white py-2.5 px-3.5 placeholder:text-slate-400 transition duration-200 focus:ring-4 ${
            err ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100'
        }`;

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
                            <span className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                {c.icon}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{c.label}</span>
                                <span className="block text-sm font-bold text-slate-800 break-words">{c.value}</span>
                            </span>
                        </>
                    );
                    return c.href ? (
                        <a
                            key={c.label}
                            href={c.href}
                            className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5"
                        >
                            {inner}
                        </a>
                    ) : (
                        <div key={c.label} className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                            {inner}
                        </div>
                    );
                })}
                <p className="text-xs text-slate-400 leading-relaxed px-1">
                    Untuk pertanyaan umum, cek dulu Pusat Bantuan dan FAQ. Jawabannya sering sudah ada di sana.
                </p>
            </div>

            {/* formulir */}
            <form onSubmit={submit} noValidate className="md:col-span-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            onBlur={() => touch('name')}
                            placeholder="Nama Anda"
                            className={fieldCls(touched.name && errors.name)}
                        />
                        {touched.name && errors.name && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            onBlur={() => touch('email')}
                            placeholder="email@domain.com"
                            className={fieldCls(touched.email && errors.email)}
                        />
                        {touched.email && errors.email && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Topik</label>
                    <select value={form.topic} onChange={(e) => set('topic', e.target.value)} className={fieldCls(false)}>
                        {SUPPORT_TOPICS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Pesan</label>
                        <span className="text-[11px] text-slate-400 tabular-nums">{form.message.trim().length} karakter</span>
                    </div>
                    <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        onBlur={() => touch('message')}
                        placeholder="Tulis kendala atau pertanyaan Anda selengkap mungkin"
                        className={`${fieldCls(touched.message && errors.message)} resize-none`}
                    />
                    {touched.message && errors.message && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.message}</p>}
                </div>

                <button
                    type="submit"
                    className="group w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition duration-200 hover:-translate-y-0.5 active:scale-[.98]"
                >
                    Kirim Pesan
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                        <IconSend />
                    </span>
                </button>

                <p className="text-[11px] text-slate-400 leading-relaxed">
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
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

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
        <div onClick={onClose} className="sc-fade fixed inset-0 z-[80] bg-slate-900/50 flex items-end sm:items-center justify-center sm:p-4">
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={titles[tab][0]}
                className="sc-pop bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden"
            >
                <div className="px-6 pt-5 pb-0 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-extrabold text-[#14214f] tracking-tight">{titles[tab][0]}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{titles[tab][1]}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup"
                            className="w-9 h-9 shrink-0 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                        >
                            <IconXMark className="w-5 h-5" />
                        </button>
                    </div>

                    <div role="tablist" className="flex gap-1 mt-4 overflow-x-auto">
                        {tabs.map((t) => {
                            const active = tab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => onTab(t.key)}
                                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 -mb-px text-sm font-bold border-b-2 transition-colors duration-200 ${
                                        active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    {t.icon}
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div key={tab} className="sc-fade flex-1 overflow-y-auto p-6">
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

    // halaman beranda publik selalu memakai tema bawaan (Samudra)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'samudra');
    }, []);
    const [scrolled, setScrolled] = useState(false);
    const [support, setSupport] = useState(null); // null | 'help' | 'faq' | 'contact'
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
                        <span>
                            <span className="block text-[22px] font-extrabold tracking-tight text-[#14214f] leading-none">
                                Smart<span className="text-blue-600">Cash</span>
                            </span>
                            <span className="block text-[11px] font-medium text-slate-500 mt-1">Solusi Kasir Modern</span>
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
                            <span>
                                <span className="block text-2xl font-extrabold text-white tracking-tight leading-none">
                                    Smart<span className="text-sky-400">Cash</span>
                                </span>
                                <span className="block text-[11px] font-medium text-slate-400 mt-1">Solusi Kasir Modern</span>
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
                            {SUPPORT_LINKS.map((l) => (
                                <li key={l.key}>
                                    <button
                                        type="button"
                                        onClick={() => setSupport(l.key)}
                                        className="inline-block text-left hover:text-white hover:translate-x-1.5 transition duration-300"
                                    >
                                        {l.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={300}>
                        <h5 className="text-white font-semibold text-sm mb-4">Hubungi Kami</h5>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href={`mailto:${CONTACT.email}`} className="group flex items-center gap-3 hover:text-white transition-colors">
                                    <span className="text-sky-400 transition-transform duration-300 group-hover:scale-125">
                                        <IconMail />
                                    </span>
                                    {CONTACT.email}
                                </a>
                            </li>
                            <li>
                                <a href={CONTACT.phoneHref} className="group flex items-center gap-3 hover:text-white transition-colors">
                                    <span className="text-sky-400 transition-transform duration-300 group-hover:scale-125">
                                        <IconPhone />
                                    </span>
                                    {CONTACT.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <span className="text-sky-400">
                                    <IconClock />
                                </span>
                                {CONTACT.hours}
                            </li>
                        </ul>
                        <button
                            type="button"
                            onClick={() => setSupport('contact')}
                            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-sky-500 px-4 py-2.5 rounded-xl transition duration-300 active:scale-95"
                        >
                            Kirim Pesan
                            <IconArrow />
                        </button>
                    </Reveal>
                </div>

                <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} SmartCash. All rights reserved. Developed by Rashhff and FernCode.
                </div>
            </footer>

            {support && <SupportModal tab={support} onTab={setSupport} onClose={() => setSupport(null)} />}

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