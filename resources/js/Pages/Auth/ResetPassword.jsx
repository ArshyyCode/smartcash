import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthInput, SubmitButton, StrengthMeter, Icons } from '@/Components/AuthUI';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const confirmFilled = data.password_confirmation.length > 0;
    const passwordsMatch = confirmFilled && data.password === data.password_confirmation;

    return (
        <GuestLayout>
            <Head title="Reset Kata Sandi" />

            <div className="mb-6">
                <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icons.Lock className="w-6 h-6" />
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#14214f]">Buat kata sandi baru</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Pilih kata sandi yang kuat dan belum pernah Anda pakai di tempat lain.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* email terhubung dengan tautan reset, jadi tidak bisa diubah */}
                <AuthInput
                    id="reset-email"
                    name="email"
                    label="Email"
                    icon={<Icons.Mail />}
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="username"
                    error={errors.email}
                    readOnly
                />

                <div>
                    <AuthInput
                        id="reset-password"
                        name="password"
                        label="Kata Sandi Baru"
                        icon={<Icons.Lock />}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        error={errors.password}
                        autoFocus
                        required
                    />
                    <StrengthMeter password={data.password} />
                </div>

                <div>
                    <AuthInput
                        id="reset-password_confirmation"
                        name="password_confirmation"
                        label="Konfirmasi Kata Sandi Baru"
                        icon={<Icons.Lock />}
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                        required
                    />
                    {confirmFilled && !errors.password_confirmation && (
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

                <SubmitButton processing={processing} loadingText="Menyimpan...">
                    Simpan Kata Sandi Baru
                </SubmitButton>
            </form>

            <Link
                href={route('login')}
                className="group mt-4 w-full inline-flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-sm py-3 rounded-xl transition duration-200 active:scale-[.98]"
            >
                <span className="transition-transform duration-200 group-hover:-translate-x-1">
                    <Icons.ArrowLeft />
                </span>
                Kembali ke halaman login
            </Link>
        </GuestLayout>
    );
}