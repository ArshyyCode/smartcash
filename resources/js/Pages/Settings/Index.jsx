import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

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
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER                                                             */
/* ================================================================== */
const randomStoreCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const arr = new Uint32Array(6);
    window.crypto.getRandomValues(arr);
    let out = 'STR-';
    arr.forEach((n) => (out += chars[n % chars.length]));
    return out;
};

const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
    if (pw.length < 6) score = Math.min(score, 1);
    const levels = [
        { label: 'Sangat lemah', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Lemah', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Sedang', bar: 'bg-amber-400', text: 'text-amber-600', w: 'w-2/4' },
        { label: 'Kuat', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-3/4' },
        { label: 'Sangat kuat', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-full' },
    ];
    return levels[score];
};

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const I = {
    Gear: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
    ),
    Store: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M4 9.5 5.5 4h13L20 9.5" />
            <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
            <path d="M5 12.5V20h14v-7.5" />
            <path d="M10 20v-4.5h4V20" />
        </svg>
    ),
    Key: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="8" cy="15" r="4" />
            <path d="m10.8 12.2 9-9M16 7l3 3M14 9l2 2" />
        </svg>
    ),
    Shield: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
            <path d="m8.8 12 2.2 2.2 4.2-4.4" />
        </svg>
    ),
    User: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
        </svg>
    ),
    At: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8" />
        </svg>
    ),
    Mail: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    ),
    Phone: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M6.6 3.5 9.5 4l1.3 4-2 1.5a12 12 0 0 0 6.7 6.7l1.5-2 4 1.3.5 2.9a2 2 0 0 1-2 2.3A17.500 17.500 0 0 1 4.300 5.500a2 2 0 0 1 2.300-2Z" />
        </svg>
    ),
    Pin: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 21s7-5.300 7-11a7 7 0 1 0-14 0c0 5.700 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.500" />
        </svg>
    ),
    Lock: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
    ),
    Eye: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.6A9.5 9.5 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 4M6.5 7.2A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.8" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
    ),
    Copy: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" />
        </svg>
    ),
    Check: ({ className = 'w-3 h-3' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    ),
    Close: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    ),
    Dice: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="4" y="4" width="16" height="16" rx="3.5" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="15" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
            <circle cx="9" cy="15" r="1" fill="currentColor" />
        </svg>
    ),
    Undo: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
        </svg>
    ),
    Alert: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 3.5 2.8 19.5a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3.5Z" />
            <path d="M12 10v4.5M12 17.5v.1" />
        </svg>
    ),
    Trash: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V4.5h6V7" />
        </svg>
    ),
    Palette: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0 0 21 10.7C21 6.4 17 3 12 3Z" />
            <circle cx="7.5" cy="11" r="1" fill="currentColor" />
            <circle cx="10.5" cy="7.5" r="1" fill="currentColor" />
            <circle cx="15" cy="7.5" r="1" fill="currentColor" />
        </svg>
    ),
    Upload: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 16V5m0 0-3.5 3.5M12 5l3.5 3.5" />
            <path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
        </svg>
    ),
    Link: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
            <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
    ),
    Image: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
        </svg>
    ),
};

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const inputCls =
    'w-full text-sm rounded-xl bg-white py-2.5 placeholder:text-slate-400 transition duration-200 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';
const errBorder = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Field: label di atas, ikon di kiri, pesan bantuan/error di bawah */
const Field = ({ label, error, hint, right, icon, className = '', children }) => (
    <div className={className}>
        <div className="flex items-center justify-between mb-1.5 min-h-[18px]">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            {right}
        </div>
        <div className="group relative">
            {icon && (
                <span className="pointer-events-none absolute left-3.5 top-3 text-slate-400 transition-colors group-focus-within:text-blue-600">{icon}</span>
            )}
            {children}
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{hint}</p>}
        {error && (
            <p className="sc-pop flex items-start gap-1.5 text-red-500 text-[11px] font-semibold mt-1.5 leading-snug">
                <span className="mt-px shrink-0">
                    <I.Alert className="w-3.5 h-3.5" />
                </span>
                <span>{error}</span>
            </p>
        )}
    </div>
);

/* Kartu form standar: header (ikon, judul, deskripsi) -> isi -> footer aksi */
const FormCard = ({ icon, title, desc, onSubmit, footer, children }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-100">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">{icon}</span>
            <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer}
    </form>
);

/* Footer kartu: status di kiri, tombol di kanan */
const FormFooter = ({ processing, changed, onReset, label = 'Simpan Perubahan', idleText = 'Belum ada perubahan', blocked = '' }) => (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
        <p
            className={`inline-flex items-center gap-2 text-xs font-medium transition-colors ${
                blocked ? 'text-red-600' : changed ? 'text-amber-700' : 'text-slate-400'
            }`}
        >
            <span className={`w-2 h-2 rounded-full ${blocked ? 'bg-red-500' : changed ? 'bg-amber-400' : 'bg-slate-300'}`} />
            {blocked || (changed ? 'Ada perubahan yang belum disimpan' : idleText)}
        </p>
        <div className="flex items-center gap-2 sm:justify-end">
            {changed && !processing && onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="sc-pop inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2.5 rounded-xl transition duration-200 active:scale-95"
                >
                    <I.Undo />
                    Kembalikan
                </button>
            )}
            <button
                type="submit"
                disabled={processing || !changed || Boolean(blocked)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
                {processing && <Spinner />}
                {processing ? 'Menyimpan...' : label}
            </button>
        </div>
    </div>
);

