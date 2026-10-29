import React, { useState } from 'react';

/* ================================================================== */
/*  Komponen bersama untuk halaman Login & Register                    */
/*  Letakkan di: resources/js/Components/AuthUI.jsx                    */
/* ================================================================== */

const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icons = {
    Store: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M4 9.5 5.5 4h13L20 9.5" />
            <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
            <path d="M5 12.5V20h14v-7.5" />
            <path d="M10 20v-4.5h4V20" />
        </svg>
    ),
    User: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.500 7.500 6.500" />
        </svg>
    ),
    At: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M15.500 12v1.500a2.500 2.500 0 0 0 5 0V12a8.500 8.500 0 1 0-3.400 6.800" />
        </svg>
    ),
    Mail: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    ),
    Lock: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="4.500" y="10.500" width="15" height="10" rx="3" />
            <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" />
        </svg>
    ),
    Eye: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M2 12s3.600-6.500 10-6.500S22 12 22 12s-3.600 6.500-10 6.500S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M3 3l18 18" />
            <path d="M10.600 5.600A9.500 9.500 0 0 1 12 5.500c6.400 0 10 6.500 10 6.500a17 17 0 0 1-3.200 4M6.500 7.200A17 17 0 0 0 2 12s3.600 6.500 10 6.500c1.500 0 2.800-.3 4-.8" />
            <path d="M9.900 9.900a3 3 0 0 0 4.200 4.200" />
        </svg>
    ),
    ArrowLeft: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
    ),
    Arrow: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    ),
    Check: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="m5 12.500 4.500 4.500L19 7.500" />
        </svg>
    ),
    Close: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    ),
};

export const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Terjemahan pesan bawaan Laravel (status & validasi) ke bahasa Indonesia */
const MESSAGES = {
    'We have emailed your password reset link.': 'Tautan reset kata sandi sudah dikirim ke email Anda.',
    'Your password has been reset.': 'Kata sandi Anda berhasil direset. Silakan login dengan kata sandi baru.',
    "We can't find a user with that email address.": 'Email tidak terdaftar di sistem kami.',
    'Please wait before retrying.': 'Mohon tunggu sebentar sebelum mencoba lagi.',
    'This password reset token is invalid.': 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.',
    'The email field is required.': 'Email wajib diisi.',
    'The email field must be a valid email address.': 'Format email tidak valid.',
    'The email must be a valid email address.': 'Format email tidak valid.',
    'The password field is required.': 'Kata sandi wajib diisi.',
    'The password field confirmation does not match.': 'Konfirmasi kata sandi tidak cocok.',
    'The password confirmation does not match.': 'Konfirmasi kata sandi tidak cocok.',
};

export const idMessage = (msg) => {
    if (!msg || typeof msg !== 'string') return msg;
    if (MESSAGES[msg]) return MESSAGES[msg];
    const m = msg.match(/password(?: field)? must be at least (\d+) characters/i);
    if (m) return `Kata sandi minimal ${m[1]} karakter.`;
    if (/password.*confirmation does not match/i.test(msg)) return 'Konfirmasi kata sandi tidak cocok.';
    if (/password.*(letter|uppercase|lowercase|number|symbol|data leak)/i.test(msg)) return 'Kata sandi belum memenuhi syarat keamanan. Gunakan kombinasi huruf besar, huruf kecil, dan angka.';
    return msg;
};

/* Input dengan label, ikon kiri, tombol mata (untuk password), dan pesan error */
export function AuthInput({ id, name, label, icon, error, hint, type = 'text', right, uppercase = false, ...props }) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
                    {label}
                </label>
                {right}
            </div>

            <div className="group relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                        {icon}
                    </span>
                )}

                <input
                    id={id}
                    name={name ?? id}
                    type={isPassword && show ? 'text' : type}
                    {...props}
                    className={`w-full rounded-xl bg-white py-3 text-sm placeholder:text-slate-400 transition duration-200 focus:ring-4 ${
                        icon ? 'pl-11' : 'pl-4'
                    } ${isPassword ? 'pr-12' : 'pr-4'} read-only:bg-slate-50 read-only:text-slate-500 read-only:cursor-default ${uppercase ? 'uppercase tracking-wider font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:font-normal' : ''} ${
                        error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                    >
                        {show ? <Icons.EyeOff /> : <Icons.Eye />}
                    </button>
                )}
            </div>

            {hint && !error && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
            {error && <p className="sc-pop text-red-500 text-xs font-semibold mt-1.5">{idMessage(error)}</p>}
        </div>
    );
}

/* Tombol kirim utama */
export function SubmitButton({ processing, children, loadingText = 'Memproses...' }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="group w-full inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition duration-200 hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-60 disabled:pointer-events-none"
        >
            {processing ? (
                <>
                    <Spinner />
                    {loadingText}
                </>
            ) : (
                <>
                    {children}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                        <Icons.Arrow />
                    </span>
                </>
            )}
        </button>
    );
}

/* Indikator kekuatan password */
export const passwordStrength = (pw) => {
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

export function StrengthMeter({ password }) {
    const s = passwordStrength(password);
    if (!s) return null;
    return (
        <div className="sc-pop mt-2">
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${s.bar} ${s.w}`} />
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${s.text}`}>Kekuatan password: {s.label}</p>
        </div>
    );
}