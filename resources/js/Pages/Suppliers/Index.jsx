import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
import { Head, useForm, router } from '@inertiajs/react';

/* ================================================================== */
/*  Kelola Supplier                                                */
/*  Letakkan di: resources/js/Pages/Suppliers/Index.jsx               */
/*  Membutuhkan: Components/DialogShell.jsx dan Components/Toast.jsx   */
/* ================================================================== */

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan halaman lain)                  */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.96); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .3s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .2s cubic-bezier(.22,1,.36,1) backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER                                                             */
/* ================================================================== */
// ubah nomor lokal (08xx...) menjadi format internasional untuk tautan WhatsApp (628xx...)
const toWhatsApp = (phone) => {
    let d = String(phone || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('0')) d = `62${d.slice(1)}`;
    else if (d.startsWith('8')) d = `62${d}`;
    return d;
};

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const IconTruck = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M2.5 6.5A1.5 1.5 0 0 1 4 5h9v11H2.5V6.5Z" />
        <path d="M13 9h4.5l3 3.5V16H13V9Z" />
        <circle cx="7" cy="17.5" r="1.8" fill="currentColor" />
        <circle cx="17" cy="17.5" r="1.8" fill="currentColor" />
    </svg>
);
const IconPlus = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);
const IconClose = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconCheck = ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconEdit = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="m14.5 7.5 3 3" />
    </svg>
);
const IconTrash = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V4.5h6V7" />
    </svg>
);
const IconPhone = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M6.6 3.5 9.5 4l1.3 4-2 1.5a12 12 0 0 0 6.7 6.7l1.5-2 4 1.3.5 2.9a2 2 0 0 1-2 2.3A17.5 17.5 0 0 1 4.3 5.5a2 2 0 0 1 2.3-2Z" />
    </svg>
);
const IconChat = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.500 7.500 0 1 1 20 11.5Z" />
        <path d="M9 10c.3 1.600 1.600 3.200 3.500 4l1-1.200 1.700.8c-.3 1-1.200 1.600-2.200 1.500C10.500 14.800 8.300 12.500 8.200 10c0-.9.700-1.700 1.600-1.800L10 10" />
    </svg>
);
const IconPin = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const inputCls =
    'w-full min-h-[44px] text-base sm:text-sm rounded-xl bg-white placeholder:text-slate-400 transition duration-150 focus:ring-4';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';
