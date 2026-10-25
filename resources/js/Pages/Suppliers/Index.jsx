import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan halaman lain)                  */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.94); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
@keyframes sc-toast { from { opacity: 0; transform: translateY(-12px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes sc-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .35s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .2s cubic-bezier(.22,1,.36,1) backwards }
.sc-toast { animation: sc-toast .3s cubic-bezier(.22,1,.36,1) backwards }
.sc-fade { animation: sc-fade .2s ease backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
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
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

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
    'w-full text-sm rounded-xl bg-white py-2.5 placeholder:text-slate-400 transition duration-200 focus:ring-4';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';
const errBorder = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Field = ({ label, error, hint, icon, right, children }) => (
    <div>
        <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            {right}
        </div>
        <div className="group relative">
            {icon && (
                <span className="pointer-events-none absolute left-3.5 top-3 text-slate-400 transition-colors group-focus-within:text-blue-600">{icon}</span>
            )}
            {children}
        </div>
        {hint && !error && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
        {error && <p className="sc-pop text-red-500 text-[11px] font-semibold mt-1.5">{error}</p>}
    </div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const StatChip = ({ icon, label, value, tone = 'blue' }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', slate: 'bg-slate-100 text-slate-600' };
    return (
        <div className="h-full flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5">
            <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</span>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight">{value}</p>
            </div>
        </div>
    );
};

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

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const closeModal = () => {
        setShowingModal(false);
        setEditingSupplier(null);
        reset();
        clearErrors();
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            setConfirmState(null);
            if (showingModal) closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showingModal]);

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
        .filter((s) => !q || String(s.name).toLowerCase().includes(q) || String(s.phone || '').toLowerCase().includes(q) || String(s.address || '').toLowerCase().includes(q));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
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

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[60]">
                    <div
                        key={toast.id}
                        className={`sc-toast flex items-start gap-3 max-w-sm rounded-2xl px-4 py-3 border text-sm font-semibold ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <span
                            className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-white ${
                                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        >
                            {toast.type === 'success' ? <IconCheck /> : <IconClose className="w-3 h-3" />}
                        </span>
                        <span className="leading-snug">{toast.message}</span>
                        <button type="button" onClick={() => setToast(null)} aria-label="Tutup" className="ml-1 opacity-60 hover:opacity-100 transition">
                            <IconClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* RINGKASAN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatChip icon={<IconTruck />} label="Total Supplier" value={suppliers.length} />
                    <StatChip icon={<IconPhone className="w-5 h-5" />} label="Punya No. Telepon" value={withPhone} tone="green" />
                    <StatChip icon={<IconPin className="w-5 h-5" />} label="Punya Alamat" value={withAddress} tone="slate" />
                </div>

                {/* TOOLBAR */}
                <Panel className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Daftar Supplier Toko</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Simpan kontak pemasok agar restock barang lebih cepat.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64 min-w-[180px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, telepon, alamat..."
                                className={`${inputCls} text-xs pl-9 pr-9 ${okBorder}`}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian"
                                    className="sc-pop absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                                >
                                    <IconClose className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={openModalForCreate}
                            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                            <IconPlus />
                            Tambah Supplier
                        </button>
                    </div>
                </Panel>

                {/* TABEL */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold w-14">No</th>
                                    <th className="px-5 py-3.5 font-semibold">Supplier</th>
                                    <th className="px-5 py-3.5 font-semibold">No. Telepon</th>
                                    <th className="px-5 py-3.5 font-semibold">Alamat</th>
                                    <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-14 text-center">
                                            <span className="text-slate-300 inline-block">
                                                <IconTruck className="w-10 h-10" />
                                            </span>
                                            <p className="text-slate-400 text-xs mt-2">
                                                {suppliers.length === 0 ? 'Belum ada data supplier. Silakan tambahkan supplier baru.' : 'Tidak ada supplier yang cocok dengan pencarian.'}
                                            </p>
                                            {suppliers.length === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={openModalForCreate}
                                                    className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition active:scale-95"
                                                >
                                                    Tambah supplier pertama
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    shown.map((supplier, index) => {
                                        const wa = toWhatsApp(supplier.phone);
                                        return (
                                            <tr
                                                key={supplier.id}
                                                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                                                className="sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-3.5 text-xs text-slate-400">{index + 1}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 text-blue-600 text-sm font-extrabold flex items-center justify-center">
                                                            {(supplier.name || '?').charAt(0).toUpperCase()}
                                                        </span>
                                                        <span className="font-bold text-slate-800 truncate max-w-[220px]">{supplier.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {supplier.phone ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-slate-600">{supplier.phone}</span>
                                                            <a
                                                                href={`tel:${supplier.phone}`}
                                                                title="Telepon"
                                                                aria-label={`Telepon ${supplier.name}`}
                                                                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-90"
                                                            >
                                                                <IconPhone className="w-3.5 h-3.5" />
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${wa}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Chat WhatsApp"
                                                                aria-label={`Chat WhatsApp ${supplier.name}`}
                                                                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition duration-200 active:scale-90"
                                                            >
                                                                <IconChat className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[280px]">
                                                    <span className="line-clamp-2" title={supplier.address || ''}>
                                                        {supplier.address || <span className="text-slate-300">-</span>}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openModalForEdit(supplier)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-95"
                                                        >
                                                            <IconEdit />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(supplier)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition duration-200 active:scale-95"
                                                        >
                                                            <IconTrash />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT ================= */}
            {showingModal && (
                <div onClick={closeModal} className="sc-fade fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white p-6 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                            <h3 className="text-base font-bold text-slate-900">{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Tutup"
                                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                            >
                                <IconClose />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Nama Supplier" error={errors.name} icon={<IconTruck className="w-[18px] h-[18px]" />}>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: PT Sumber Rejeki"
                                    className={`${inputCls} pl-11 ${errors.name ? errBorder : okBorder}`}
                                    required
                                    autoFocus
                                />
                            </Field>

                            <Field label="No. Telepon" error={errors.phone} icon={<IconPhone className="w-[18px] h-[18px]" />} hint="Dipakai untuk tombol telepon dan WhatsApp cepat.">
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="08xx xxxx xxxx"
                                    className={`${inputCls} pl-11 ${errors.phone ? errBorder : okBorder}`}
                                />
                            </Field>

                            <Field
                                label="Alamat"
                                error={errors.address}
                                icon={<IconPin className="w-[18px] h-[18px]" />}
                                right={<span className="text-[11px] text-slate-400">{data.address.length} karakter</span>}
                            >
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    placeholder="Alamat lengkap supplier"
                                    className={`${inputCls} pl-11 resize-none ${errors.address ? errBorder : okBorder}`}
                                />
                            </Field>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {processing && <Spinner />}
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= DIALOG KONFIRMASI ================= */}
            {confirmState && (
                <div onClick={() => setConfirmState(null)} className="sc-fade fixed inset-0 z-[70] bg-slate-900/50 flex justify-center items-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                        <span className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <IconTrash className="w-5 h-5" />
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-4">{confirmState.title}</h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{confirmState.message}</p>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setConfirmState(null)}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmState.onConfirm();
                                    setConfirmState(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}