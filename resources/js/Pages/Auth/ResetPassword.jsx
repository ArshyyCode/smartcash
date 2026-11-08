import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthHeader, AuthInput, BackToLogin, MatchHint, StrengthMeter, SubmitButton, Icons } from '@/Components/AuthUI';
import { Head, useForm } from '@inertiajs/react';

/* Letakkan di: resources/js/Pages/Auth/ResetPassword.jsx */
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
            <Head title="Atur Ulang Kata Sandi" />

            <AuthHeader icon={<Icons.Lock className="h-6 w-6" />} title="Buat kata sandi baru">
                Pilih kata sandi yang kuat dan belum pernah Anda pakai di tempat lain.
            </AuthHeader>

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
                    <MatchHint filled={confirmFilled} match={passwordsMatch} hidden={Boolean(errors.password_confirmation)} />
                </div>

                <SubmitButton processing={processing} loadingText="Menyimpan...">
                    Simpan Kata Sandi Baru
                </SubmitButton>
            </form>

            <BackToLogin />
        </GuestLayout>
    );
}