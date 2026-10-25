import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan Dashboard & POS)               */
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
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
}
`;

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconBox = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
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
const IconFolder = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
);
const IconCheck = ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
);
const IconAlert = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 3.5 2.8 19.5a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3.5Z" />
        <path d="M12 10v4.5M12 17.5v.1" />
    </svg>
);
const IconLayers = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
    </svg>
);
const IconImage = ({ className = 'w-8 h-8' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.6}>
        <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const inputCls =
    'w-full text-xs rounded-xl border-slate-200 bg-white placeholder:text-slate-400 transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
        {children}
        {error && <p className="sc-pop text-red-500 text-[11px] font-semibold mt-1">{error}</p>}
    </div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Foto produk dari link, dengan cadangan huruf awal bila gagal dimuat */
const Thumb = ({ src, name, className = 'w-11 h-11' }) => {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    if (!src || failed) {
        return (
            <div className={`${className} shrink-0 rounded-xl bg-blue-50 text-blue-500 font-extrabold text-sm flex items-center justify-center`}>
                {(name || '?').charAt(0).toUpperCase()}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={name}
            loading="lazy"
            onError={() => setFailed(true)}
            className={`${className} shrink-0 rounded-xl object-cover border border-slate-200`}
        />
    );
};

const StatChip = ({ icon, label, value, tone = 'blue' }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        slate: 'bg-slate-100 text-slate-600',
    };
    return (
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</span>
            <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-extrabold text-slate-900 leading-tight">{value}</p>
            </div>
        </div>
    );
};

/* ================================================================== */
/*  HALAMAN KELOLA PRODUK                                              */
/* ================================================================== */
export default function Index({ auth, products = [], categories = [], suppliers = [] }) {
    const { flash } = usePage().props;

    // State Modal Produk
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    // State Panel & Form Kategori (bisa buka-tutup)
    const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Notifikasi & dialog konfirmasi (pengganti alert/confirm bawaan browser)
    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    // tampilkan pesan sukses dari backend (back()->with('success', ...)) bila dibagikan via Inertia
    useEffect(() => {
        if (flash?.success) showToast('success', flash.success);
    }, [flash?.success]);

    // tutup modal / dialog dengan tombol Esc
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            setConfirmState(null);
            setIsModalOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Form Hook untuk Produk
    const {
        data: prodData,
        setData: setProdData,
        post: postProd,
        put: putProd,
        reset: resetProd,
        clearErrors: clearProdErrors,
        errors: prodErrors,
        processing: prodProcessing,
    } = useForm({
        code: '',
        name: '',
        category_id: '',
        supplier_id: '',
        cost_price: '',
        selling_price: '',
        stock: '',
        image: '',
    });

    // Form Hook untuk Kategori
    const {
        data: catData,
        setData: setCatData,
        post: postCat,
        put: putCat,
        reset: resetCat,
        clearErrors: clearCatErrors,
        errors: catErrors,
        processing: catProcessing,
    } = useForm({
        name: '',
    });

    // Handler Modal Produk
    const openCreateModal = () => {
        setEditProduct(null);
        resetProd();
        clearProdErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setProdData({
            code: product.code,
            name: product.name,
            category_id: product.category_id || '',
            supplier_id: product.supplier_id || '',
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            stock: product.stock,
            image: product.image || '',
        });
        clearProdErrors();
        setIsModalOpen(true);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        if (editProduct) {
            putProd(route('products.update', editProduct.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditProduct(null);
                    resetProd();
                },
            });
        } else {
            postProd(route('products.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    resetProd();
                },
            });
        }
    };

    const handleDeleteProduct = (prod) => {
        setConfirmState({
            title: 'Hapus produk ini?',
            message: `Produk "${prod.name}" akan dihapus dan tidak dapat dikembalikan.`,
            confirmLabel: 'Ya, hapus',
            onConfirm: () => router.delete(route('products.destroy', prod.id), { preserveScroll: true }),
        });
    };

    // Handler CRUD Kategori
    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editCategory) {
            putCat(route('categories.update', editCategory.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditCategory(null);
                    resetCat('name');
                    clearCatErrors();
                },
            });
        } else {
            postCat(route('categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    resetCat('name');
                    clearCatErrors();
                },
            });
        }
    };

    const handleEditCategory = (cat) => {
        setEditCategory(cat);
        setCatData({ name: cat.name });
        clearCatErrors();
    };

    const handleDeleteCategory = (cat) => {
        const hasProducts = products.some((p) => String(p.category_id) === String(cat.id));
        if (hasProducts) {
            showToast('error', `Kategori "${cat.name}" tidak dapat dihapus karena masih ada produk yang menggunakannya.`);
            return;
        }
        setConfirmState({
            title: 'Hapus kategori ini?',
            message: `Kategori "${cat.name}" akan dihapus.`,
            confirmLabel: 'Ya, hapus',
            onConfirm: () => router.delete(route('categories.destroy', cat.id), { preserveScroll: true }),
        });
    };

    // Filter produk berdasarkan kategori & pencarian, urut stok terkecil
    const filteredAndSortedProducts = products
        .filter((prod) => {
            const matchesCategory = selectedCategory === 'all' || String(prod.category_id) === String(selectedCategory);
            const q = searchQuery.toLowerCase();
            const matchesSearch = prod.name.toLowerCase().includes(q) || prod.code.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => Number(a.stock) - Number(b.stock));

    const lowStockCount = products.filter((p) => Number(p.stock) <= 10).length;
    const imagePreview = /^https?:\/\//i.test(prodData.image || '') ? prodData.image : '';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <IconBox />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Kelola <span className="text-blue-600">Produk &amp; Kategori</span>
                    </h2>
                </div>
            }
        >
            <Head title="Kelola Produk" />
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[60]">
                    <div
                        key={toast.id}
                        className={`sc-toast flex items-start gap-3 max-w-sm rounded-2xl px-4 py-3 border text-sm font-semibold ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
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
                    <StatChip icon={<IconBox />} label="Total Produk" value={products.length} />
                    <StatChip icon={<IconAlert />} label="Stok Menipis (≤ 10)" value={lowStockCount} tone="amber" />
                    <StatChip icon={<IconLayers />} label="Kategori" value={categories.length} tone="slate" />
                </div>

                {/* TOOLBAR: JUDUL, PENCARIAN, AKSI */}
                <Panel className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Daftar Produk &amp; Inventaris</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Kelola produk dan filter berdasarkan kategori dengan mudah.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64 min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Cari nama atau kode produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${inputCls} pl-9 pr-9 py-2.5`}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Hapus pencarian"
                                    className="sc-pop absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                                >
                                    <IconClose className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsCategoryPanelOpen(!isCategoryPanelOpen)}
                            aria-expanded={isCategoryPanelOpen}
                            className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
                                isCategoryPanelOpen
                                    ? 'bg-slate-800 border-slate-800 text-white'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            <IconFolder />
                            {isCategoryPanelOpen ? 'Tutup Panel Kategori' : 'Kelola Kategori'}
                        </button>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                            <IconPlus />
                            Tambah Produk
                        </button>
                    </div>
                </Panel>

                {/* ================= PANEL KATEGORI ================= */}
                {isCategoryPanelOpen && (
                    <Panel className="sc-pop p-5">
                        <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4 mb-5">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Pengaturan Kategori Produk</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Tambah, ubah, atau hapus kategori. Kategori yang masih berisi produk tidak bisa dihapus.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCategoryPanelOpen(false)}
                                aria-label="Tutup panel kategori"
                                className="w-8 h-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                            >
                                <IconClose />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form tambah/edit kategori */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit">
                                <h5 className="font-bold text-xs text-slate-800 mb-3">
                                    {editCategory ? `Edit Kategori: ${editCategory.name}` : 'Tambah Kategori Baru'}
                                </h5>
                                <form onSubmit={handleCategorySubmit} className="space-y-3">
                                    <Field label="Nama Kategori" error={catErrors.name}>
                                        <input
                                            type="text"
                                            value={catData.name}
                                            onChange={(e) => setCatData('name', e.target.value)}
                                            placeholder="Contoh: Makanan, Minuman"
                                            className={`${inputCls} py-2.5`}
                                            required
                                        />
                                    </Field>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={catProcessing}
                                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {catProcessing && <Spinner />}
                                            {editCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                                        </button>
                                        {editCategory && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditCategory(null);
                                                    resetCat('name');
                                                    clearCatErrors();
                                                }}
                                                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95"
                                            >
                                                Batal
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Daftar kategori */}
                            <div className="lg:col-span-2 overflow-auto max-h-64 border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Nama Kategori</th>
                                            <th className="px-4 py-3 font-semibold">Jumlah Produk</th>
                                            <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-slate-400">
                                                    Belum ada kategori tersimpan.
                                                </td>
                                            </tr>
                                        ) : (
                                            categories.map((cat, i) => {
                                                const productCount = products.filter((p) => String(p.category_id) === String(cat.id)).length;
                                                return (
                                                    <tr
                                                        key={cat.id}
                                                        style={{ animationDelay: `${i * 30}ms` }}
                                                        className="sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50"
                                                    >
                                                        <td className="px-4 py-3 font-semibold text-slate-800">{cat.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
                                                                {productCount} produk
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditCategory(cat)}
                                                                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition active:scale-95"
                                                                >
                                                                    <IconEdit />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteCategory(cat)}
                                                                    title={productCount > 0 ? 'Masih ada produk di kategori ini' : 'Hapus kategori'}
                                                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition active:scale-95 ${
                                                                        productCount > 0
                                                                            ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                                                            : 'border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white'
                                                                    }`}
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
                        </div>
                    </Panel>
                )}

                {/* ================= FILTER KATEGORI ================= */}
                <Panel className="p-5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Filter Berdasarkan Kategori</span>
                    <div className="sc-noscroll flex gap-2 overflow-x-auto pt-3 pb-1">
                        {[{ id: 'all', name: 'Semua Kategori', count: products.length }, ...categories.map((c) => ({
                            ...c,
                            count: products.filter((p) => String(p.category_id) === String(c.id)).length,
                        }))].map((cat) => {
                            const active = String(selectedCategory) === String(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(String(cat.id))}
                                    aria-pressed={active}
                                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition duration-200 active:scale-95 ${
                                        active
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {cat.name}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Panel>

                {/* ================= TABEL PRODUK ================= */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Produk</th>
                                    <th className="px-5 py-3.5 font-semibold">Kategori</th>
                                    <th className="px-5 py-3.5 font-semibold">Supplier</th>
                                    <th className="px-5 py-3.5 font-semibold">Harga Beli</th>
                                    <th className="px-5 py-3.5 font-semibold">Harga Jual</th>
                                    <th className="px-5 py-3.5 font-semibold">Stok</th>
                                    <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-5 py-14 text-center">
                                            <span className="text-slate-300 inline-block">
                                                <IconImage className="w-10 h-10" />
                                            </span>
                                            <p className="text-slate-400 text-xs mt-2">
                                                {searchQuery || selectedCategory !== 'all'
                                                    ? 'Produk dengan filter/pencarian tersebut tidak ditemukan.'
                                                    : 'Belum ada data produk.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedProducts.map((prod, i) => {
                                        const stock = Number(prod.stock);
                                        return (
                                            <tr
                                                key={prod.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className="sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <Thumb src={prod.image} name={prod.name} />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 text-sm truncate max-w-[220px]">{prod.name}</p>
                                                            <p className="text-[11px] font-semibold text-blue-600">Kode: {prod.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-600">{prod.category?.name || 'Umum'}</td>
                                                <td className="px-5 py-3.5 text-xs text-slate-600">{prod.supplier?.name || '-'}</td>
                                                <td className="px-5 py-3.5 text-xs text-slate-600">Rp {Number(prod.cost_price).toLocaleString('id-ID')}</td>
                                                <td className="px-5 py-3.5 text-xs font-bold text-slate-800">Rp {Number(prod.selling_price).toLocaleString('id-ID')}</td>
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                            stock <= 5
                                                                ? 'bg-red-100 text-red-700'
                                                                : stock <= 10
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}
                                                    >
                                                        Sisa: {prod.stock}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(prod)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-95"
                                                        >
                                                            <IconEdit />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteProduct(prod)}
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

            {/* ================= MODAL TAMBAH / EDIT PRODUK ================= */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    className="sc-fade fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="sc-pop bg-white p-6 rounded-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">{editProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Tutup"
                                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                            >
                                <IconClose />
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="space-y-3.5">
                            <Field label="Kode Produk" error={prodErrors.code}>
                                <input
                                    type="text"
                                    className={`${inputCls} py-2.5`}
                                    value={prodData.code}
                                    onChange={(e) => setProdData('code', e.target.value)}
                                    placeholder="Contoh: BRG-011"
                                    required
                                />
                            </Field>

                            <Field label="Nama Produk" error={prodErrors.name}>
                                <input
                                    type="text"
                                    className={`${inputCls} py-2.5`}
                                    value={prodData.name}
                                    onChange={(e) => setProdData('name', e.target.value)}
                                    placeholder="Masukkan nama barang"
                                    required
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Kategori" error={prodErrors.category_id}>
                                    <select
                                        className={`${inputCls} py-2.5`}
                                        value={prodData.category_id}
                                        onChange={(e) => setProdData('category_id', e.target.value)}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Supplier" error={prodErrors.supplier_id}>
                                    <select
                                        className={`${inputCls} py-2.5`}
                                        value={prodData.supplier_id}
                                        onChange={(e) => setProdData('supplier_id', e.target.value)}
                                    >
                                        <option value="">Pilih Supplier</option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Harga Beli (Modal)" error={prodErrors.cost_price}>
                                    <input
                                        type="number"
                                        className={`${inputCls} py-2.5`}
                                        value={prodData.cost_price}
                                        onChange={(e) => setProdData('cost_price', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field label="Harga Jual" error={prodErrors.selling_price}>
                                    <input
                                        type="number"
                                        className={`${inputCls} py-2.5`}
                                        value={prodData.selling_price}
                                        onChange={(e) => setProdData('selling_price', e.target.value)}
                                        required
                                    />
                                </Field>
                            </div>

                            <Field label="Stok Awal" error={prodErrors.stock}>
                                <input
                                    type="number"
                                    className={`${inputCls} py-2.5`}
                                    value={prodData.stock}
                                    onChange={(e) => setProdData('stock', e.target.value)}
                                    required
                                />
                            </Field>

                            <Field label="URL Foto Produk" error={prodErrors.image}>
                                <div className="flex items-start gap-3">
                                    <Thumb src={imagePreview} name={prodData.name || 'F'} className="w-14 h-14" />
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/gambar.jpg"
                                            value={prodData.image}
                                            onChange={(e) => setProdData('image', e.target.value)}
                                            className={`${inputCls} py-2.5`}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Tempel link foto; pratinjau tampil di sebelah kiri.</p>
                                    </div>
                                </div>
                            </Field>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={prodProcessing}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {prodProcessing && <Spinner />}
                                    {prodProcessing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= DIALOG KONFIRMASI ================= */}
            {confirmState && (
                <div
                    onClick={() => setConfirmState(null)}
                    className="sc-fade fixed inset-0 z-[70] bg-slate-900/50 flex justify-center items-center p-4"
                >
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