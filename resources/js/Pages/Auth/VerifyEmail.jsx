import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthHeader, AuthNotice, SubmitButton, Icons } from '@/Components/AuthUI';
import { Head, Link, useForm } from '@inertiajs/react';

/* Letakkan di: resources/js/Pages/Auth/VerifyEmail.jsx */
export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <AuthHeader icon={<Icons.Mail className="h-6 w-6" />} title="Verifikasi email Anda">
                Terima kasih sudah mendaftar. Sebelum mulai, klik tautan verifikasi yang baru kami kirim ke email Anda.
                Belum menerimanya? Kami bisa mengirim ulang.
            </AuthHeader>

            {status === 'verification-link-sent' && (
                <AuthNotice className="mb-5" detail="Periksa juga folder spam jika email belum muncul.">
                    Tautan verifikasi baru sudah dikirim ke email yang Anda pakai saat mendaftar.
                </AuthNotice>
            )}

            <form onSubmit={submit}>
                <SubmitButton processing={processing} loadingText="Mengirim...">
                    Kirim Ulang Email Verifikasi
                </SubmitButton>
            </form>

            <Link href={route('logout')} method="post" as="button" className="sa-btn sa-btn-outline mt-4">
                Keluar
            </Link>
        </GuestLayout>
    );
}