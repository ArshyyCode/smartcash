import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

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
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER                                                             */
/* ================================================================== */
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const genCode = () => `INV-RESTOCK-${Math.floor(100000 + Math.random() * 900000)}`;

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const I = {
    Download: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 3v10m0 0-3.5-3.5M12 13l3.5-3.5" />
            <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4h-5l-1 2h-4l-1-2H4Z" />
        </svg>
    ),
    Wallet: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M3 10h18" />
            <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" />
        </svg>
    ),
    Receipt: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
            <path d="M9.5 8h5M9.5 12h5" />
        </svg>
    ),
    Alert: ({ className = 'w-5 h-5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M12 3.5 2.8 19.5a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3.5Z" />
            <path d="M12 10v4.5M12 17.5v.1" />
        </svg>
    ),
    Plus: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    Minus: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="M5 12h14" />
        </svg>
    ),
    Search: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    ),
    Close: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    ),
    Check: ({ className = 'w-3 h-3' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    ),
    Trash: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V4.5h6V7" />
        </svg>
    ),
    Truck: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M2.5 6.5A1.5 1.5 0 0 1 4 5h9v11H2.5V6.5Z" />
            <path d="M13 9h4.5l3 3.5V16H13V9Z" />
            <circle cx="7" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
        </svg>
    ),
    Box: ({ className = 'w-[18px] h-[18px]' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
            <path d="m3 8 9 5 9-5M12 13v8" />
        </svg>
    ),
    Chevron: ({ className = 'w-4 h-4' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.5}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    ),
    Refresh: ({ className = 'w-3.5 h-3.5' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip}>
            <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
            <path d="M18 3v4h-4M6 21v-4h4" />
        </svg>
    ),
    Inbox: ({ className = 'w-10 h-10' }) => (
        <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.6}>
            <path d="M3 13.5 5.6 5.8A2 2 0 0 1 7.5 4.5h9a2 2 0 0 1 1.9 1.3L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z" />
            <path d="M3 13.5h5l1 2.5h6l1-2.5h5" />
        </svg>
    ),
};

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

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const Field = ({ label, error, hint, right, children }) => (
    <div>
        <div className="flex items-center justify-between mb-1.5 min-h-[18px]">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            {right}
        </div>
        {children}
        {hint && !error && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        {error && <p className="sc-pop text-red-500 text-[11px] font-semibold mt-1">{error}</p>}
    </div>
);

const StatChip = ({ icon, label, value, tone = 'blue' }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-600' };
    return (
        <div className="h-full flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 transition duration-200 hover:border-blue-300 hover:-translate-y-0.5">
            <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</span>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight truncate">{value}</p>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  SearchSelect: pilihan yang bisa dicari (combobox)                  */
/*  options: [{ value, label, sub, meta, metaTone, search }]           */
/*  - ketik untuk mencari, panah atas/bawah + Enter untuk memilih      */
/* ------------------------------------------------------------------ */
function SearchSelect({ id, options, value, onChange, placeholder = 'Cari...', emptyText = 'Tidak ditemukan', icon, error, footer }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const wrapRef = useRef(null);
    const listRef = useRef(null);

    const selected = options.find((o) => String(o.value) === String(value));
    const q = query.trim().toLowerCase();
    const filtered = q ? options.filter((o) => o.search.includes(q)) : options;

    // tutup saat klik di luar
    useEffect(() => {
        const onDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    useEffect(() => setActive(0), [query, open]);

    // pastikan opsi yang disorot selalu terlihat
    useEffect(() => {
        const el = listRef.current?.children?.[active];
        if (open && el?.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, [active, open]);

    const choose = (o) => {
        onChange(o.value);
        setOpen(false);
        setQuery('');
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) setOpen(true);
            else setActive((a) => Math.min(filtered.length - 1, a + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
        } else if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (filtered[active]) choose(filtered[active]);
        } else if (e.key === 'Escape' && open) {
            // hanya menutup daftar, bukan seluruh modal
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setQuery('');
        }
    };

    const tone = { amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700', slate: 'bg-slate-100 text-slate-600', green: 'bg-emerald-100 text-emerald-700' };

    return (
        <div ref={wrapRef} className="relative">
            <div className="group relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600">
                    {icon || <I.Search />}
                </span>
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={open ? query : selected ? selected.label : ''}
                    placeholder={selected && open ? selected.label : placeholder}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={onKeyDown}
                    className={`${inputCls} pl-11 pr-16 ${error ? errBorder : okBorder} ${selected && !open ? 'font-semibold text-slate-900' : ''}`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {selected && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setQuery('');
                            }}
                            aria-label="Hapus pilihan"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                        >
                            <I.Close className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <span className={`w-6 h-7 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                        <I.Chevron />
                    </span>
                </div>
            </div>

            {open && (
                <div className="sc-pop absolute z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <ul ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-5 text-center text-xs text-slate-400">{emptyText}</li>
                        ) : (
                            filtered.map((o, i) => {
                                const isSel = String(o.value) === String(value);
                                return (
                                    <li key={o.value} role="option" aria-selected={isSel}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => choose(o)}
                                            onMouseEnter={() => setActive(i)}
                                            className={`w-full flex items-center justify-between gap-3 text-left px-3.5 py-2.5 transition-colors ${
                                                i === active ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <span className="min-w-0">
                                                <span className={`block text-[13px] truncate ${isSel ? 'font-extrabold text-blue-700' : 'font-semibold text-slate-800'}`}>
                                                    {o.label}
                                                </span>
                                                {o.sub && <span className="block text-[11px] text-slate-400 truncate">{o.sub}</span>}
                                            </span>
                                            <span className="flex items-center gap-2 shrink-0">
                                                {o.meta && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tone[o.metaTone || 'slate']}`}>{o.meta}</span>
                                                )}
                                                {isSel && (
                                                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                        <I.Check className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400">
                        <span>
                            {filtered.length} dari {options.length} hasil
                        </span>
                        <span className="hidden sm:inline">Gunakan panah dan Enter untuk memilih</span>
                    </div>
                    {footer}
                </div>
            )}
        </div>
    );
}

/* ================================================================== */
/*  HALAMAN RESTOCK                                                    */
/* ================================================================== */
export default function Index({ auth, purchases = [], suppliers = [], products = [], lowStockProducts = [], totalExpenditure = 0 }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    // form restock utama
    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        supplier_id: '',
        purchase_code: genCode(),
        items: [],
    });

    // input "tambah barang masuk"
    const [selectedProduct, setSelectedProduct] = useState('');
    const [qty, setQty] = useState(1);
    const [costPrice, setCostPrice] = useState('');
    const [itemError, setItemError] = useState('');

    // tambah supplier cepat (di dalam modal)
    const [isAddingSupplier, setIsAddingSupplier] = useState(false);
    const [pendingSupplier, setPendingSupplier] = useState('');
    const {
        data: supplierData,
        setData: setSupplierData,
        post: postSupplier,
        reset: resetSupplier,
        errors: supplierErrors,
        clearErrors: clearSupplierErrors,
        processing: supplierProcessing,
    } = useForm({ name: '', phone: '', address: '' });

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    // Esc menutup modal (daftar pilihan menangani Esc-nya sendiri lebih dulu)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !e.defaultPrevented) setIsModalOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // setelah supplier baru tersimpan, pilih otomatis begitu daftar supplier diperbarui
    useEffect(() => {
        if (!pendingSupplier) return;
        const found = suppliers
            .filter((s) => s.name === pendingSupplier)
            .sort((a, b) => b.id - a.id)[0];
        if (found) {
            setData('supplier_id', found.id);
            setPendingSupplier('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suppliers, pendingSupplier]);

    /* ---------- opsi untuk pencarian ---------- */
    const supplierOptions = suppliers.map((s) => ({
        value: s.id,
        label: s.name,
        sub: [s.phone, s.address].filter(Boolean).join(' - ') || 'Belum ada kontak',
        search: `${s.name} ${s.phone || ''} ${s.address || ''}`.toLowerCase(),
    }));

    const productOptions = products.map((p) => ({
        value: p.id,
        label: p.name,
        sub: `${p.code} - Harga beli ${rp(p.cost_price)}`,
        meta: `Stok ${p.stock}`,
        metaTone: Number(p.stock) <= 5 ? 'red' : Number(p.stock) <= 10 ? 'amber' : 'slate',
        search: `${p.name} ${p.code}`.toLowerCase(),
    }));

    /* ---------- modal ---------- */
    const openModal = (presetProductId = null) => {
        // kode invoice dibuat baru setiap membuka form agar tidak bentrok
        setData({ supplier_id: '', purchase_code: genCode(), items: [] });
        clearErrors();
        setSelectedProduct('');
        setQty(1);
        setCostPrice('');
        setItemError('');
        setIsAddingSupplier(false);

        if (presetProductId) {
            const prod = products.find((p) => p.id === presetProductId);
            if (prod) {
                setSelectedProduct(prod.id);
                setCostPrice(prod.cost_price);
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsAddingSupplier(false);
    };

    const pickProduct = (id) => {
        setSelectedProduct(id);
        setItemError('');
        const prod = products.find((p) => String(p.id) === String(id));
        if (prod) setCostPrice(prod.cost_price);
    };

    const addItem = () => {
        const q = parseInt(qty, 10);
        const price = parseFloat(costPrice);
        if (!selectedProduct || !q || q <= 0 || !costPrice || price < 0 || Number.isNaN(price)) {
            setItemError('Pilih produk, isi jumlah, dan harga beli dengan benar.');
            return;
        }

        const product = products.find((p) => String(p.id) === String(selectedProduct));
        if (!product) return;

        const existingIndex = data.items.findIndex((item) => item.product_id === product.id);
        if (existingIndex >= 0) {
            setData(
                'items',
                data.items.map((item, i) => (i === existingIndex ? { ...item, qty: item.qty + q, cost_price: price } : item))
            );
        } else {
            setData('items', [
                ...data.items,
                { product_id: product.id, name: product.name, code: product.code, qty: q, cost_price: price },
            ]);
        }

        setSelectedProduct('');
        setQty(1);
        setCostPrice('');
        setItemError('');
    };

    const changeItemQty = (index, delta) => {
        setData(
            'items',
            data.items.map((item, i) => (i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
        );
    };

    const removeItem = (index) => setData('items', data.items.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.supplier_id) {
            showToast('error', 'Pilih supplier terlebih dahulu.');
            return;
        }
        if (data.items.length === 0) {
            setItemError('Daftar barang restock masih kosong. Tambahkan minimal satu barang.');
            return;
        }

        post(route('purchases.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                reset();
                showToast('success', 'Restock berhasil dicatat dan stok barang bertambah otomatis!');
            },
        });
    };

    const handleQuickSaveSupplier = (e) => {
        e.preventDefault();
        const name = supplierData.name.trim();
        if (!name) return;
        postSupplier(route('suppliers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setPendingSupplier(name);
                resetSupplier();
                clearSupplierErrors();
                setIsAddingSupplier(false);
                showToast('success', `Supplier "${name}" berhasil ditambahkan.`);
            },
        });
    };

    /* ---------- data turunan ---------- */
    const totalRestockAmount = data.items.reduce((sum, item) => sum + item.qty * item.cost_price, 0);
    const totalItemsQty = data.items.reduce((sum, item) => sum + item.qty, 0);

    const q = search.trim().toLowerCase();
    const shownPurchases = purchases.filter(
        (p) =>
            !q ||
            String(p.purchase_code).toLowerCase().includes(q) ||
            String(p.supplier?.name || '').toLowerCase().includes(q) ||
            String(p.user?.name || '').toLowerCase().includes(q)
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <I.Download />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Restock <span className="text-blue-600">Barang &amp; Stok</span>
                    </h2>
                </div>
            }
        >
            <Head title="Restock Barang" />
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[80]">
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
                            {toast.type === 'success' ? <I.Check /> : <I.Close className="w-3 h-3" />}
                        </span>
                        <span className="leading-snug">{toast.message}</span>
                        <button type="button" onClick={() => setToast(null)} aria-label="Tutup" className="ml-1 opacity-60 hover:opacity-100 transition">
                            <I.Close className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* RINGKASAN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatChip icon={<I.Wallet />} label="Total Pengeluaran Restock" value={rp(totalExpenditure)} />
                    <StatChip icon={<I.Receipt />} label="Transaksi Restock" value={`${purchases.length} kali`} tone="slate" />
                    <StatChip icon={<I.Alert />} label="Stok Menipis (≤ 10)" value={`${lowStockProducts.length} produk`} tone="amber" />
                </div>

                {/* PERINGATAN STOK MENIPIS (klik untuk restock cepat) */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                            <I.Alert className="w-[18px] h-[18px]" />
                            Peringatan Stok Menipis
                            <span className="text-[11px] font-medium text-amber-700">- klik produk untuk langsung restock</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {lowStockProducts.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => openModal(p.id)}
                                    className="group inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-900 text-xs pl-3 pr-2 py-1.5 rounded-full font-semibold transition duration-200 hover:border-amber-400 hover:-translate-y-0.5 active:scale-95"
                                >
                                    {p.name}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Number(p.stock) <= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                        {p.stock} pcs
                                    </span>
                                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center transition group-hover:bg-amber-500 group-hover:text-white">
                                        <I.Plus className="w-3 h-3" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* TOOLBAR */}
                <Panel className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Riwayat Pembelian Stok ({purchases.length})</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Catat barang masuk dari supplier, stok produk akan bertambah otomatis.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64 min-w-[180px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <I.Search />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode, supplier, admin..."
                                className={`${inputCls} text-xs pl-9 pr-9 ${okBorder}`}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian"
                                    className="sc-pop absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                                >
                                    <I.Close className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                            <I.Plus />
                            Catat Restock Baru
                        </button>
                    </div>
                </Panel>

                {/* TABEL RIWAYAT */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Kode Pembelian</th>
                                    <th className="px-5 py-3.5 font-semibold">Supplier</th>
                                    <th className="px-5 py-3.5 font-semibold">Admin / Kasir</th>
                                    <th className="px-5 py-3.5 font-semibold">Total Belanja</th>
                                    <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shownPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-14 text-center">
                                            <span className="text-slate-300 inline-block">
                                                <I.Inbox />
                                            </span>
                                            <p className="text-slate-400 text-xs mt-2">
                                                {purchases.length === 0 ? 'Belum ada riwayat pembelian stok.' : 'Tidak ada riwayat yang cocok dengan pencarian.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    shownPurchases.map((p, i) => (
                                        <tr
                                            key={p.id}
                                            style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                            className="sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-3.5 font-bold text-blue-600">{p.purchase_code}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                                        <I.Truck className="w-4 h-4" />
                                                    </span>
                                                    {p.supplier?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">{p.user?.name || '-'}</td>
                                            <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">{rp(p.total_purchase)}</td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>

            {/* ================= MODAL RESTOCK ================= */}
            {isModalOpen && (
                <div onClick={closeModal} className="sc-fade fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-start sm:items-center p-4 overflow-y-auto">
                    <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white rounded-2xl w-full max-w-3xl my-auto">
                        {/* header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
                            <div className="flex items-start gap-4">
                                <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <I.Download />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight">Catat Restock Baru</h3>
                                    <p className="text-xs text-slate-500 mt-1">Pilih supplier, tambahkan barang masuk, lalu simpan.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Tutup"
                                className="w-8 h-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                            >
                                <I.Close />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-6 space-y-6">
                                {/* kode & supplier */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                    <Field
                                        label="Kode Pembelian / Invoice"
                                        error={errors.purchase_code}
                                        right={
                                            <button
                                                type="button"
                                                onClick={() => setData('purchase_code', genCode())}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition active:scale-95"
                                            >
                                                <I.Refresh />
                                                Buat ulang
                                            </button>
                                        }
                                    >
                                        <input
                                            type="text"
                                            className={`${inputCls} ${errors.purchase_code ? errBorder : okBorder}`}
                                            value={data.purchase_code}
                                            onChange={(e) => setData('purchase_code', e.target.value)}
                                            required
                                        />
                                    </Field>

                                    <Field
                                        label="Supplier / Distributor"
                                        error={errors.supplier_id}
                                        right={
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSupplier((v) => !v)}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition active:scale-95"
                                            >
                                                {isAddingSupplier ? 'Tutup form' : '+ Supplier baru'}
                                            </button>
                                        }
                                    >
                                        <SearchSelect
                                            id="restock-supplier"
                                            options={supplierOptions}
                                            value={data.supplier_id}
                                            onChange={(v) => setData('supplier_id', v)}
                                            placeholder="Cari nama atau kontak supplier..."
                                            emptyText="Supplier tidak ditemukan. Tambahkan lewat '+ Supplier baru'."
                                            icon={<I.Truck />}
                                            error={errors.supplier_id}
                                        />
                                    </Field>
                                </div>

                                {/* tambah supplier cepat */}
                                {isAddingSupplier && (
                                    <div className="sc-pop rounded-xl bg-blue-50/60 border border-blue-100 p-4 space-y-3">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Tambah Supplier Baru</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Nama Supplier" error={supplierErrors.name}>
                                                <input
                                                    type="text"
                                                    value={supplierData.name}
                                                    onChange={(e) => setSupplierData('name', e.target.value)}
                                                    placeholder="Contoh: PT Sumber Rejeki"
                                                    className={`${inputCls} ${supplierErrors.name ? errBorder : okBorder}`}
                                                />
                                            </Field>
                                            <Field label="No. Telepon" error={supplierErrors.phone}>
                                                <input
                                                    type="text"
                                                    value={supplierData.phone}
                                                    onChange={(e) => setSupplierData('phone', e.target.value)}
                                                    placeholder="08xxxxxxxxxx"
                                                    className={`${inputCls} ${supplierErrors.phone ? errBorder : okBorder}`}
                                                />
                                            </Field>
                                        </div>
                                        <Field label="Alamat" error={supplierErrors.address}>
                                            <input
                                                type="text"
                                                value={supplierData.address}
                                                onChange={(e) => setSupplierData('address', e.target.value)}
                                                placeholder="Alamat supplier..."
                                                className={`${inputCls} ${supplierErrors.address ? errBorder : okBorder}`}
                                            />
                                        </Field>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSupplier(false)}
                                                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleQuickSaveSupplier}
                                                disabled={supplierProcessing || !supplierData.name.trim()}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {supplierProcessing && <Spinner />}
                                                Simpan Supplier
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* tambah barang masuk */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tambah Barang Masuk</h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_130px_160px] gap-x-4 gap-y-4 items-start">
                                        <Field label="Produk">
                                            <SearchSelect
                                                id="restock-product"
                                                options={productOptions}
                                                value={selectedProduct}
                                                onChange={pickProduct}
                                                placeholder="Cari nama atau kode produk..."
                                                emptyText="Produk tidak ditemukan"
                                                icon={<I.Box />}
                                            />
                                        </Field>

                                        <Field label="Jumlah (Qty)">
                                            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((v) => Math.max(1, Number(v || 1) - 1))}
                                                    aria-label="Kurangi"
                                                    className="w-9 h-[42px] shrink-0 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition active:scale-90"
                                                >
                                                    <I.Minus />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={qty}
                                                    onChange={(e) => setQty(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                                                    className="w-full min-w-0 border-0 text-center text-sm font-bold text-slate-900 focus:ring-0 py-2.5 px-0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setQty((v) => Number(v || 0) + 1)}
                                                    aria-label="Tambah"
                                                    className="w-9 h-[42px] shrink-0 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition active:scale-90"
                                                >
                                                    <I.Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </Field>

                                        <Field label="Harga Beli Satuan">
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={costPrice}
                                                    onChange={(e) => setCostPrice(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                                                    placeholder="0"
                                                    className={`${inputCls} pl-10 ${okBorder}`}
                                                />
                                            </div>
                                        </Field>
                                    </div>

                                    {itemError && <p className="sc-pop text-red-500 text-[11px] font-semibold">{itemError}</p>}

                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-[.98]"
                                    >
                                        <I.Plus />
                                        Masukkan ke Daftar Restock
                                    </button>
                                </div>

                                {/* daftar item */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Daftar Barang Restock</p>
                                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                            {data.items.length} jenis &middot; {totalItemsQty} pcs
                                        </span>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                                                    <tr>
                                                        <th className="px-4 py-2.5 font-semibold">Produk</th>
                                                        <th className="px-4 py-2.5 font-semibold">Qty</th>
                                                        <th className="px-4 py-2.5 font-semibold">Harga Beli</th>
                                                        <th className="px-4 py-2.5 font-semibold">Subtotal</th>
                                                        <th className="px-4 py-2.5 font-semibold text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.items.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                                                Belum ada item ditambahkan.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.items.map((item, index) => (
                                                            <tr key={item.product_id} className="sc-rowin border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                                    <p className="text-[10px] text-slate-400">{item.code}</p>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => changeItemQty(index, -1)}
                                                                            aria-label="Kurangi"
                                                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-l-lg transition active:scale-75"
                                                                        >
                                                                            <I.Minus className="w-3 h-3" />
                                                                        </button>
                                                                        <span key={item.qty} className="sc-pop w-8 text-center font-bold text-slate-800">
                                                                            {item.qty}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => changeItemQty(index, 1)}
                                                                            aria-label="Tambah"
                                                                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition active:scale-75"
                                                                        >
                                                                            <I.Plus className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{rp(item.cost_price)}</td>
                                                                <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{rp(item.qty * item.cost_price)}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeItem(index)}
                                                                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition active:scale-95"
                                                                    >
                                                                        <I.Trash />
                                                                        Hapus
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {(errors.items || errors.message) && (
                                        <p className="sc-pop text-red-500 text-[11px] font-semibold mt-2">{errors.items || errors.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Keseluruhan Restock</p>
                                    <p key={totalRestockAmount} className="sc-pop text-xl font-extrabold text-blue-700 tracking-tight">
                                        {rp(totalRestockAmount)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:justify-end">
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
                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {processing && <Spinner />}
                                        {processing ? 'Menyimpan...' : 'Simpan & Tambah Stok Otomatis'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}