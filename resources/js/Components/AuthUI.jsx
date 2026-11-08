import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

/* ================================================================== */
/*  Komponen bersama halaman Login, Daftar, Lupa Password, dst.        */
/*  Letakkan di: resources/js/Components/AuthUI.jsx                    */
/*                                                                     */
/*  Semua kelas "sa-*" didefinisikan di Layouts/GuestLayout.jsx, jadi  */
/*  komponen ini harus dipakai di dalam <GuestLayout>.                 */
/* ================================================================== */

const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

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
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    ),
    Close: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    ),
    Sun: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
    ),
    Moon: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
        </svg>
    ),
};

export const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sa-spin h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Terjemahan pesan bawaan Laravel (status & validasi) ke bahasa Indonesia */
const MESSAGES = {
    'We have emailed your password reset link.': 'Tautan reset kata sandi sudah dikirim ke email Anda.',
    'Your password has been reset.': 'Kata sandi Anda berhasil direset. Silakan masuk dengan kata sandi baru.',
    "We can't find a user with that email address.": 'Email tidak terdaftar di sistem kami.',
    'Please wait before retrying.': 'Mohon tunggu sebentar sebelum mencoba lagi.',
    'This password reset token is invalid.': 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.',
    'The email field is required.': 'Email wajib diisi.',
    'The email field must be a valid email address.': 'Format email tidak valid.',
    'The email must be a valid email address.': 'Format email tidak valid.',
    'The password field is required.': 'Kata sandi wajib diisi.',
    'The password field confirmation does not match.': 'Konfirmasi kata sandi tidak cocok.',
    'The password confirmation does not match.': 'Konfirmasi kata sandi tidak cocok.',
    'The provided password is incorrect.': 'Kata sandi yang Anda masukkan salah.',
    'These credentials do not match our records.': 'Data masuk tidak cocok dengan catatan kami.',
    'Too many login attempts.': 'Terlalu banyak percobaan masuk. Coba lagi beberapa saat lagi.',
    'verification-link-sent': 'Tautan verifikasi baru sudah dikirim ke email Anda.',
};

export const idMessage = (msg) => {
    if (!msg || typeof msg !== 'string') return msg;
    if (MESSAGES[msg]) return MESSAGES[msg];
    const m = msg.match(/password(?: field)? must be at least (\d+) characters/i);
    if (m) return `Kata sandi minimal ${m[1]} karakter.`;
    if (/password.*confirmation does not match/i.test(msg)) return 'Konfirmasi kata sandi tidak cocok.';
    if (/password.*(letter|uppercase|lowercase|number|symbol|data leak)/i.test(msg)) return 'Kata sandi belum memenuhi syarat keamanan. Gunakan kombinasi huruf besar, huruf kecil, dan angka.';
    if (/too many (login )?attempts/i.test(msg)) return 'Terlalu banyak percobaan masuk. Coba lagi beberapa saat lagi.';
    return msg;
};

/* Judul halaman: ikon, judul, dan keterangan singkat */
export function AuthHeader({ icon, title, children }) {
    return (
        <div className="mb-6">
            {icon && <span className="sa-tile mb-4">{icon}</span>}
            <h2 className="sa-h text-2xl font-extrabold tracking-tight">{title}</h2>
            {children && <p className="sa-muted mt-1.5 text-sm leading-relaxed">{children}</p>}
        </div>
    );
}

/* Pemberitahuan sukses (status Laravel, tautan terkirim, dst.) */
export function AuthNotice({ children, detail, className = '' }) {
    return (
        <div role="status" className={`sa-pop sa-alert sa-alert-ok ${className}`}>
            <span className="sa-alert-ico">
                <Icons.Check className="h-3 w-3" />
            </span>
            <div>
                <p>{typeof children === 'string' ? idMessage(children) : children}</p>
                {detail && <p className="mt-1.5 text-xs font-medium opacity-90">{detail}</p>}
            </div>
        </div>
    );
}

/* Tombol sekunder "kembali ke halaman masuk" */
export function BackToLogin({ className = 'mt-4' }) {
    return (
        <Link href={route('login')} className={`group sa-btn sa-btn-outline ${className}`}>
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
                <Icons.ArrowLeft />
            </span>
            Kembali ke halaman masuk
        </Link>
    );
}

/* Input dengan label, ikon kiri, tombol mata (untuk kata sandi), petunjuk, dan pesan error */
export function AuthInput({ id, name, label, icon, error, hint, type = 'text', right, uppercase = false, ...props }) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor={id} className="sa-label">
                    {label}
                </label>
                {right}
            </div>

            <div className="sa-field-wrap relative">
                {icon && (
                    <span className="sa-field-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
                )}

                <input
                    id={id}
                    name={name ?? id}
                    type={isPassword && show ? 'text' : type}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    {...props}
                    className={`sa-field${icon ? ' has-icon' : ''}${isPassword ? ' has-eye' : ''}${uppercase ? ' is-upper' : ''}${error ? ' is-invalid' : ''}`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        aria-pressed={show}
                        className="sa-eye"
                    >
                        {show ? <Icons.EyeOff /> : <Icons.Eye />}
                    </button>
                )}
            </div>

            {hint && !error && (
                <p id={`${id}-hint`} className="sa-hint">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="sa-pop sa-error">
                    {idMessage(error)}
                </p>
            )}
        </div>
    );
}

/* Tombol kirim utama */
export function SubmitButton({ processing, children, loadingText = 'Memproses...' }) {
    return (
        <button type="submit" disabled={processing} aria-busy={processing} className="group sa-btn sa-btn-primary">
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

/* Indikator kekuatan kata sandi */
export const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
    if (pw.length < 6) score = Math.min(score, 1);
    const levels = [
        { label: 'Sangat lemah', tone: 'bad', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Lemah', tone: 'bad', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Sedang', tone: 'warn', bar: 'bg-amber-400', text: 'text-amber-600', w: 'w-2/4' },
        { label: 'Kuat', tone: 'ok', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-3/4' },
        { label: 'Sangat kuat', tone: 'ok', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-full' },
    ];
    return levels[score];
};

export function StrengthMeter({ password }) {
    const s = passwordStrength(password);
    if (!s) return null;
    return (
        <div className="sa-pop mt-2.5">
            <div className="sa-meter" role="presentation">
                <div className={`sa-meter-bar sa-bar-${s.tone} ${s.w}`} />
            </div>
            <p className={`mt-1.5 text-xs font-semibold sa-tx-${s.tone}`} aria-live="polite">
                Kekuatan kata sandi: {s.label}
            </p>
        </div>
    );
}

/* Petunjuk "kata sandi cocok / belum sama" untuk kolom konfirmasi */
export function MatchHint({ filled, match, hidden = false }) {
    if (!filled || hidden) return null;
    return (
        <p
            key={match ? 'cocok' : 'beda'}
            aria-live="polite"
            className={`sa-pop mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${match ? 'sa-tx-ok' : 'sa-tx-warn'}`}
        >
            {match ? <Icons.Check /> : <Icons.Close />}
            {match ? 'Kata sandi cocok' : 'Kata sandi belum sama'}
        </p>
    );
}