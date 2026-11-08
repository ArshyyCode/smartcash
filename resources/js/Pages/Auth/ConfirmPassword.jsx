import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthHeader, AuthInput, SubmitButton, Icons } from '@/Components/AuthUI';
import { Head, useForm } from '@inertiajs/react';

/* Letakkan di: resources/js/Pages/Auth/ConfirmPassword.jsx */
export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <AuthHeader icon={<Icons.Lock className="h-6 w-6" />} title="Konfirmasi kata sandi">
                Ini adalah area yang dilindungi. Masukkan kata sandi Anda sekali lagi sebelum melanjutkan.
            </AuthHeader>

            <form onSubmit={submit} className="space-y-4">
                <AuthInput
                    id="confirm-password"
                    name="password"
                    label="Kata Sandi"
                    icon={<Icons.Lock />}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    error={errors.password}
                    autoFocus
                    required
                />

                <SubmitButton processing={processing} loadingText="Memeriksa...">
                    Konfirmasi
                </SubmitButton>
            </form>
        </GuestLayout>
    );
}