import React, { useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
import { Head, useForm } from '@inertiajs/react';

/* ================================================================== */
/*  Restock Barang & Stok                                              */
/*  Letakkan di: resources/js/Pages/Purchases/Index.jsx                */
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
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop { animation: none !important }
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
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

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
    'w-full min-h-[44px] text-base sm:text-sm rounded-xl bg-white placeholder:text-slate-400 transition duration-150 focus:ring-4';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';
const errBorder = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-blue-700 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600';
const btnSecondary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold transition-colors duration-150 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50';
const textBtn =
    'inline-flex items-center gap-1.5 min-h-[44px] px-1 text-sm font-bold text-blue-600 transition-colors duration-150 hover:text-blue-800 active:opacity-70';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const Field = ({ id, label, error, hint, right, children }) => (
    <div>
        <div className={`flex items-center justify-between gap-3 mb-1.5 ${right ? 'min-h-[44px]' : ''}`}>
            <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
                {label}
            </label>
            {right}
        </div>
        {children}
        {hint && !error && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
        {error && (
            <p id={`${id}-error`} role="alert" className="sc-pop text-red-600 text-xs font-semibold mt-1.5">
                {error}
            </p>
        )}
    </div>
);

/* Ringkasan: satu panel, tiga kolom (lebih ringan daripada tiga kotak terpisah) */
const SummaryStrip = ({ items }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-600' };
    return (
        <Panel className="grid grid-cols-1 sm:grid-cols-3 divide-y divide-slate-200 sm:divide-y-0 sm:divide-x">
            {items.map((it) => (
                <div key={it.label} className="flex items-center gap-3.5 p-4 sm:p-5">
                    <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tones[it.tone || 'blue']}`}>{it.icon}</span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600">{it.label}</p>
                        <p className="text-xl font-extrabold text-slate-900 leading-tight truncate">{it.value}</p>
                    </div>
                </div>
            ))}
        </Panel>
    );
};

/* Tombol aksi berupa ikon (44 px), nama tetap terbaca lewat aria-label */
const RowAction = ({ label, onClick, tone = 'default', children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-150 text-slate-600 ${
            tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600 active:bg-red-100' : 'hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100'
        }`}
    >
        {children}
    </button>
);

/* Tombol - / + untuk jumlah */
const StepButton = ({ label, onClick, disabled, side, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`w-11 h-11 shrink-0 flex items-center justify-center text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed ${
            side === 'left' ? 'rounded-l-xl' : 'rounded-r-xl'
        }`}
    >
        {children}
    </button>
);

/* ------------------------------------------------------------------ */
/*  SearchSelect: pilihan yang bisa dicari (combobox)                  */
/*  options: [{ value, label, sub, meta, metaTone, search }]           */
/*  - ketik untuk mencari, panah atas/bawah + Enter untuk memilih      */
/*  - fokus tetap di kolom isian; opsi diumumkan lewat aria-activedescendant */
/* ------------------------------------------------------------------ */
function SearchSelect({ id, options, value, onChange, placeholder = 'Cari...', emptyText = 'Tidak ditemukan', icon, error, footer }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const wrapRef = useRef(null);
    const listRef = useRef(null);

    const listId = `${id}-list`;
    const optId = (i) => `${id}-opt-${i}`;

    const selected = options.find((o) => String(o.value) === String(value));
    const q = query.trim().toLowerCase();
    const filtered = q ? options.filter((o) => o.search.includes(q)) : options;

    // tutup saat menyentuh/klik di luar
    useEffect(() => {
        const onDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('pointerdown', onDown);
        return () => document.removeEventListener('pointerdown', onDown);
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
            // hanya menutup daftar, bukan seluruh dialog
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setQuery('');
        } else if (e.key === 'Tab') {
            setOpen(false);
            setQuery('');
        }
    };

    const tone = { amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700', slate: 'bg-slate-100 text-slate-600', green: 'bg-emerald-100 text-emerald-700' };

    return (
        <div ref={wrapRef} className="relative">
            <div className="group relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-600">
                    {icon || <I.Search />}
                </span>
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={open && filtered[active] ? optId(active) : undefined}
                    aria-invalid={error ? true : undefined}
                    autoComplete="off"
                    value={open ? query : selected ? selected.label : ''}
                    placeholder={selected && open ? selected.label : placeholder}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onKeyDown={onKeyDown}
                    className={`${inputCls} pl-11 pr-20 ${error ? errBorder : okBorder} ${selected && !open ? 'font-semibold text-slate-900' : ''}`}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    {selected && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setQuery('');
                            }}
                            aria-label="Hapus pilihan"
                            className="w-10 h-10 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 active:bg-red-100 flex items-center justify-center transition-colors duration-150"
                        >
                            <I.Close className="w-4 h-4" />
                        </button>
                    )}
                    <span className={`w-8 h-10 flex items-center justify-center text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
                        <I.Chevron />
                    </span>
                </div>
            </div>

            {open && (
                <div className="sc-pop absolute z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    <ul ref={listRef} id={listId} role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li role="presentation" className="px-4 py-5 text-center text-sm text-slate-600">
                                {emptyText}
                            </li>
                        ) : (
                            filtered.map((o, i) => {
                                const isSel = String(o.value) === String(value);
                                return (
                                    <li
                                        key={o.value}
                                        id={optId(i)}
                                        role="option"
                                        aria-selected={isSel}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => choose(o)}
                                        onMouseEnter={() => setActive(i)}
                                        className={`flex items-center justify-between gap-3 px-4 py-2 min-h-[48px] cursor-pointer transition-colors duration-100 ${
                                            i === active ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <span className="min-w-0">
                                            <span className={`block text-sm truncate ${isSel ? 'font-extrabold text-blue-700' : 'font-semibold text-slate-800'}`}>{o.label}</span>
                                            {o.sub && <span className="block text-xs text-slate-600 truncate">{o.sub}</span>}
                                        </span>
                                        <span className="flex items-center gap-2 shrink-0">
                                            {o.meta && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tone[o.metaTone || 'slate']}`}>{o.meta}</span>}
                                            {isSel && (
                                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                    <I.Check className="w-3 h-3" />
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                    <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-600">
                        <span>
                            {filtered.length} dari {options.length} hasil
                        </span>
                        <span className="hidden sm:inline">Panah atas/bawah dan Enter untuk memilih</span>
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
const LOW_STOCK_PREVIEW = 8;

export default function Index({ auth, purchases = [], suppliers = [], products = [], lowStockProducts = [], totalExpenditure = 0 }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [showAllLow, setShowAllLow] = useState(false);

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

    const fmtDate = (d) => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    const lowShown = showAllLow ? lowStockProducts : lowStockProducts.slice(0, LOW_STOCK_PREVIEW);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
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

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* RINGKASAN */}
                <SummaryStrip
                    items={[
                        { icon: <I.Wallet />, label: 'Total pengeluaran restock', value: rp(totalExpenditure) },
                        { icon: <I.Receipt />, label: 'Transaksi restock', value: `${purchases.length} kali`, tone: 'slate' },
                        { icon: <I.Alert />, label: 'Stok menipis (10 atau kurang)', value: `${lowStockProducts.length} produk`, tone: 'amber' },
                    ]}
                />

                {/* PERINGATAN STOK MENIPIS (pilih produk untuk restock cepat) */}
                {lowStockProducts.length > 0 && (
                    <section aria-labelledby="judul-stok-menipis" className="rounded-2xl border border-amber-400/50 bg-amber-50 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <h3 id="judul-stok-menipis" className="flex items-center gap-2 text-sm font-bold text-amber-800">
                                <I.Alert className="w-[18px] h-[18px]" />
                                Stok menipis ({lowStockProducts.length})
                            </h3>
                            <p className="text-sm text-amber-800">Pilih produk untuk langsung restock.</p>
                        </div>

                        <ul className="flex flex-wrap gap-2 mt-3">
                            {lowShown.map((p) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => openModal(p.id)}
                                        aria-label={`Restock ${p.name}, sisa ${p.stock}`}
                                        className="inline-flex items-center gap-2 min-h-[44px] pl-4 pr-3 rounded-full bg-white border border-amber-400/60 text-slate-800 text-sm font-semibold transition-colors duration-150 hover:bg-amber-100 active:bg-amber-100"
                                    >
                                        {p.name}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${Number(p.stock) <= 5 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                            {p.stock} pcs
                                        </span>
                                        <I.Plus className="w-4 h-4 text-amber-700" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {lowStockProducts.length > LOW_STOCK_PREVIEW && (
                            <button
                                type="button"
                                onClick={() => setShowAllLow((v) => !v)}
                                aria-expanded={showAllLow}
                                className="mt-2 min-h-[44px] text-sm font-bold text-amber-800 underline underline-offset-4 decoration-amber-400/70 hover:decoration-amber-700 transition-colors"
                            >
                                {showAllLow ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${lowStockProducts.length})`}
                            </button>
                        )}
                    </section>
                )}

                {/* RIWAYAT PEMBELIAN */}
                <Panel className="overflow-hidden">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-900 text-base">Riwayat Pembelian Stok</h3>
                            <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                {q ? `${shownPurchases.length} dari ${purchases.length}` : purchases.length}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative sm:w-72">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <I.Search />
                                </span>
                                <input
                                    type="text"
                                    inputMode="search"
                                    autoComplete="off"
                                    aria-label="Cari riwayat berdasarkan kode, supplier, atau pencatat"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kode, supplier, pencatat..."
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
                                            <I.Close className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                            </div>

                            <button type="button" onClick={() => openModal()} className={btnPrimary}>
                                <I.Plus />
                                Catat Restock Baru
                            </button>
                        </div>
                    </div>

                    {shownPurchases.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <I.Inbox />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">
                                {purchases.length === 0 ? 'Belum ada riwayat pembelian stok' : 'Tidak ada riwayat yang cocok'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {purchases.length === 0 ? 'Catat barang masuk dari supplier, stok produk bertambah otomatis.' : 'Coba kata kunci lain.'}
                            </p>
                            {purchases.length === 0 && (
                                <div className="mt-4">
                                    <button type="button" onClick={() => openModal()} className={btnPrimary}>
                                        <I.Plus />
                                        Catat Restock Baru
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Tabel (layar sedang ke atas) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Riwayat pembelian stok</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Kode pembelian</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Supplier</th>
                                            <th scope="col" className="px-4 py-3 font-semibold hidden xl:table-cell">Dicatat oleh</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Total belanja</th>
                                            <th scope="col" className="px-5 py-3 font-semibold">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shownPurchases.map((p, i) => (
                                            <tr
                                                key={p.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className="sc-rowin border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-3.5 font-bold text-blue-600 whitespace-nowrap">{p.purchase_code}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-2.5 font-semibold text-slate-800">
                                                        <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                                            <I.Truck className="w-4 h-4" />
                                                        </span>
                                                        {p.supplier?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-700 hidden xl:table-cell">{p.user?.name || '-'}</td>
                                                <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{rp(p.total_purchase)}</td>
                                                <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP): tidak perlu menggeser tabel ke samping */}
                            <ul role="list" className="lg:hidden divide-y divide-slate-100">
                                {shownPurchases.map((p, i) => (
                                    <li key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }} className="sc-rowin px-4 py-3.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-bold text-sm text-blue-600 break-all">{p.purchase_code}</p>
                                            <p className="font-bold text-sm text-slate-900 whitespace-nowrap">{rp(p.total_purchase)}</p>
                                        </div>
                                        <p className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-slate-800">
                                            <span className="text-slate-500">
                                                <I.Truck className="w-4 h-4" />
                                            </span>
                                            {p.supplier?.name || '-'}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {fmtDate(p.created_at)}
                                            {p.user?.name ? ` · ${p.user.name}` : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= MODAL RESTOCK ================= */}
            {isModalOpen && (
                <DialogShell onClose={closeModal} labelledBy="judul-modal-restock" size="xl">
                    <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200">
                        <div>
                            <h3 id="judul-modal-restock" className="text-base font-bold text-slate-900 leading-tight">
                                Catat Restock Baru
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">Pilih supplier, tambahkan barang masuk, lalu simpan.</p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Tutup"
                            className="w-11 h-11 -mt-1 -mr-2 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                        >
                            <I.Close />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
                            {/* kode & supplier */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                <Field
                                    id="restock-code"
                                    label="Kode pembelian / invoice"
                                    error={errors.purchase_code}
                                    right={
                                        <button type="button" onClick={() => setData('purchase_code', genCode())} className={textBtn}>
                                            <I.Refresh />
                                            Buat ulang
                                        </button>
                                    }
                                >
                                    <input
                                        id="restock-code"
                                        data-autofocus
                                        type="text"
                                        className={`${inputCls} ${errors.purchase_code ? errBorder : okBorder}`}
                                        value={data.purchase_code}
                                        onChange={(e) => setData('purchase_code', e.target.value)}
                                        aria-invalid={Boolean(errors.purchase_code)}
                                        aria-describedby={errors.purchase_code ? 'restock-code-error' : undefined}
                                        required
                                    />
                                </Field>

                                <Field
                                    id="restock-supplier"
                                    label="Supplier / distributor"
                                    error={errors.supplier_id}
                                    right={
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingSupplier((v) => !v)}
                                            aria-expanded={isAddingSupplier}
                                            className={textBtn}
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
                                <div className="sc-pop rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-4">
                                    <h4 className="text-sm font-bold text-blue-900">Supplier baru</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field id="sup-name" label="Nama supplier" error={supplierErrors.name}>
                                            <input
                                                id="sup-name"
                                                type="text"
                                                value={supplierData.name}
                                                onChange={(e) => setSupplierData('name', e.target.value)}
                                                placeholder="Contoh: PT Sumber Rejeki"
                                                className={`${inputCls} ${supplierErrors.name ? errBorder : okBorder}`}
                                            />
                                        </Field>
                                        <Field id="sup-phone" label="No. telepon" error={supplierErrors.phone}>
                                            <input
                                                id="sup-phone"
                                                type="tel"
                                                inputMode="tel"
                                                value={supplierData.phone}
                                                onChange={(e) => setSupplierData('phone', e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                                className={`${inputCls} ${supplierErrors.phone ? errBorder : okBorder}`}
                                            />
                                        </Field>
                                    </div>
                                    <Field id="sup-address" label="Alamat" error={supplierErrors.address}>
                                        <input
                                            id="sup-address"
                                            type="text"
                                            value={supplierData.address}
                                            onChange={(e) => setSupplierData('address', e.target.value)}
                                            placeholder="Alamat supplier..."
                                            className={`${inputCls} ${supplierErrors.address ? errBorder : okBorder}`}
                                        />
                                    </Field>
                                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                        <button type="button" onClick={() => setIsAddingSupplier(false)} className={btnSecondary}>
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleQuickSaveSupplier}
                                            disabled={supplierProcessing || !supplierData.name.trim()}
                                            className={btnPrimary}
                                        >
                                            {supplierProcessing && <Spinner />}
                                            Simpan Supplier
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* tambah barang masuk */}
                            <section aria-labelledby="judul-tambah-barang" className="border-t border-slate-200 pt-5 space-y-4">
                                <h4 id="judul-tambah-barang" className="text-sm font-bold text-slate-900">
                                    Tambah barang masuk
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px_170px] gap-x-4 gap-y-4 items-start">
                                    <Field id="restock-product" label="Produk">
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

                                    <Field id="restock-qty" label="Jumlah">
                                        <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
                                            <StepButton label="Kurangi jumlah" side="left" onClick={() => setQty((v) => Math.max(1, Number(v || 1) - 1))}>
                                                <I.Minus className="w-4 h-4" />
                                            </StepButton>
                                            <input
                                                id="restock-qty"
                                                type="number"
                                                inputMode="numeric"
                                                min="1"
                                                value={qty}
                                                onChange={(e) => setQty(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                                                className="w-full min-w-0 h-11 border-0 text-center text-base sm:text-sm font-bold text-slate-900 focus:ring-0 px-0"
                                            />
                                            <StepButton label="Tambah jumlah" side="right" onClick={() => setQty((v) => Number(v || 0) + 1)}>
                                                <I.Plus className="w-4 h-4" />
                                            </StepButton>
                                        </div>
                                    </Field>

                                    <Field id="restock-cost" label="Harga beli satuan">
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                                            <input
                                                id="restock-cost"
                                                type="number"
                                                inputMode="numeric"
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

                                {itemError && (
                                    <p role="alert" className="sc-pop text-red-600 text-sm font-semibold">
                                        {itemError}
                                    </p>
                                )}

                                <button type="button" onClick={addItem} className={`${btnSecondary} w-full sm:w-auto`}>
                                    <I.Plus />
                                    Masukkan ke daftar restock
                                </button>
                            </section>

                            {/* daftar item */}
                            <section aria-labelledby="judul-daftar-barang" className="border-t border-slate-200 pt-5">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <h4 id="judul-daftar-barang" className="text-sm font-bold text-slate-900">
                                        Daftar barang restock
                                    </h4>
                                    <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                        {data.items.length} jenis &middot; {totalItemsQty} pcs
                                    </span>
                                </div>

                                {data.items.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-600">
                                        Belum ada barang ditambahkan.
                                    </p>
                                ) : (
                                    <ul role="list" className="rounded-xl border border-slate-200 divide-y divide-slate-100 px-4">
                                        {data.items.map((item, index) => (
                                            <li key={item.product_id} className="sc-rowin py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                                                    <p className="text-xs text-slate-600">
                                                        {item.code} &middot; {rp(item.cost_price)} / pcs
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                                    <div role="group" aria-label={`Jumlah ${item.name}`} className="flex items-center rounded-xl border border-slate-200 bg-white">
                                                        <StepButton
                                                            label={`Kurangi jumlah ${item.name}`}
                                                            side="left"
                                                            disabled={item.qty <= 1}
                                                            onClick={() => changeItemQty(index, -1)}
                                                        >
                                                            <I.Minus className="w-4 h-4" />
                                                        </StepButton>
                                                        <span key={item.qty} aria-live="polite" className="sc-pop min-w-[2.25rem] text-center text-sm font-bold text-slate-800">
                                                            {item.qty}
                                                        </span>
                                                        <StepButton label={`Tambah jumlah ${item.name}`} side="right" onClick={() => changeItemQty(index, 1)}>
                                                            <I.Plus className="w-4 h-4" />
                                                        </StepButton>
                                                    </div>
                                                    <span className="min-w-[6.5rem] text-right font-bold text-sm text-slate-900 whitespace-nowrap">
                                                        {rp(item.qty * item.cost_price)}
                                                    </span>
                                                    <RowAction label={`Hapus ${item.name} dari daftar`} tone="danger" onClick={() => removeItem(index)}>
                                                        <I.Trash className="w-[18px] h-[18px]" />
                                                    </RowAction>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {(errors.items || errors.message) && (
                                    <p role="alert" className="sc-pop text-red-600 text-sm font-semibold mt-2">
                                        {errors.items || errors.message}
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* footer: total dan aksi tetap terlihat */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-slate-50 border-t border-slate-200 sm:rounded-b-2xl">
                            <div>
                                <p className="text-xs font-semibold text-slate-600">Total restock</p>
                                <p key={totalRestockAmount} aria-live="polite" className="sc-pop text-xl font-extrabold text-blue-700 tracking-tight">
                                    {rp(totalRestockAmount)}
                                </p>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-2">
                                <button type="button" onClick={closeModal} className={btnSecondary}>
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} aria-busy={processing} className={btnPrimary}>
                                    {processing && <Spinner />}
                                    {processing ? 'Menyimpan...' : 'Simpan & Tambah Stok'}
                                </button>
                            </div>
                        </div>
                    </form>
                </DialogShell>
            )}
        </AuthenticatedLayout>
    );
}