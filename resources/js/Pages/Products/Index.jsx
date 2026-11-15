import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
import { Head, useForm, router, usePage } from '@inertiajs/react';

/* ================================================================== */
/*  Kelola Produk & Kategori                                           */
/*  Letakkan di: resources/js/Pages/Products/Index.jsx                 */
/*  Membutuhkan: Components/DialogShell.jsx dan Components/Toast.jsx   */
/* ================================================================== */

/* ================================================================== */
/*  CSS (animasi ringan, selaras dengan Dashboard & POS)               */
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
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

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
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

const inputCls =
    'w-full min-h-[44px] text-base sm:text-sm rounded-xl border-slate-200 bg-white placeholder:text-slate-400 transition duration-150 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

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

/* Foto produk dari link, dengan cadangan huruf awal bila gagal dimuat */
const Thumb = ({ src, name, className = 'w-12 h-12' }) => {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    if (!src || failed) {
        return (
            <div className={`${className} shrink-0 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center justify-center`} aria-hidden="true">
                {(name || '?').charAt(0).toUpperCase()}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`${className} shrink-0 rounded-xl object-cover border border-slate-200`}
        />
    );
};

/* Ringkasan: satu panel, tiga kolom (lebih ringan daripada tiga kotak terpisah) */
const SummaryStrip = ({ items }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        slate: 'bg-slate-100 text-slate-600',
    };
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