const errBorder = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-blue-700 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600';
const btnSecondary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold transition-colors duration-150 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Field = ({ id, label, error, hint, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label}
        </label>
        {children}
        {hint && !error && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
        {error && (
            <p id={`${id}-error`} role="alert" className="sc-pop text-red-600 text-xs font-semibold mt-1.5">
                {error}
            </p>
        )}
    </div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Ringkasan: satu panel, tiga kolom (lebih ringan daripada tiga kotak terpisah) */
const SummaryStrip = ({ items }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', slate: 'bg-slate-100 text-slate-600' };
    return (
        <Panel className="grid grid-cols-1 sm:grid-cols-3 divide-y divide-slate-200 sm:divide-y-0 sm:divide-x">
            {items.map((it) => (
                <div key={it.label} className="flex items-center gap-3.5 p-4 sm:p-5">
                    <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tones[it.tone || 'blue']}`}>{it.icon}</span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600">{it.label}</p>
                        <p className="text-xl font-extrabold text-slate-900 leading-tight">{it.value}</p>
                    </div>
                </div>
            ))}
        </Panel>
    );
};

/* Tombol aksi berupa ikon (44 px); nama tetap terbaca lewat aria-label.
   Bisa berupa tombol atau tautan (href). */
const ActionBtn = ({ label, onClick, href, external = false, tone = 'default', children }) => {
    const cls = `w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-150 text-slate-600 ${
        tone === 'danger'
            ? 'hover:bg-red-50 hover:text-red-600 active:bg-red-100'
            : tone === 'green'
            ? 'hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100'
            : 'hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100'
    }`;
    if (href) {
        return (
            <a href={href} aria-label={label} title={label} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
            </a>
        );
    }
    return (
        <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
            {children}
        </button>
    );
};

/* Nomor telepon + tombol telepon / WhatsApp */
const PhoneCell = ({ supplier }) => {
    if (!supplier.phone) return <span className="text-sm text-slate-500">Belum ada nomor</span>;
    const wa = toWhatsApp(supplier.phone);
    return (
        <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-700 mr-1">{supplier.phone}</span>
            <ActionBtn label={`Telepon ${supplier.name}`} href={`tel:${supplier.phone}`}>
                <IconPhone className="w-[18px] h-[18px]" />
            </ActionBtn>
            <ActionBtn label={`Chat WhatsApp ${supplier.name} (tab baru)`} href={`https://wa.me/${wa}`} external tone="green">
                <IconChat className="w-[18px] h-[18px]" />
            </ActionBtn>
        </div>
    );
};

const Avatar = ({ name }) => (
    <span aria-hidden="true" className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 text-sm font-extrabold flex items-center justify-center">
        {(name || '?').charAt(0).toUpperCase()}
    </span>
);

/* ================================================================== */
/*  HALAMAN KELOLA SUPPLIER                                            */
/* ================================================================== */
export default function Index({ auth, suppliers = [] }) {
    const [showingModal, setShowingModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        address: '',
    });

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    const closeModal = () => {
        setShowingModal(false);
        setEditingSupplier(null);
        reset();
        clearErrors();
    };

    const openModalForCreate = () => {
        setEditingSupplier(null);
        reset();
        clearErrors();
        setShowingModal(true);
    };

    const openModalForEdit = (supplier) => {
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            phone: supplier.phone || '',
            address: supplier.address || '',
        });
        clearErrors();
        setShowingModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                showToast('success', editingSupplier ? 'Supplier berhasil diperbarui!' : 'Supplier baru berhasil ditambahkan!');
                closeModal();
            },
        };
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), options);
        } else {
            post(route('suppliers.store'), options);
        }
    };

    const handleDelete = (supplier) => {
        setConfirmState({
            title: 'Hapus supplier ini?',
            message: `Supplier "${supplier.name}" akan dihapus dan tidak dapat dikembalikan.`,
            confirmLabel: 'Ya, hapus',
            onConfirm: () =>
                router.delete(route('suppliers.destroy', supplier.id), {
                    preserveScroll: true,
                    onSuccess: () => showToast('success', 'Supplier berhasil dihapus.'),
                    onError: (errs) => showToast('error', errs.message || 'Supplier tidak dapat dihapus karena masih dipakai data lain.'),
                }),
        });
    };

    /* ---------- data turunan ---------- */
    const withPhone = suppliers.filter((s) => s.phone).length;
    const withAddress = suppliers.filter((s) => s.address).length;

    const q = search.trim().toLowerCase();
    const shown = [...suppliers]
        .sort((a, b) => String(a.name).localeCompare(String(b.name), 'id'))
        .filter(
            (s) =>
                !q ||
                String(s.name).toLowerCase().includes(q) ||
                String(s.phone || '').toLowerCase().includes(q) ||
                String(s.address || '').toLowerCase().includes(q)
        );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
                        <IconTruck />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Kelola <span className="text-blue-600">Supplier</span>
                    </h2>
                </div>
            }
        >
            <Head title="Kelola Supplier" />
            <style>{css}</style>

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* RINGKASAN */}
                <SummaryStrip
                    items={[
                        { icon: <IconTruck />, label: 'Total supplier', value: suppliers.length },
                        { icon: <IconPhone className="w-5 h-5" />, label: 'Punya nomor telepon', value: withPhone, tone: 'green' },
                        { icon: <IconPin className="w-5 h-5" />, label: 'Punya alamat', value: withAddress, tone: 'slate' },
                    ]}
                />

                {/* DAFTAR SUPPLIER (pencarian + aksi + daftar dalam satu panel) */}
                <Panel className="overflow-hidden">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-900 text-base">Daftar Supplier</h3>
                            <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                {q ? `${shown.length} dari ${suppliers.length}` : suppliers.length}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative sm:w-72">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <IconSearch />
                                </span>
                                <input
                                    type="text"
                                    inputMode="search"
                                    autoComplete="off"
                                    aria-label="Cari supplier berdasarkan nama, telepon, atau alamat"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, telepon, alamat..."
                                    className={`${inputCls} pl-10 pr-12 ${okBorder}`}
                                />
                                {search && (
                                    <span className="absolute right-1 top-1/2 -translate-y-1/2">
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            aria-label="Hapus pencarian"
                                            className="sc-pop w-10 h-10 rounded-xl text-slate-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200 flex items-center justify-center transition-colors duration-150"
                                        >
                                            <IconClose />
                                        </button>
                                    </span>
                                )}
                            </div>

                            <button type="button" onClick={openModalForCreate} className={btnPrimary}>
                                <IconPlus />
                                Tambah Supplier
                            </button>
                        </div>
                    </div>

                    {shown.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <IconTruck className="w-10 h-10" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">
                                {suppliers.length === 0 ? 'Belum ada data supplier' : 'Supplier tidak ditemukan'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {suppliers.length === 0 ? 'Simpan kontak pemasok agar restock barang lebih cepat.' : 'Coba kata kunci lain.'}
                            </p>
                            {suppliers.length === 0 && (
                                <div className="mt-4">
                                    <button type="button" onClick={openModalForCreate} className={btnPrimary}>
                                        <IconPlus />
                                        Tambah supplier pertama
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Tabel (layar sedang ke atas) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Daftar supplier, diurutkan menurut nama</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Supplier</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Telepon</th>
                                            <th scope="col" className="px-4 py-3 font-semibold hidden xl:table-cell">Alamat</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shown.map((supplier, index) => (
                                            <tr
                                                key={supplier.id}
                                                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                                                className="sc-rowin border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={supplier.name} />
                                                        <span className="font-bold text-slate-800 truncate max-w-[220px]">{supplier.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <PhoneCell supplier={supplier} />
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-700 max-w-[280px] hidden xl:table-cell">
                                                    <span className="line-clamp-2" title={supplier.address || ''}>
                                                        {supplier.address || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <ActionBtn label={`Ubah ${supplier.name}`} onClick={() => openModalForEdit(supplier)}>
                                                            <IconEdit className="w-[18px] h-[18px]" />
                                                        </ActionBtn>
                                                        <ActionBtn label={`Hapus ${supplier.name}`} tone="danger" onClick={() => handleDelete(supplier)}>
                                                            <IconTrash className="w-[18px] h-[18px]" />
                                                        </ActionBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP): tidak perlu menggeser tabel ke samping */}
                            <ul role="list" className="lg:hidden divide-y divide-slate-100">
                                {shown.map((supplier, index) => (
                                    <li key={supplier.id} style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }} className="sc-rowin pl-4 pr-2 py-3">
                                        <div className="flex items-start gap-3">
                                            <Avatar name={supplier.name} />
                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <p className="font-bold text-sm text-slate-800 leading-snug">{supplier.name}</p>
                                                {supplier.address && <p className="text-xs text-slate-600 mt-0.5">{supplier.address}</p>}
                                            </div>
                                            <div className="flex shrink-0">
                                                <ActionBtn label={`Ubah ${supplier.name}`} onClick={() => openModalForEdit(supplier)}>
                                                    <IconEdit className="w-[18px] h-[18px]" />
                                                </ActionBtn>
                                                <ActionBtn label={`Hapus ${supplier.name}`} tone="danger" onClick={() => handleDelete(supplier)}>
                                                    <IconTrash className="w-[18px] h-[18px]" />
                                                </ActionBtn>
                                            </div>
                                        </div>
                                        <div className="pl-[52px] pr-2 mt-1">
                                            <PhoneCell supplier={supplier} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT ================= */}
            {showingModal && (
                <DialogShell onClose={closeModal} labelledBy="judul-modal-supplier" size="md">
                    <div className="flex justify-between items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-200">
                        <h3 id="judul-modal-supplier" className="text-base font-bold text-slate-900">
                            {editingSupplier ? 'Ubah Supplier' : 'Tambah Supplier Baru'}
                        </h3>
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Tutup"
                            className="w-11 h-11 -mr-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                        >
                            <IconClose />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
                            <Field id="sup-name" label="Nama supplier" error={errors.name}>
                                <input
                                    id="sup-name"
                                    data-autofocus
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: PT Sumber Rejeki"
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? 'sup-name-error' : undefined}
                                    className={`${inputCls} ${errors.name ? errBorder : okBorder}`}
                                    required
                                />
                            </Field>

                            <Field id="sup-phone" label="No. telepon" error={errors.phone} hint="Dipakai untuk tombol telepon dan WhatsApp cepat.">
                                <input
                                    id="sup-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="off"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="08xx xxxx xxxx"
                                    aria-invalid={Boolean(errors.phone)}
                                    aria-describedby={errors.phone ? 'sup-phone-error' : undefined}
                                    className={`${inputCls} ${errors.phone ? errBorder : okBorder}`}
                                />
                            </Field>

                            <Field id="sup-address" label="Alamat" error={errors.address}>
                                <textarea
                                    id="sup-address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    placeholder="Alamat lengkap supplier"
                                    aria-invalid={Boolean(errors.address)}
                                    aria-describedby={errors.address ? 'sup-address-error' : undefined}
                                    className={`${inputCls} resize-none ${errors.address ? errBorder : okBorder}`}
                                />
                            </Field>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button type="button" onClick={closeModal} className={btnSecondary}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing} aria-busy={processing} className={btnPrimary}>
                                {processing && <Spinner />}
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </DialogShell>
            )}

            {/* ================= DIALOG KONFIRMASI ================= */}
            {confirmState && (
                <DialogShell
                    onClose={() => setConfirmState(null)}
                    role="alertdialog"
                    labelledBy="judul-konfirmasi"
                    describedBy="isi-konfirmasi"
                    size="sm"
                    z="z-[70]"
                    initialFocus="cancel"
                >
                    <div className="p-6 text-center">
                        <span className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center" aria-hidden="true">
                            <IconTrash className="w-5 h-5" />
                        </span>
                        <h3 id="judul-konfirmasi" className="text-base font-bold text-slate-900 mt-4">
                            {confirmState.title}
                        </h3>
                        <p id="isi-konfirmasi" className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {confirmState.message}
                        </p>
                        <div className="flex gap-2 mt-6 pb-[env(safe-area-inset-bottom)]">
                            <button type="button" data-dialog-cancel onClick={() => setConfirmState(null)} className={`${btnSecondary} flex-1`}>
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmState.onConfirm();
                                    setConfirmState(null);
                                }}
                                className="inline-flex flex-1 items-center justify-center min-h-[44px] rounded-xl bg-red-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-red-700 active:brightness-90"
                            >
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </DialogShell>
            )}
        </AuthenticatedLayout>
    );
}