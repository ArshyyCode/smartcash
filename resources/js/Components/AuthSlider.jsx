import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthInput, SubmitButton, StrengthMeter, MatchHint, Icons, idMessage } from '@/Components/AuthUI';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

/* ================================================================== */
/*  Form Masuk + Daftar dalam satu kartu dengan animasi geser.         */
/*  Dipakai oleh Pages/Auth/Login.jsx dan Pages/Auth/Register.jsx      */
/*  (keduanya meng-export komponen yang SAMA, sehingga isi form dan    */
/*  pesan error tetap terjaga saat berpindah antara Masuk/Daftar).     */
/*  Letakkan di: resources/js/Components/AuthSlider.jsx                */
/*  Gaya (kelas "sa-*") ada di Layouts/GuestLayout.jsx.                */
/* ================================================================== */

const SPRING = 'cubic-bezier(.22,1,.36,1)';

const TABS = [
    { key: 'login', label: 'Masuk' },
    { key: 'register', label: 'Daftar' },
];

export default function AuthSlider({ status, canResetPassword }) {
    const { url } = usePage();

    // mode awal mengikuti alamat halaman (/register -> form daftar, selain itu -> masuk)
    const [mode, setMode] = useState(() => (String(url).includes('/register') ? 'register' : 'login'));
    const initialMode = useRef(mode).current;
    const isRegister = mode === 'register';

    /* ---------- form Masuk (memakai kode toko + username) ---------- */
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

    /* ---------- form Daftar ---------- */
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
            return undefined;
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

    return (
        <GuestLayout>
            <Head title={isRegister ? 'Daftar Toko Baru' : 'Masuk ke SmartCash'} />

            {/* ===================== SAKLAR MASUK / DAFTAR ===================== */}
            <div role="tablist" aria-label="Pilih masuk atau daftar" className="sa-seg mb-7">
                <span
                    aria-hidden="true"
                    className="sa-seg-thumb"
                    style={{ transform: isRegister ? 'translateX(100%)' : 'translateX(0)', transitionTimingFunction: SPRING }}
                />
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={mode === tab.key}
                        onClick={() => switchMode(tab.key)}
                        className="sa-seg-tab"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===================== AREA GESER ===================== */}
            <div className="sa-frame -mx-2 overflow-hidden" style={{ height: height ?? 'auto' }}>
                <div
                    className="sa-track flex items-start"
                    style={{ transform: isRegister ? 'translateX(-100%)' : 'translateX(0)', transitionTimingFunction: SPRING }}
                >
                    {/* ---------- PANEL MASUK ---------- */}
                    <div ref={loginRef} className="w-full shrink-0 px-2 pb-1" style={panelStyle(!isRegister)} aria-hidden={isRegister}>
                        <div className="mb-6">
                            <h2 className="sa-h text-2xl font-extrabold tracking-tight">Selamat datang kembali</h2>
                            <p className="sa-muted mt-1.5 text-sm leading-relaxed">Masuk ke akun toko Anda untuk melanjutkan.</p>
                        </div>

                        {status && (
                            <div role="status" className="sa-pop sa-alert sa-alert-ok mb-5">
                                <span className="sa-alert-ico">
                                    <Icons.Check className="h-3 w-3" />
                                </span>
                                <p>{idMessage(status)}</p>
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
                                placeholder="Contoh: STR-PTNMD4"
                                hint="Kode toko bisa dilihat admin di menu Pengaturan."
                                error={loginForm.errors.store_code}
                                autoComplete="off"
                                autoFocus={initialMode === 'login'}
                                required
                            />

                            <AuthInput
                                id="login-username"
                                name="username"
                                label="Username atau Email"
                                icon={<Icons.At />}
                                value={loginForm.data.username}
                                onChange={(e) => loginForm.setData('username', e.target.value)}
                                placeholder="Masukkan username atau email"
                                autoComplete="username"
                                error={loginForm.errors.username || loginForm.errors.email}
                                required
                            />

                            <AuthInput
                                id="login-password"
                                name="password"
                                label="Kata Sandi"
                                icon={<Icons.Lock />}
                                type="password"
                                value={loginForm.data.password}
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi"
                                autoComplete="current-password"
                                error={loginForm.errors.password}
                                right={
                                    canResetPassword !== false && (
                                        <Link href={route('password.request')} className="sa-link sa-link-sm">
                                            Lupa kata sandi?
                                        </Link>
                                    )
                                }
                                required
                            />

                            <label className="sa-checkrow">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={loginForm.data.remember}
                                    onChange={(e) => loginForm.setData('remember', e.target.checked)}
                                    className="sa-checkbox"
                                />
                                <span className="sa-body text-sm">Ingat saya di perangkat ini</span>
                            </label>

                            <SubmitButton processing={loginForm.processing} loadingText="Memproses...">
                                Masuk
                            </SubmitButton>
                        </form>

                        <p className="sa-muted mt-6 text-center text-sm">
                            Belum punya toko?{' '}
                            <button type="button" onClick={() => switchMode('register')} className="sa-link">
                                Daftar sekarang
                            </button>
                        </p>
                    </div>

                    {/* ---------- PANEL DAFTAR ---------- */}
                    <div ref={registerRef} className="w-full shrink-0 px-2 pb-1" style={panelStyle(isRegister)} aria-hidden={!isRegister}>
                        <div className="mb-6">
                            <h2 className="sa-h text-2xl font-extrabold tracking-tight">Daftar toko baru</h2>
                            <p className="sa-muted mt-1.5 text-sm leading-relaxed">Buat akun pemilik toko untuk mulai mengelola kasir Anda.</p>
                        </div>

                        <form onSubmit={submitRegister} className="space-y-4">
                            <AuthInput
                                id="register-store_name"
                                name="store_name"
                                label="Nama Toko atau Usaha"
                                icon={<Icons.Store />}
                                value={registerForm.data.store_name}
                                onChange={(e) => registerForm.setData('store_name', e.target.value)}
                                placeholder="Contoh: Koperasi SMK 1 Nganjuk"
                                error={registerForm.errors.store_name}
                                autoFocus={initialMode === 'register'}
                                required
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <AuthInput
                                    id="register-name"
                                    name="name"
                                    label="Nama Pemilik"
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
                                    label="Kata Sandi"
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
                                    label="Konfirmasi Kata Sandi"
                                    icon={<Icons.Lock />}
                                    type="password"
                                    value={registerForm.data.password_confirmation}
                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi kata sandi"
                                    autoComplete="new-password"
                                    error={registerForm.errors.password_confirmation}
                                    required
                                />
                                <MatchHint
                                    filled={confirmFilled}
                                    match={passwordsMatch}
                                    hidden={Boolean(registerForm.errors.password_confirmation)}
                                />
                            </div>

                            <div className="pt-1">
                                <SubmitButton processing={registerForm.processing} loadingText="Mendaftarkan...">
                                    Daftarkan Toko
                                </SubmitButton>
                            </div>
                        </form>

                        <p className="sa-muted mt-6 text-center text-sm">
                            Sudah punya akun toko?{' '}
                            <button type="button" onClick={() => switchMode('login')} className="sa-link">
                                Masuk
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}