import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthHeader, AuthInput, AuthNotice, BackToLogin, SubmitButton, Icons } from '@/Components/AuthUI';
import { Head, useForm } from '@inertiajs/react';

/* Letakkan di: resources/js/Pages/Auth/ForgotPassword.jsx */
export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <AuthHeader icon={<Icons.Mail className="h-6 w-6" />} title="Lupa kata sandi?">
                Tenang, masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.
            </AuthHeader>

            {status && (
                <AuthNotice className="mb-5" detail="Belum menerima email? Periksa folder spam, atau coba kirim ulang beberapa menit lagi.">
                    {status}
                </AuthNotice>
            )}

            <form onSubmit={submit} className="space-y-4">
                <AuthInput
                    id="forgot-email"
                    name="email"
                    label="Email"
                    icon={<Icons.Mail />}
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@domain.com"
                    hint="Gunakan email yang terdaftar pada akun Anda, bukan username."
                    error={errors.email}
                    autoComplete="email"
                    autoFocus
                    required
                />

                <SubmitButton processing={processing} loadingText="Mengirim tautan...">
                    Kirim Tautan Reset
                </SubmitButton>
            </form>

            <BackToLogin />
        </GuestLayout>
    );
}