/* input password dengan tombol mata */
const PasswordInput = React.forwardRef(function PasswordInput({ error, ...props }, ref) {
    const [show, setShow] = useState(false);
    return (
        <>
            <input ref={ref} type={show ? 'text' : 'password'} {...props} className={`${inputCls} pl-11 pr-12 ${error ? errBorder : okBorder}`} />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2 top-1 w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
            >
                {show ? <I.EyeOff /> : <I.Eye />}
            </button>
        </>
    );
});

/* dialog konfirmasi / modal sederhana */
const Dialog = ({ onClose, children }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div onClick={onClose} className="sc-fade fixed inset-0 z-[70] bg-slate-900/50 flex justify-center items-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white rounded-2xl p-6 w-full max-w-sm">
                {children}
            </div>
        </div>
    );
};

/* ================================================================== */
/*  BAGIAN 1: PROFIL TOKO + BANNER DASHBOARD                           */
/* ================================================================== */
const isLinkValue = (s) => /^(https?:)?\/\//i.test(s) || s.startsWith('/') || s.startsWith('data:') || s.startsWith('blob:');
const resolveBanner = (b) => (!b ? '' : isLinkValue(String(b)) ? String(b) : `/storage/${String(b).replace(/^\/+/, '')}`);
const MAX_BANNER_MB = 2;

/* ------------------------------------------------------------------ */
/*  Batas isian & validasi langsung (realtime) untuk identitas toko     */
/* ------------------------------------------------------------------ */
const LIMITS = { name: 30, phone: 17, address: 250 };