/* Lencana stok: warna DAN tulisan (habis / kritis / menipis) */
const StockBadge = ({ stock }) => {
    const n = Number(stock);
    const state =
        n <= 0
            ? { cls: 'bg-red-100 text-red-700', text: 'Habis' }
            : n <= 5
            ? { cls: 'bg-red-100 text-red-700', text: `Kritis: ${n}` }
            : n <= 10
            ? { cls: 'bg-amber-100 text-amber-800', text: `Menipis: ${n}` }
            : { cls: 'bg-emerald-100 text-emerald-700', text: `Stok: ${n}` };
    return <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold ${state.cls}`}>{state.text}</span>;
};

/* Tombol aksi berupa ikon (44 px), nama tetap terbaca lewat aria-label */
const RowAction = ({ label, onClick, tone = 'default', disabled = false, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={title || label}
        aria-disabled={disabled || undefined}
        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-150 ${
            disabled
                ? 'text-slate-300 cursor-not-allowed'
                : tone === 'danger'
                ? 'text-slate-600 hover:bg-red-50 hover:text-red-600 active:bg-red-100'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100'
        }`}
    >
        {children}
    </button>
);

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

    // tampilkan pesan sukses dari backend (back()->with('success', ...)) bila dibagikan via Inertia
    useEffect(() => {
        if (flash?.success) showToast('success', flash.success);
    }, [flash?.success]);

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
    const filtersActive = Boolean(searchQuery) || selectedCategory !== 'all';
    const countFor = (value) => products.filter((p) => String(p.category_id) === String(value)).length;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
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

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* RINGKASAN */}
                <SummaryStrip
                    items={[
                        { icon: <IconBox />, label: 'Total produk', value: products.length },
                        { icon: <IconAlert />, label: 'Stok menipis (10 atau kurang)', value: lowStockCount, tone: 'amber' },
                        { icon: <IconLayers />, label: 'Kategori', value: categories.length, tone: 'slate' },
                    ]}
                />

                {/* PENCARIAN, AKSI, DAN FILTER KATEGORI */}
                <Panel className="p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                inputMode="search"
                                autoComplete="off"
                                aria-label="Cari produk berdasarkan nama atau kode"
                                placeholder="Cari nama atau kode produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${inputCls} pl-10 pr-12`}
                            />
                            {searchQuery && (
                                <span className="absolute right-1 top-1/2 -translate-y-1/2">
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Hapus pencarian"
                                        className="sc-pop w-10 h-10 rounded-xl text-slate-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200 flex items-center justify-center transition-colors duration-150"
                                    >
                                        <IconClose />
                                    </button>
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsCategoryPanelOpen(!isCategoryPanelOpen)}
                                aria-expanded={isCategoryPanelOpen}
                                aria-controls="panel-kategori"
                                className={`${btnSecondary} ${isCategoryPanelOpen ? '!border-blue-300 !bg-blue-50 !text-blue-700' : ''}`}
                            >
                                <IconFolder />
                                Kelola Kategori
                            </button>
                            <button type="button" onClick={openCreateModal} className={btnPrimary}>
                                <IconPlus />
                                Tambah Produk
                            </button>
                        </div>
                    </div>

                    <div role="group" aria-label="Filter kategori" className="sc-noscroll flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                        {[
                            { id: 'all', name: 'Semua', count: products.length },
                            ...categories.map((c) => ({ ...c, count: countFor(c.id) })),
                        ].map((cat) => {
                            const active = String(selectedCategory) === String(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(String(cat.id))}
                                    aria-pressed={active}
                                    className={`shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors duration-150 ${
                                        active
                                            ? 'bg-blue-600 border-blue-600 text-white active:brightness-90'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50'
                                    }`}
                                >
                                    {cat.name}
                                    <span className={`text-xs font-bold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Panel>

                {/* ================= PANEL KATEGORI ================= */}
                {isCategoryPanelOpen && (
                    <Panel className="sc-pop p-4 sm:p-5" >
                        <div id="panel-kategori" role="region" aria-labelledby="judul-panel-kategori">
                            <div className="flex justify-between items-start gap-3 mb-5">
                                <div>
                                    <h3 id="judul-panel-kategori" className="font-bold text-slate-900 text-base">
                                        Pengaturan Kategori
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-0.5">Kategori yang masih berisi produk tidak bisa dihapus.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryPanelOpen(false)}
                                    aria-label="Tutup panel kategori"
                                    className="w-11 h-11 -mt-1 -mr-2 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                                >
                                    <IconClose />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-6">
                                {/* Form tambah/edit kategori */}
                                <form onSubmit={handleCategorySubmit} className="space-y-3 h-fit">
                                    <Field id="cat-name" label={editCategory ? `Ubah nama: ${editCategory.name}` : 'Tambah kategori baru'} error={catErrors.name}>
                                        <input
                                            id="cat-name"
                                            type="text"
                                            value={catData.name}
                                            onChange={(e) => setCatData('name', e.target.value)}
                                            placeholder="Contoh: Makanan, Minuman"
                                            aria-invalid={Boolean(catErrors.name)}
                                            aria-describedby={catErrors.name ? 'cat-name-error' : undefined}
                                            className={inputCls}
                                            required
                                        />
                                    </Field>
                                    <div className="flex items-center gap-2">
                                        <button type="submit" disabled={catProcessing} className={btnPrimary}>
                                            {catProcessing && <Spinner />}
                                            {editCategory ? 'Simpan' : 'Tambah'}
                                        </button>
                                        {editCategory && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditCategory(null);
                                                    resetCat('name');
                                                    clearCatErrors();
                                                }}
                                                className={btnSecondary}
                                            >
                                                Batal
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Daftar kategori */}
                                <div className="rounded-xl border border-slate-200 max-h-72 overflow-y-auto">
                                    {categories.length === 0 ? (
                                        <p className="p-8 text-center text-sm text-slate-600">Belum ada kategori tersimpan.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {categories.map((cat, i) => {
                                                const productCount = countFor(cat.id);
                                                return (
                                                    <li
                                                        key={cat.id}
                                                        style={{ animationDelay: `${i * 30}ms` }}
                                                        className="sc-rowin flex items-center gap-3 pl-4 pr-2 py-1.5 hover:bg-slate-50 transition-colors duration-150"
                                                    >
                                                        <span className="flex-1 min-w-0 font-semibold text-sm text-slate-800 truncate">{cat.name}</span>
                                                        <span className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{productCount} produk</span>
                                                        <RowAction label={`Ubah kategori ${cat.name}`} onClick={() => handleEditCategory(cat)}>
                                                            <IconEdit />
                                                        </RowAction>
                                                        <RowAction
                                                            label={`Hapus kategori ${cat.name}`}
                                                            tone="danger"
                                                            disabled={productCount > 0}
                                                            title={productCount > 0 ? 'Masih ada produk di kategori ini' : `Hapus kategori ${cat.name}`}
                                                            onClick={() => handleDeleteCategory(cat)}
                                                        >
                                                            <IconTrash />
                                                        </RowAction>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Panel>
                )}

                {/* ================= DAFTAR PRODUK ================= */}
                <Panel className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900 text-base">Daftar Produk</h3>
                        <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                            {filteredAndSortedProducts.length} produk
                        </span>
                    </div>

                    {filteredAndSortedProducts.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <IconImage className="w-10 h-10" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">
                                {filtersActive ? 'Produk tidak ditemukan' : 'Belum ada data produk'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {filtersActive ? 'Coba kata kunci atau kategori lain.' : 'Mulai dengan menambahkan produk pertama Anda.'}
                            </p>
                            <div className="mt-4">
                                {filtersActive ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                        }}
                                        className={btnSecondary}
                                    >
                                        Reset pencarian
                                    </button>
                                ) : (
                                    <button type="button" onClick={openCreateModal} className={btnPrimary}>
                                        <IconPlus />
                                        Tambah Produk
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabel (layar sedang ke atas) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Daftar produk, diurutkan dari stok paling sedikit</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Produk</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                                            <th scope="col" className="px-4 py-3 font-semibold hidden xl:table-cell">Supplier</th>
                                            <th scope="col" className="px-4 py-3 font-semibold hidden xl:table-cell">Harga beli</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Harga jual</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Stok</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedProducts.map((prod, i) => (
                                            <tr
                                                key={prod.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className="sc-rowin border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Thumb src={prod.image} name={prod.name} />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 truncate max-w-[220px]">{prod.name}</p>
                                                            <p className="text-xs font-semibold text-slate-500">{prod.code}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{prod.category?.name || 'Umum'}</td>
                                                <td className="px-4 py-3 text-slate-700 hidden xl:table-cell">{prod.supplier?.name || '-'}</td>
                                                <td className="px-4 py-3 text-slate-700 whitespace-nowrap hidden xl:table-cell">{rp(prod.cost_price)}</td>
                                                <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{rp(prod.selling_price)}</td>
                                                <td className="px-4 py-3">
                                                    <StockBadge stock={prod.stock} />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <RowAction label={`Ubah ${prod.name}`} onClick={() => openEditModal(prod)}>
                                                            <IconEdit />
                                                        </RowAction>
                                                        <RowAction label={`Hapus ${prod.name}`} tone="danger" onClick={() => handleDeleteProduct(prod)}>
                                                            <IconTrash />
                                                        </RowAction>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP): tidak perlu menggeser tabel ke samping */}
                            <ul role="list" className="lg:hidden divide-y divide-slate-100">
                                {filteredAndSortedProducts.map((prod, i) => (
                                    <li
                                        key={prod.id}
                                        style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                        className="sc-rowin flex items-start gap-3 pl-4 pr-2 py-3"
                                    >
                                        <Thumb src={prod.image} name={prod.name} className="w-14 h-14" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 text-sm leading-snug">{prod.name}</p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                {prod.code} &middot; {prod.category?.name || 'Umum'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-900 mt-1">{rp(prod.selling_price)}</p>
                                            <p className="text-xs text-slate-600">
                                                Modal {rp(prod.cost_price)}
                                                {prod.supplier?.name ? ` · ${prod.supplier.name}` : ''}
                                            </p>
                                            <div className="mt-2">
                                                <StockBadge stock={prod.stock} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col shrink-0">
                                            <RowAction label={`Ubah ${prod.name}`} onClick={() => openEditModal(prod)}>
                                                <IconEdit />
                                            </RowAction>
                                            <RowAction label={`Hapus ${prod.name}`} tone="danger" onClick={() => handleDeleteProduct(prod)}>
                                                <IconTrash />
                                            </RowAction>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT PRODUK ================= */}
            {isModalOpen && (
                <DialogShell onClose={() => setIsModalOpen(false)} labelledBy="judul-modal-produk" size="md">
                    <div className="flex justify-between items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-200">
                        <h3 id="judul-modal-produk" className="text-base font-bold text-slate-900">
                            {editProduct ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Tutup"
                            className="w-11 h-11 -mr-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                        >
                            <IconClose />
                        </button>
                    </div>

                    <form onSubmit={handleProductSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="prod-code" label="Kode produk" error={prodErrors.code}>
                                    <input
                                        id="prod-code"
                                        data-autofocus
                                        type="text"
                                        className={inputCls}
                                        value={prodData.code}
                                        onChange={(e) => setProdData('code', e.target.value)}
                                        placeholder="Contoh: BRG-011"
                                        aria-invalid={Boolean(prodErrors.code)}
                                        aria-describedby={prodErrors.code ? 'prod-code-error' : undefined}
                                        required
                                    />
                                </Field>
                                <Field id="prod-name" label="Nama produk" error={prodErrors.name}>
                                    <input
                                        id="prod-name"
                                        type="text"
                                        className={inputCls}
                                        value={prodData.name}
                                        onChange={(e) => setProdData('name', e.target.value)}
                                        placeholder="Nama barang"
                                        aria-invalid={Boolean(prodErrors.name)}
                                        aria-describedby={prodErrors.name ? 'prod-name-error' : undefined}
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="prod-category" label="Kategori" error={prodErrors.category_id}>
                                    <select
                                        id="prod-category"
                                        className={inputCls}
                                        value={prodData.category_id}
                                        onChange={(e) => setProdData('category_id', e.target.value)}
                                    >
                                        <option value="">Pilih kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field id="prod-supplier" label="Supplier" error={prodErrors.supplier_id}>
                                    <select
                                        id="prod-supplier"
                                        className={inputCls}
                                        value={prodData.supplier_id}
                                        onChange={(e) => setProdData('supplier_id', e.target.value)}
                                    >
                                        <option value="">Pilih supplier</option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="prod-cost" label="Harga beli (modal)" error={prodErrors.cost_price}>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                                        <input
                                            id="prod-cost"
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            className={`${inputCls} pl-10`}
                                            value={prodData.cost_price}
                                            onChange={(e) => setProdData('cost_price', e.target.value)}
                                            aria-invalid={Boolean(prodErrors.cost_price)}
                                            aria-describedby={prodErrors.cost_price ? 'prod-cost-error' : undefined}
                                            required
                                        />
                                    </div>
                                </Field>
                                <Field id="prod-price" label="Harga jual" error={prodErrors.selling_price}>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                                        <input
                                            id="prod-price"
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            className={`${inputCls} pl-10`}
                                            value={prodData.selling_price}
                                            onChange={(e) => setProdData('selling_price', e.target.value)}
                                            aria-invalid={Boolean(prodErrors.selling_price)}
                                            aria-describedby={prodErrors.selling_price ? 'prod-price-error' : undefined}
                                            required
                                        />
                                    </div>
                                </Field>
                            </div>

                            <Field id="prod-stock" label={editProduct ? 'Stok saat ini' : 'Stok awal'} error={prodErrors.stock}>
                                <input
                                    id="prod-stock"
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    className={inputCls}
                                    value={prodData.stock}
                                    onChange={(e) => setProdData('stock', e.target.value)}
                                    aria-invalid={Boolean(prodErrors.stock)}
                                    aria-describedby={prodErrors.stock ? 'prod-stock-error' : undefined}
                                    required
                                />
                            </Field>

                            <Field id="prod-image" label="Foto produk (opsional)" error={prodErrors.image} hint="Tempel link foto; pratinjau tampil di sebelah kiri.">
                                <div className="flex items-start gap-3">
                                    <Thumb src={imagePreview} name={prodData.name || 'F'} className="w-12 h-12" />
                                    <input
                                        id="prod-image"
                                        type="url"
                                        placeholder="https://example.com/gambar.jpg"
                                        value={prodData.image}
                                        onChange={(e) => setProdData('image', e.target.value)}
                                        aria-invalid={Boolean(prodErrors.image)}
                                        aria-describedby={prodErrors.image ? 'prod-image-error' : undefined}
                                        className={inputCls}
                                    />
                                </div>
                            </Field>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button type="button" onClick={() => setIsModalOpen(false)} className={btnSecondary}>
                                Batal
                            </button>
                            <button type="submit" disabled={prodProcessing} aria-busy={prodProcessing} className={btnPrimary}>
                                {prodProcessing && <Spinner />}
                                {prodProcessing ? 'Menyimpan...' : 'Simpan'}
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