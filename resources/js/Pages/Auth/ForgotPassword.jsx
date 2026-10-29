import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AuthInput, SubmitButton, Icons, idMessage } from '@/Components/AuthUI';
import { Head, Link, useForm } from '@inertiajs/react';

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

            <div className="mb-6">
                <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icons.Mail className="w-6 h-6" />
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#14214f]">Lupa kata sandi?</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Tenang, masukkan email akun Anda. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
                </p>
            </div>

            {status && (
                <div className="sc-pop mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <div className="flex items-start gap-2.5 font-medium">
                        <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Icons.Check className="w-3 h-3" />
                        </span>
                        {idMessage(status)}
                    </div>
                    <p className="text-xs text-emerald-700/80 mt-2 ml-7 leading-relaxed">
                        Tidak menerima email? Periksa folder spam, atau coba kirim ulang dalam beberapa menit.
                    </p>
                </div>
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
                    hint="Gunakan email yang terdaftar pada akun Anda (bukan username)."
                    error={errors.email}
                    autoComplete="email"
                    autoFocus
                    required
                />

                <SubmitButton processing={processing} loadingText="Mengirim tautan...">
                    Kirim Tautan Reset
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