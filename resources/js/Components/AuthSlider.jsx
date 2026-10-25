import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthInput, SubmitButton, StrengthMeter, Icons } from '@/Components/AuthUI';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

/* ================================================================== */
/*  Form Login + Register dalam satu kartu dengan animasi geser.       */
/*  Dipakai oleh Pages/Auth/Login.jsx dan Pages/Auth/Register.jsx      */
/*  (keduanya meng-export komponen yang SAMA, sehingga state form dan  */
/*  pesan error tetap terjaga saat berpindah antara Login/Register).   */
/*  Letakkan di: resources/js/Components/AuthSlider.jsx                */
/* ================================================================== */

const css = `
.sc-track { transition: transform .55s cubic-bezier(.22,1,.36,1) }
.sc-pill { transition: transform .55s cubic-bezier(.22,1,.36,1) }
.sc-frame { transition: height .5s cubic-bezier(.22,1,.36,1) }
.sc-panel { transition: opacity .4s ease }
@media (prefers-reduced-motion: reduce) {
    .sc-track, .sc-pill, .sc-frame, .sc-panel { transition: none !important }
}
`;

export default function AuthSlider({ status, canResetPassword }) {
    const { url } = usePage();

    // mode awal mengikuti alamat halaman (/register -> form daftar, selain itu -> login)
    const [mode, setMode] = useState(() => (String(url).includes('/register') ? 'register' : 'login'));
    const initialMode = useRef(mode).current;

    const isRegister = mode === 'register';

    /* ---------- form Login (memakai username) ---------- */
    const loginForm = useForm({
        store_code: '',
        username: '',
        password: '',
        remember: false,
    });

    const submitLogin = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    /* ---------- form Register ---------- */
    const registerForm = useForm({
        store_name: '',
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submitRegister = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onFinish: () => registerForm.reset('password', 'password_confirmation'),
        });
    };

    const confirmFilled = registerForm.data.password_confirmation.length > 0;
    const passwordsMatch = confirmFilled && registerForm.data.password === registerForm.data.password_confirmation;

    /* ---------- pindah form (tanpa memuat ulang halaman) ---------- */
    const switchMode = (next) => {
        if (next === mode) return;
        setMode(next);
        try {
            // ubah alamat di bar browser saja; state Inertia tetap dipertahankan
            const path = new URL(route(next)).pathname;
            window.history.replaceState(window.history.state, '', path);
        } catch (e) {
            // abaikan bila route tidak bisa dibaca
        }
    };

    // fokuskan kolom pertama setelah form bergeser
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        const t = setTimeout(() => {
            document.getElementById(isRegister ? 'register-store_name' : 'login-store_code')?.focus({ preventScroll: true });
        }, 380);
        return () => clearTimeout(t);
    }, [isRegister]);

    /* ---------- tinggi kartu mengikuti form yang aktif ---------- */
    const loginRef = useRef(null);
    const registerRef = useRef(null);
    const [height, setHeight] = useState(null);

    useLayoutEffect(() => {
        const el = (isRegister ? registerRef : loginRef).current;
        if (!el) return undefined;
        const update = () => setHeight(el.offsetHeight);
        update();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [isRegister]);

    // panel yang tidak aktif disembunyikan (setelah geseran selesai) agar tidak bisa difokus
    const panelStyle = (active) => ({
        opacity: active ? 1 : 0,
        visibility: active ? 'visible' : 'hidden',
        transition: `opacity .4s ease, visibility 0s linear ${active ? '0s' : '.5s'}`,
    });

    const spring = 'cubic-bezier(.22,1,.36,1)';

    return (
        <GuestLayout>
            <Head title={isRegister ? 'Daftar Toko Baru' : 'Log in Toko'} />
            <style>{css}</style>

            {/* ===================== SAKLAR MASUK / DAFTAR ===================== */}
            <div role="tablist" aria-label="Pilih Masuk atau Daftar" className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-7">
                <span
                    aria-hidden="true"
                    className="sc-pill absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm"
                    style={{ transform: isRegister ? 'translateX(100%)' : 'translateX(0)', transitionTimingFunction: spring }}
                />
                {[
                    { key: 'login', label: 'Masuk' },
                    { key: 'register', label: 'Daftar' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={mode === tab.key}
                        onClick={() => switchMode(tab.key)}
                        className={`relative z-10 py-2.5 text-sm font-bold rounded-lg transition-colors duration-300 active:scale-[.97] ${
                            mode === tab.key ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===================== AREA GESER ===================== */}
            <div className="sc-frame -mx-2 overflow-hidden" style={{ height: height ?? 'auto' }}>
                <div
                    className="sc-track flex items-start"
                    style={{ transform: isRegister ? 'translateX(-100%)' : 'translateX(0)', transitionTimingFunction: spring }}
                >
                    {/* ---------- PANEL LOGIN ---------- */}
                    <div ref={loginRef} className="sc-panel w-full shrink-0 px-2 pb-1" style={panelStyle(!isRegister)} aria-hidden={isRegister}>
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#14214f]">Selamat datang kembali</h2>
                            <p className="text-sm text-slate-500 mt-1">Masuk ke akun toko Anda untuk melanjutkan.</p>
                        </div>

                        {status && (
                            <div className="sc-pop mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <Icons.Check className="w-3 h-3" />
                                </span>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submitLogin} className="space-y-4">
                            <AuthInput
                                id="login-store_code"
                                name="store_code"
                                label="Kode Toko"
                                icon={<Icons.Store />}
                                uppercase
                                value={loginForm.data.store_code}
                                onChange={(e) => loginForm.setData('store_code', e.target.value)}
                                placeholder="Masukkan Kode Toko (misal: STR-PTNMD4)"
                                hint="Kode toko dapat dilihat admin pada halaman Dashboard."
                                error={loginForm.errors.store_code}
                                autoFocus={initialMode === 'login'}
                                required
                            />

                            <AuthInput
                                id="login-username"
                                name="username"
                                label="Username"
                                icon={<Icons.At />}
                                value={loginForm.data.username}
                                onChange={(e) => loginForm.setData('username', e.target.value)}
                                placeholder="Masukkan username"
                                autoComplete="username"
                                error={loginForm.errors.username || loginForm.errors.email}
                                required
                            />

                            <AuthInput
                                id="login-password"
                                name="password"
                                label="Password"
                                icon={<Icons.Lock />}
                                type="password"
                                value={loginForm.data.password}
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                autoComplete="current-password"
                                error={loginForm.errors.password}
                                right={
                                    canResetPassword !== false && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Lupa password?
                                        </Link>
                                    )
                                }
                                required
                            />

                            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={loginForm.data.remember}
                                    onChange={(e) => loginForm.setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200 transition"
                                />
                                <span className="text-sm text-slate-600">Ingat saya</span>
                            </label>

                            <SubmitButton processing={loginForm.processing} loadingText="Memproses...">
                                Log in
                            </SubmitButton>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Belum punya toko?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('register')}
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Daftar sekarang
                            </button>
                        </p>
                    </div>

                    {/* ---------- PANEL REGISTER ---------- */}
                    <div ref={registerRef} className="sc-panel w-full shrink-0 px-2 pb-1" style={panelStyle(isRegister)} aria-hidden={!isRegister}>
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#14214f]">Daftar Toko SmartCash Baru</h2>
                            <p className="text-sm text-slate-500 mt-1">Buat akun pemilik toko untuk mulai mengelola kasir Anda.</p>
                        </div>

                        <form onSubmit={submitRegister} className="space-y-4">
                            <AuthInput
                                id="register-store_name"
                                name="store_name"
                                label="Nama Toko / Usaha"
                                icon={<Icons.Store />}
                                value={registerForm.data.store_name}
                                onChange={(e) => registerForm.setData('store_name', e.target.value)}
                                placeholder="Contoh: Koperasi SMK 1 Nganjuk"
                                error={registerForm.errors.store_name}
                                autoFocus={initialMode === 'register'}
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AuthInput
                                    id="register-name"
                                    name="name"
                                    label="Nama Pemilik Toko"
                                    icon={<Icons.User />}
                                    value={registerForm.data.name}
                                    onChange={(e) => registerForm.setData('name', e.target.value)}
                                    placeholder="Nama lengkap"
                                    autoComplete="name"
                                    error={registerForm.errors.name}
                                    required
                                />
                                <AuthInput
                                    id="register-username"
                                    name="username"
                                    label="Username Pemilik"
                                    icon={<Icons.At />}
                                    value={registerForm.data.username}
                                    onChange={(e) => registerForm.setData('username', e.target.value)}
                                    placeholder="username"
                                    autoComplete="username"
                                    error={registerForm.errors.username}
                                    required
                                />
                            </div>

                            <AuthInput
                                id="register-email"
                                name="email"
                                label="Email"
                                icon={<Icons.Mail />}
                                type="email"
                                value={registerForm.data.email}
                                onChange={(e) => registerForm.setData('email', e.target.value)}
                                placeholder="email@domain.com"
                                autoComplete="email"
                                error={registerForm.errors.email}
                                required
                            />

                            <div>
                                <AuthInput
                                    id="register-password"
                                    name="password"
                                    label="Password"
                                    icon={<Icons.Lock />}
                                    type="password"
                                    value={registerForm.data.password}
                                    onChange={(e) => registerForm.setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    error={registerForm.errors.password}
                                    required
                                />
                                <StrengthMeter password={registerForm.data.password} />
                            </div>

                            <div>
                                <AuthInput
                                    id="register-password_confirmation"
                                    name="password_confirmation"
                                    label="Konfirmasi Password"
                                    icon={<Icons.Lock />}
                                    type="password"
                                    value={registerForm.data.password_confirmation}
                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password"
                                    autoComplete="new-password"
                                    error={registerForm.errors.password_confirmation}
                                    required
                                />
                                {confirmFilled && !registerForm.errors.password_confirmation && (
                                    <p
                                        key={passwordsMatch ? 'cocok' : 'beda'}
                                        className={`sc-pop mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${
                                            passwordsMatch ? 'text-emerald-600' : 'text-amber-600'
                                        }`}
                                    >
                                        {passwordsMatch ? <Icons.Check /> : <Icons.Close />}
                                        {passwordsMatch ? 'Password cocok' : 'Password belum sama'}
                                    </p>
                                )}
                            </div>

                            <div className="pt-1">
                                <SubmitButton processing={registerForm.processing} loadingText="Mendaftarkan...">
                                    Daftarkan Toko
                                </SubmitButton>
                            </div>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Sudah punya akun toko?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