// karakter yang diperbolehkan per kolom
const ALLOWED = {
    name: /^[\p{L}\p{N}\s.,&'’\-()\/+:]$/u,
    phone: /^[0-9\s+\-()]$/,
    address: /^[\p{L}\p{N}\s.,\-()\/#:'’&+]$/u,
};

const charCount = (v) => Array.from(v || '').length;
const badChars = (v, re) => Array.from(new Set(Array.from(v || '').filter((ch) => !re.test(ch))));
const listChars = (arr) => arr.slice(0, 6).join('  ');

const checkName = (v) => {
    if (!v.trim()) return 'Nama toko wajib diisi.';
    const bad = badChars(v, ALLOWED.name);
    if (bad.length) return `Simbol tidak diperbolehkan pada nama toko: ${listChars(bad)}. Gunakan huruf, angka, dan tanda . , & ' - ( ) /`;
    const n = charCount(v);
    if (n > LIMITS.name) return `Nama toko melebihi batas ${LIMITS.name} karakter (kelebihan ${n - LIMITS.name} karakter).`;
    return '';
};

const checkPhone = (v) => {
    if (!v) return '';
    const bad = badChars(v, ALLOWED.phone);
    if (bad.length) return `Karakter tidak diperbolehkan pada nomor telepon: ${listChars(bad)}. Gunakan angka, spasi, tanda -, tanda kurung, dan + di awal.`;
    if (v.indexOf('+') > 0 || (v.match(/\+/g) || []).length > 1) return 'Tanda + hanya boleh satu kali dan harus berada di awal nomor.';
    const n = charCount(v);
    if (n > LIMITS.phone) return `Nomor telepon melebihi batas ${LIMITS.phone} karakter (kelebihan ${n - LIMITS.phone} karakter).`;
    return '';
};

const checkAddress = (v) => {
    if (!v) return '';
    const bad = badChars(v, ALLOWED.address);
    if (bad.length) return `Simbol tidak diperbolehkan pada alamat: ${listChars(bad)}. Gunakan huruf, angka, dan tanda . , - / ( ) # : &`;
    const n = charCount(v);
    if (n > LIMITS.address) return `Alamat melebihi batas ${LIMITS.address} karakter (kelebihan ${n - LIMITS.address} karakter).`;
    return '';
};

/* penanda jumlah karakter, mis. 35/250 (kuning mendekati batas, merah melebihi batas) */
const Counter = ({ n, max }) => {
    const over = n > max;
    const near = !over && n >= Math.ceil(max * 0.9);
    return (
        <span className={`text-[11px] tabular-nums ${over ? 'text-red-600 font-bold' : near ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
            {n}/{max}
        </span>
    );
};

const greetingNow = () => {
    const h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};

/* Pratinjau banner: meniru tampilan banner di Dashboard */
function BannerPreview({ src, overlay, storeName, code, address, phone }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);
    const hasImg = Boolean(src) && !failed;
    const dateText = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="relative overflow-hidden rounded-xl bg-[rgb(var(--banner))] text-white">
            {hasImg && (
                <>
                    <img src={src} alt="" onError={() => setFailed(true)} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900 transition-opacity duration-200" style={{ opacity: overlay / 100 }} />
                </>
            )}

            <div className="relative flex items-center justify-between gap-4 px-5 py-6 sm:px-7 sm:py-8">
                <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 text-[10px] font-semibold px-2.5 py-1 rounded-full">{dateText}</span>
                    <p className="text-lg sm:text-xl font-extrabold mt-2.5 tracking-tight break-words">
                        {greetingNow()}, selamat datang di {storeName || 'Nama Toko'}
                    </p>
                    <div className="mt-2 space-y-1 text-[11px] sm:text-xs text-blue-100">
                        <p className="flex items-start gap-1.5 leading-relaxed">
                            <span className="mt-px shrink-0 opacity-90">
                                <I.Pin className="w-3.5 h-3.5" />
                            </span>
                            <span className={`whitespace-pre-line break-words ${address ? '' : 'opacity-60'}`}>{address || 'Alamat toko belum diisi'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                            <span className="shrink-0 opacity-90">
                                <I.Phone className="w-3.5 h-3.5" />
                            </span>
                            <span className={phone ? '' : 'opacity-60'}>{phone || 'Nomor telepon belum diisi'}</span>
                        </p>
                    </div>
                </div>
                <div className={`hidden sm:flex shrink-0 flex-col items-center rounded-lg border border-white/15 px-4 py-2.5 ${hasImg ? 'bg-slate-900/50' : 'bg-[rgb(var(--banner-card))]'}`}>
                    <span className="text-[10px] text-blue-100">Kode Unik Toko</span>
                    <span className="text-base font-black tracking-widest">{code || '-'}</span>
                </div>
            </div>

            {failed && (
                <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-white/90 text-red-600 px-2 py-1 rounded-md">
                    Gambar tidak dapat dimuat
                </span>
            )}
        </div>
    );
}

function StoreProfileSection({ store, showToast }) {
    const existing = store?.banner || '';
    const existingIsLocal = Boolean(existing) && !/^(https?:)?\/\//i.test(existing);
    const initialSource = !existing ? 'none' : existingIsLocal ? 'upload' : 'url';

    const initial = {
        name: store?.name || '',
        address: store?.address || '',
        phone: store?.phone || '',
        banner_mode: initialSource,
        banner_url: existing && !existingIsLocal ? existing : '',
        banner_overlay: Number(store?.banner_overlay ?? 45),
    };

    // POST + _method=put karena pengiriman file tidak didukung langsung oleh PUT di Laravel
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        ...initial,
        banner_file: null,
    });

    // validasi langsung saat mengetik (sebelum tombol simpan ditekan)
    const [touched, setTouched] = useState({});
    const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));
    const issues = {
        name: checkName(data.name),
        phone: checkPhone(data.phone),
        address: checkAddress(data.address),
    };
    const hasIssues = Boolean(issues.name || issues.phone || issues.address);
    // pesan "wajib diisi" baru tampil setelah kolom disentuh; pesan lain langsung tampil
    const shown = {
        name: (issues.name && (touched.name || data.name.length > 0) ? issues.name : '') || errors.name,
        phone: issues.phone || errors.phone,
        address: issues.address || errors.address,
    };

    const [fileKey, setFileKey] = useState(0);
    const [filePreview, setFilePreview] = useState('');
    const [fileError, setFileError] = useState('');
    const [dragging, setDragging] = useState(false);

    // pratinjau lokal dari file yang dipilih (belum diunggah)
    useEffect(() => {
        if (!data.banner_file) {
            setFilePreview('');
            return undefined;
        }
        const url = URL.createObjectURL(data.banner_file);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.banner_file]);

    const changed =
        data.name !== initial.name ||
        data.address !== initial.address ||
        data.phone !== initial.phone ||
        data.banner_mode !== initial.banner_mode ||
        data.banner_url !== initial.banner_url ||
        Number(data.banner_overlay) !== initial.banner_overlay ||
        data.banner_file !== null;

    const pickFile = (file) => {
        setFileError('');
        if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
            setFileError('Format harus JPG, PNG, atau WEBP.');
            return;
        }
        if (file.size > MAX_BANNER_MB * 1024 * 1024) {
            setFileError(`Ukuran file maksimal ${MAX_BANNER_MB} MB.`);
            return;
        }
        clearErrors('banner_file');
        setData('banner_file', file);
    };

    const clearFile = () => {
        setData('banner_file', null);
        setFileKey((k) => k + 1);
        setFileError('');
    };

    const resetAll = () => {
        setData({ _method: 'put', ...initial, banner_file: null });
        setFileKey((k) => k + 1);
        setFileError('');
        setTouched({});
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (hasIssues) {
            setTouched({ name: true, phone: true, address: true });
            return;
        }
        post(route('settings.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('banner_file', null);
                setFileKey((k) => k + 1);
                showToast('success', 'Profil toko dan banner berhasil diperbarui!');
            },
        });
    };

    // sumber gambar untuk pratinjau sesuai pilihan
    const previewSrc =
        data.banner_mode === 'upload'
            ? filePreview || (existingIsLocal ? resolveBanner(existing) : '')
            : data.banner_mode === 'url'
            ? /^https?:\/\//i.test(data.banner_url.trim())
                ? data.banner_url.trim()
                : ''
            : '';

    const sources = [
        { key: 'upload', label: 'Unggah Foto', icon: <I.Upload className="w-4 h-4" /> },
        { key: 'url', label: 'Link URL', icon: <I.Link className="w-4 h-4" /> },
        { key: 'none', label: 'Tanpa Gambar', icon: <I.Image className="w-4 h-4" /> },
    ];

    return (
        <FormCard
            icon={<I.Store className="w-5 h-5" />}
            title="Profil Toko & Banner Dashboard"
            desc="Atur identitas toko dan tampilan banner di bagian atas Dashboard."
            onSubmit={submit}
            footer={
                <FormFooter
                    processing={processing}
                    changed={changed}
                    onReset={resetAll}
                    blocked={hasIssues ? 'Perbaiki isian yang bertanda merah terlebih dahulu' : ''}
                />
            }
        >
            <div className="space-y-7">
                {/* PRATINJAU BANNER */}
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pratinjau Banner Dashboard</p>
                        <span className="text-[11px] text-slate-400">Tampil di bagian atas Dashboard</span>
                    </div>
                    <BannerPreview
                        src={previewSrc}
                        overlay={Number(data.banner_overlay)}
                        storeName={data.name}
                        code={store?.code}
                        address={data.address}
                        phone={data.phone}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8 border-t border-slate-100 pt-7">
                    {/* IDENTITAS TOKO */}
                    <div className="space-y-5 content-start">
                        <p className="text-sm font-bold text-slate-900">Identitas Toko</p>

                        <Field
                            label="Nama Toko / Usaha"
                            error={shown.name}
                            icon={<I.Store className="w-[18px] h-[18px]" />}
                            right={<Counter n={charCount(data.name)} max={LIMITS.name} />}
                        >
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                onBlur={() => touch('name')}
                                placeholder="Contoh: Koperasi SMK 1 Nganjuk"
                                aria-invalid={Boolean(shown.name)}
                                className={`${inputCls} pl-11 ${shown.name ? errBorder : okBorder}`}
                            />
                        </Field>

                        <Field
                            label="Nomor Telepon"
                            error={shown.phone}
                            icon={<I.Phone />}
                            right={<Counter n={charCount(data.phone)} max={LIMITS.phone} />}
                            hint="Contoh: 0812 3456 7890 atau +62 812 3456 7890"
                        >
                            <input
                                type="tel"
                                inputMode="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                onBlur={() => touch('phone')}
                                placeholder="08xx xxxx xxxx"
                                aria-invalid={Boolean(shown.phone)}
                                className={`${inputCls} pl-11 ${shown.phone ? errBorder : okBorder}`}
                            />
                        </Field>

                        <Field
                            label="Alamat Toko"
                            error={shown.address}
                            icon={<I.Pin />}
                            right={<Counter n={charCount(data.address)} max={LIMITS.address} />}
                            hint="Tulis ringkas: jalan, kelurahan, kecamatan, dan kota."
                        >
                            <textarea
                                rows={4}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                onBlur={() => touch('address')}
                                placeholder="Jl. Merdeka No. 45, Jakarta Pusat"
                                aria-invalid={Boolean(shown.address)}
                                className={`${inputCls} pl-11 resize-none ${shown.address ? errBorder : okBorder}`}
                            />
                        </Field>
                    </div>

                    {/* BANNER */}
                    <div className="space-y-5 content-start">
                        <p className="text-sm font-bold text-slate-900">Banner Dashboard</p>

                        {/* pilihan sumber gambar */}
                        <div role="tablist" aria-label="Sumber banner" className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                            {sources.map((s) => {
                                const active = data.banner_mode === s.key;
                                return (
                                    <button
                                        key={s.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => {
                                            setData('banner_mode', s.key);
                                            clearErrors('banner_file', 'banner_url');
                                        }}
                                        className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition duration-200 active:scale-95 ${
                                            active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {s.icon}
                                        <span className="truncate">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* UNGGAH FOTO */}
                        {data.banner_mode === 'upload' && (
                            <div className="sc-pop">
                                <label
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragging(false);
                                        pickFile(e.dataTransfer.files?.[0]);
                                    }}
                                    className={`flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 transition duration-200 ${
                                        dragging ? 'border-blue-500 bg-blue-50' : errors.banner_file || fileError ? 'border-red-300 bg-red-50/40' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                                    }`}
                                >
                                    <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <I.Upload className="w-5 h-5" />
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">Klik untuk memilih foto atau seret ke sini</span>
                                    <span className="text-[11px] text-slate-400">JPG, PNG, atau WEBP &middot; maks. {MAX_BANNER_MB} MB &middot; disarankan 1600 x 400 px</span>
                                    <input
                                        key={fileKey}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="sr-only"
                                        onChange={(e) => pickFile(e.target.files?.[0])}
                                    />
                                </label>

                                {data.banner_file ? (
                                    <div className="sc-pop mt-2.5 flex items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                                        <p className="text-xs text-slate-600 truncate">
                                            <b className="text-slate-800">{data.banner_file.name}</b> &middot; {(data.banner_file.size / 1024).toFixed(0)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="shrink-0 text-[11px] font-bold text-red-600 hover:text-red-800 transition active:scale-95"
                                        >
                                            Batalkan
                                        </button>
                                    </div>
                                ) : existingIsLocal ? (
                                    <p className="text-[11px] text-slate-400 mt-2">Saat ini memakai foto yang sudah diunggah. Pilih foto baru untuk menggantinya.</p>
                                ) : null}

                                {(fileError || errors.banner_file) && (
                                    <p className="sc-pop text-red-500 text-[11px] font-semibold mt-1.5">{fileError || errors.banner_file}</p>
                                )}
                            </div>
                        )}

                        {/* LINK URL */}
                        {data.banner_mode === 'url' && (
                            <div className="sc-pop">
                                <Field
                                    label="Link Gambar"
                                    error={errors.banner_url}
                                    icon={<I.Link className="w-[18px] h-[18px]" />}
                                    hint="Tempel link langsung ke gambar, misalnya https://contoh.com/banner.jpg"
                                >
                                    <input
                                        type="url"
                                        value={data.banner_url}
                                        onChange={(e) => setData('banner_url', e.target.value)}
                                        placeholder="https://contoh.com/banner.jpg"
                                        className={`${inputCls} pl-11 ${errors.banner_url ? errBorder : okBorder}`}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* TANPA GAMBAR */}
                        {data.banner_mode === 'none' && (
                            <div className="sc-pop rounded-xl bg-slate-50 border border-slate-200 px-4 py-4 text-xs text-slate-500 leading-relaxed">
                                Banner memakai <b className="text-blue-700">warna biru polos</b> bawaan SmartCash. Pilih Unggah Foto atau Link URL untuk memakai gambar sendiri.
                            </div>
                        )}

                        {/* TINGKAT GELAP */}
                        {data.banner_mode !== 'none' && (
                            <div className="sc-pop">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Gelapkan Gambar</label>
                                    <span className="text-xs font-bold text-blue-700 tabular-nums">{data.banner_overlay}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={80}
                                    step={5}
                                    value={data.banner_overlay}
                                    onChange={(e) => setData('banner_overlay', Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Naikkan agar tulisan lebih mudah dibaca di atas foto yang terang.</p>
                                {errors.banner_overlay && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.banner_overlay}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FormCard>
    );
}

/* ================================================================== */
/*  BAGIAN 2: KODE UNIK TOKO                                           */
/* ================================================================== */
function StoreCodeSection({ store, showToast }) {
    const currentCode = store?.code || '';
    const { data, setData, put, processing, errors } = useForm({ code: currentCode });
    const [copied, setCopied] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const codeLength = data.code.trim().length;
    const changed = data.code.trim().toUpperCase() !== currentCode;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            // clipboard bisa diblokir di koneksi non-HTTPS
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (codeLength >= 4 && changed) setConfirming(true);
    };

    const doSave = () => {
        setConfirming(false);
        put(route('settings.store-code'), {
            preserveScroll: true,
            onSuccess: () => showToast('success', 'Kode toko berhasil diperbarui!'),
        });
    };

    return (
        <>
            <FormCard
                icon={<I.Key className="w-5 h-5" />}
                title="Kode Unik Toko"
                desc="Kode ini dipakai Anda dan seluruh staf untuk login ke sistem multi-tenant."
                onSubmit={submit}
                footer={
                    <FormFooter
                        processing={processing}
                        changed={changed && codeLength >= 4}
                        onReset={() => setData('code', currentCode)}
                        label="Simpan Kode Baru"
                    />
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* kode saat ini */}
                    <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5 min-h-[18px]">Kode Toko Saat Ini</p>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                            <p className="text-xl font-black tracking-widest text-[#14214f] break-all">{currentCode || '-'}</p>
                            <button
                                type="button"
                                onClick={copy}
                                disabled={!currentCode}
                                className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition duration-200 active:scale-95 disabled:opacity-50 ${
                                    copied ? 'bg-emerald-500 text-white' : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                }`}
                            >
                                <span key={copied ? 'ok' : 'copy'} className="sc-pop">
                                    {copied ? <I.Check className="w-3.5 h-3.5" /> : <I.Copy />}
                                </span>
                                {copied ? 'Tersalin' : 'Salin'}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">Bagikan kode ini ke staf agar mereka bisa login.</p>
                    </div>

                    {/* kode baru */}
                    <Field
                        label="Kode Toko Baru (Min. 4 Karakter)"
                        error={errors.code}
                        right={
                            <button
                                type="button"
                                onClick={() => setData('code', randomStoreCode())}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition active:scale-95"
                            >
                                <I.Dice />
                                Buat acak
                            </button>
                        }
                        hint={`${codeLength} karakter${codeLength > 0 && codeLength < 4 ? ' (minimal 4)' : ''}`}
                    >
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Contoh: KOPENG01"
                            className={`${inputCls} px-4 uppercase font-semibold tracking-wider ${errors.code ? errBorder : okBorder}`}
                            required
                        />
                    </Field>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-6">
                    <span className="mt-0.5 shrink-0 text-amber-600">
                        <I.Alert />
                    </span>
                    <p className="leading-relaxed">
                        Setelah kode diganti, semua staf harus memakai <b>kode baru</b> saat login. Kode lama langsung tidak berlaku, jadi beritahu staf Anda setelah mengubahnya.
                    </p>
                </div>
            </FormCard>

            {confirming && (
                <Dialog onClose={() => setConfirming(false)}>
                    <div className="text-center">
                        <span className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                            <I.Key className="w-5 h-5" />
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-4">Ganti kode toko?</h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Kode akan berubah dari <b className="text-slate-700">{currentCode}</b> menjadi{' '}
                            <b className="text-blue-700">{data.code.trim().toUpperCase()}</b>. Staf harus login dengan kode baru.
                        </p>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={doSave}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                Ya, ganti
                            </button>
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}

/* ================================================================== */
/*  BAGIAN 3: KEAMANAN AKUN (profil akun + kata sandi + hapus akun)    */
/* ================================================================== */
function AccountInfoCard({ user, showToast }) {
    const initial = { name: user.name || '', username: user.username || '', email: user.email || '' };
    const { data, setData, patch, processing, errors } = useForm(initial);
    const changed = data.name !== initial.name || data.username !== initial.username || data.email !== initial.email;

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.account'), {
            preserveScroll: true,
            onSuccess: () => showToast('success', 'Informasi akun berhasil diperbarui!'),
        });
    };

    return (
        <FormCard
            icon={<I.User className="w-5 h-5" />}
            title="Informasi Akun"
            desc="Nama, username, dan email yang dipakai akun Anda."
            onSubmit={submit}
            footer={<FormFooter processing={processing} changed={changed} onReset={() => setData(initial)} />}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                <Field label="Nama Lengkap" error={errors.name} icon={<I.User />}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={`${inputCls} pl-11 ${errors.name ? errBorder : okBorder}`}
                        autoComplete="name"
                        required
                    />
                </Field>

                <Field label="Username" error={errors.username} icon={<I.At />} hint="Dipakai untuk login. Tanpa spasi.">
                    <input
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className={`${inputCls} pl-11 ${errors.username ? errBorder : okBorder}`}
                        autoComplete="username"
                        required
                    />
                </Field>

                <Field className="sm:col-span-2" label="Email" error={errors.email} icon={<I.Mail />}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className={`${inputCls} pl-11 ${errors.email ? errBorder : okBorder}`}
                        autoComplete="email"
                        required
                    />
                </Field>
            </div>
        </FormCard>
    );
}

function PasswordCard({ showToast }) {
    const passwordInput = useRef(null);
    const currentInput = useRef(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const confirmFilled = data.password_confirmation.length > 0;
    const match = confirmFilled && data.password === data.password_confirmation;
    const strength = passwordStrength(data.password);
    const filled = Boolean(data.current_password && data.password && data.password_confirmation);

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.password'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                showToast('success', 'Kata sandi berhasil diperbarui!');
            },
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentInput.current?.focus();
                }
            },
        });
    };

    return (
        <FormCard
            icon={<I.Lock className="w-5 h-5" />}
            title="Ubah Kata Sandi"
            desc="Gunakan kata sandi yang panjang dan sulit ditebak agar akun tetap aman."
            onSubmit={submit}
            footer={
                <FormFooter
                    processing={processing}
                    changed={filled}
                    onReset={() => reset()}
                    label="Perbarui Kata Sandi"
                    idleText="Isi ketiga kolom untuk mengubah"
                />
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                <Field className="sm:col-span-2" label="Kata Sandi Saat Ini" error={errors.current_password} icon={<I.Lock />}>
                    <PasswordInput
                        ref={currentInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        error={errors.current_password}
                    />
                </Field>

                <div>
                    <Field label="Kata Sandi Baru" error={errors.password} icon={<I.Lock />}>
                        <PasswordInput
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                            error={errors.password}
                        />
                    </Field>
                    {strength && (
                        <div className="sc-pop mt-2">
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.w}`} />
                            </div>
                            <p className={`text-[11px] font-semibold mt-1 ${strength.text}`}>Kekuatan password: {strength.label}</p>
                        </div>
                    )}
                </div>

                <div>
                    <Field label="Konfirmasi Kata Sandi Baru" error={errors.password_confirmation} icon={<I.Lock />}>
                        <PasswordInput
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            placeholder="Ulangi kata sandi baru"
                            error={errors.password_confirmation}
                        />
                    </Field>
                    {confirmFilled && !errors.password_confirmation && (
                        <p
                            key={match ? 'cocok' : 'beda'}
                            className={`sc-pop mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${match ? 'text-emerald-600' : 'text-amber-600'}`}
                        >
                            {match ? <I.Check className="w-3.5 h-3.5" /> : <I.Close className="w-3.5 h-3.5" />}
                            {match ? 'Password cocok' : 'Password belum sama'}
                        </p>
                    )}
                </div>
            </div>
        </FormCard>
    );
}

function DangerCard({ isAdmin }) {
    const [open, setOpen] = useState(false);
    const passwordRef = useRef(null);
    const { data, setData, delete: destroy, processing, errors, reset, clearErrors } = useForm({ password: '' });

    const close = () => {
        setOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onError: () => passwordRef.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-red-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <span className="w-11 h-11 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <I.Alert className="w-5 h-5" />
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">Hapus Akun</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Menghapus akun bersifat permanen dan tidak dapat dibatalkan.
                            {isAdmin && ' Admin terakhir toko tidak dapat menghapus akunnya sendiri.'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="shrink-0 inline-flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition duration-200 active:scale-95"
                >
                    <I.Trash />
                    Hapus Akun Saya
                </button>
            </div>

            {open && (
                <Dialog onClose={close}>
                    <form onSubmit={submit}>
                        <div className="text-center">
                            <span className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <I.Trash className="w-5 h-5" />
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-4">Hapus akun Anda?</h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Akun akan dihapus permanen. Masukkan kata sandi Anda untuk mengonfirmasi.
                            </p>
                        </div>

                        <div className="mt-5">
                            <Field label="Kata Sandi" error={errors.password} icon={<I.Lock />}>
                                <PasswordInput
                                    ref={passwordRef}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    autoComplete="current-password"
                                    error={errors.password}
                                />
                            </Field>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={close}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.password}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {processing && <Spinner />}
                                Ya, hapus
                            </button>
                        </div>
                    </form>
                </Dialog>
            )}
        </>
    );
}

function SecuritySection({ user, isAdmin, showToast }) {
    return (
        <div className="space-y-6">
            <AccountInfoCard user={user} showToast={showToast} />
            <PasswordCard showToast={showToast} />
            <DangerCard isAdmin={isAdmin} />
        </div>
    );
}

/* ================================================================== */
/*  BAGIAN: TAMPILAN (TEMA WARNA)                                      */
/*  Warna tiap tema didefinisikan di resources/css/app.css             */
/*  (file theme.css). Di sini hanya contoh mini untuk pratinjau.       */
/* ================================================================== */
const THEMES = [
    { key: 'samudra', name: 'Samudra', tag: 'Biru Klasik', desc: 'Biru bersih dan profesional, tema bawaan SmartCash.', bg: '#f8fafc', surface: '#ffffff', sidebar: '#16255a', primary: '#2563eb', accent: '#38bdf8', line: '#e2e8f0', text: '#0f172a' },
    { key: 'bumi', name: 'Bumi', tag: 'Earth Tone / Organik', desc: 'Hijau sage, terracotta, krem, dan pasir. Tenang, hangat, dan ramah alam.', bg: '#faf8f3', surface: '#fffdf9', sidebar: '#3b3228', primary: '#5e754b', accent: '#c16746', line: '#e8e2d6', text: '#30241b' },
    { key: 'noir', name: 'Noir', tag: 'Monokrom / Hitam Putih', desc: 'Murni hitam, putih, dan abu-abu. Minimalis, klasik, fokus pada konten.', bg: '#fafafa', surface: '#ffffff', sidebar: '#0a0a0a', primary: '#171717', accent: '#a3a3a3', line: '#e5e5e5', text: '#171717' },
    { key: 'malam', name: 'Malam', tag: 'Mode Gelap', desc: 'Gelap dan nyaman di mata saat bekerja di malam hari.', bg: '#0b1220', surface: '#111a2e', sidebar: '#0a1124', primary: '#2563eb', accent: '#38bdf8', line: '#2d3a52', text: '#e2e8f0' },
];

const THEME_KEYS = THEMES.map((t) => t.key);

function ThemeMock({ t }) {
    return (
        <div className="h-28 rounded-xl overflow-hidden flex border" style={{ background: t.bg, borderColor: t.line }}>
            <div className="w-1/4 p-2 space-y-1.5" style={{ background: t.sidebar }}>
                <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,.35)' }} />
                <div className="h-2 rounded-full" style={{ background: t.primary }} />
                <div className="h-2 rounded-full w-2/3" style={{ background: 'rgba(255,255,255,.2)' }} />
                <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,.2)' }} />
                <div className="h-2 w-2 rounded-full" style={{ background: t.accent }} />
            </div>
            <div className="flex-1 p-2.5 space-y-2">
                <div className="h-2.5 w-1/3 rounded-full" style={{ background: t.text, opacity: 0.75 }} />
                <div className="rounded-lg p-2 space-y-1.5" style={{ background: t.surface, border: `1px solid ${t.line}` }}>
                    <div className="h-1.5 rounded-full w-full" style={{ background: t.line }} />
                    <div className="h-1.5 rounded-full w-4/5" style={{ background: t.line }} />
                    <div className="h-4 w-14 rounded-md" style={{ background: t.primary }} />
                </div>
            </div>
        </div>
    );
}

function ThemeSection({ savedTheme, showToast }) {
    const { data, setData, put, processing } = useForm({ theme: savedTheme });
    const changed = data.theme !== savedTheme;

    // pratinjau langsung di seluruh halaman saat tema dipilih
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', data.theme);
    }, [data.theme]);

    // keluar dari halaman tanpa menyimpan: kembalikan ke tema yang tersimpan
    const savedRef = useRef(savedTheme);
    savedRef.current = savedTheme;
    useEffect(
        () => () => {
            document.documentElement.setAttribute('data-theme', savedRef.current);
        },
        []
    );

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.theme'), {
            preserveScroll: true,
            onSuccess: () => showToast('success', 'Tema tampilan berhasil diperbarui untuk semua pengguna toko!'),
        });
    };

    return (
        <FormCard
            icon={<I.Palette className="w-5 h-5" />}
            title="Tampilan & Tema"
            desc="Pilih warna aplikasi. Tema berlaku untuk seluruh halaman dan semua pengguna toko ini."
            onSubmit={submit}
            footer={
                <FormFooter
                    processing={processing}
                    changed={changed}
                    onReset={() => setData('theme', savedTheme)}
                    label="Simpan Tema"
                    idleText="Tema sudah tersimpan"
                />
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Pilih tema">
                {THEMES.map((t) => {
                    const active = data.theme === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setData('theme', t.key)}
                            className={`group text-left rounded-2xl border-2 p-3 transition duration-200 active:scale-[.98] ${
                                active ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 hover:border-blue-300 hover:-translate-y-0.5'
                            }`}
                        >
                            <ThemeMock t={t} />
                            <div className="flex items-start justify-between gap-3 mt-3 px-1">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {t.name} <span className="text-[11px] font-semibold text-slate-400">&middot; {t.tag}</span>
                                    </p>
                                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.desc}</p>
                                </div>
                                <span
                                    className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center transition ${
                                        active ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                                    }`}
                                >
                                    <I.Check className="w-3 h-3" />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="flex items-start gap-2 text-xs text-slate-500 mt-5 leading-relaxed">
                <span className="mt-0.5 text-blue-600 shrink-0">
                    <I.Alert />
                </span>
                Warna langsung dipratinjau di seluruh halaman saat Anda memilih. Klik <b className="text-slate-700">Simpan Tema</b> agar tetap dipakai oleh semua staf.
            </p>
        </FormCard>
    );
}

/* ================================================================== */
/*  HALAMAN PENGATURAN                                                 */
/* ================================================================== */
export default function Index({ auth, store, initialTab }) {
    const user = auth.user;
    const isAdmin = user.role === 'admin';

    const tabs = [
        ...(isAdmin
            ? [
                  { key: 'store', title: 'Profil & Banner', icon: <I.Store className="w-[18px] h-[18px]" /> },
                  { key: 'code', title: 'Kode Unik Toko', icon: <I.Key className="w-[18px] h-[18px]" /> },
                  { key: 'theme', title: 'Tampilan', icon: <I.Palette className="w-[18px] h-[18px]" /> },
              ]
            : []),
        { key: 'security', title: 'Keamanan Akun', icon: <I.Shield className="w-[18px] h-[18px]" /> },
    ];

    const [tab, setTab] = useState(() => (tabs.some((t) => t.key === initialTab) ? initialTab : tabs[0].key));
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const selectTab = (key) => {
        setTab(key);
        try {
            window.history.replaceState(window.history.state, '', `${window.location.pathname}?tab=${key}`);
        } catch (e) {
            // abaikan
        }
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <I.Gear />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Pengaturan <span className="text-blue-600">SmartCash</span>
                    </h2>
                </div>
            }
        >
            <Head title="Pengaturan" />
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[60]">
                    <div
                        key={toast.id}
                        className={`sc-toast flex items-start gap-3 max-w-sm rounded-2xl px-4 py-3 border text-sm font-semibold ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <span
                            className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-white ${
                                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        >
                            {toast.type === 'success' ? <I.Check /> : <I.Close className="w-3 h-3" />}
                        </span>
                        <span className="leading-snug">{toast.message}</span>
                        <button type="button" onClick={() => setToast(null)} aria-label="Tutup" className="ml-1 opacity-60 hover:opacity-100 transition">
                            <I.Close className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                {/* RINGKASAN TOKO & AKUN */}
                <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <span className="w-12 h-12 shrink-0 rounded-xl bg-blue-600 text-white text-lg font-extrabold flex items-center justify-center">
                            {(store?.name || 'S').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate">{store?.name || 'Toko Anda'}</p>
                            <p className="text-xs text-slate-500 truncate">{store?.address || 'Alamat toko belum diisi'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                            <I.Key className="w-3.5 h-3.5" />
                            {store?.code || '-'}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize ${isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* TAB BAGIAN */}
                <div role="tablist" className="sc-noscroll flex gap-1 overflow-x-auto border-b border-slate-200">
                    {tabs.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => selectTab(t.key)}
                                className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 -mb-px text-sm font-bold border-b-2 transition-colors duration-200 ${
                                    active
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                {t.icon}
                                {t.title}
                            </button>
                        );
                    })}
                </div>

                {/* ISI BAGIAN */}
                <div key={tab} className="sc-rowin">
                    {tab === 'store' && isAdmin && <StoreProfileSection store={store} showToast={showToast} />}
                    {tab === 'code' && isAdmin && <StoreCodeSection store={store} showToast={showToast} />}
                    {tab === 'theme' && isAdmin && <ThemeSection savedTheme={THEME_KEYS.includes(store?.theme) ? store.theme : 'samudra'} showToast={showToast} />}
                    {tab === 'security' && <SecuritySection user={user} isAdmin={isAdmin} showToast={showToast} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}