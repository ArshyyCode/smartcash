import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

/* ================================================================== */
/*  FOTO PRODUK (BERUPA LINK)                                          */
/*                                                                     */
/*  Urutan yang dipakai untuk menentukan foto sebuah produk:           */
/*   1. Kolom `image` produk di database                               */
/*      - jika berupa link (https://...) langsung dipakai              */
/*      - jika berupa path (mis. products/a.jpg) dibaca dari /storage  */
/*   2. PRODUCT_IMAGES di bawah (tempel link foto Anda sendiri)        */
/*   3. Foto otomatis dari kata kunci nama barang                      */
/*   4. Jika link gagal dimuat -> tampil huruf awal nama barang        */
/* ================================================================== */

// Isi dengan link foto Anda sendiri. Kunci = nama barang (huruf kecil),
// cukup sebagian kata dari nama produk. Contoh:
//   'nasi goreng': 'https://contoh.com/foto/nasi-goreng.jpg',
const PRODUCT_IMAGES = {
    // 'nasi goreng': 'https://...',
};

// Terjemahan kata kunci nama barang -> kata kunci foto (urut dari yang paling spesifik)
const IMAGE_KEYWORDS = [
    ['nasi goreng', 'fried,rice'], ['mie goreng', 'fried,noodles'], ['mie ayam', 'chicken,noodle,soup'],
    ['mie instan', 'instant,noodles'], ['indomie', 'instant,noodles'], ['bakso', 'meatball,soup'],
    ['soto', 'soup,chicken'], ['sate', 'satay,skewer'], ['ayam goreng', 'fried,chicken'],
    ['ayam geprek', 'fried,chicken'], ['rendang', 'beef,curry'], ['gado-gado', 'salad,peanut'],
    ['nasi', 'rice,meal'], ['telur', 'egg'], ['tempe', 'tempeh'], ['tahu', 'tofu'],
    ['es teh', 'iced,tea'], ['teh', 'tea'], ['kopi', 'coffee'], ['es jeruk', 'orange,juice'],
    ['jeruk', 'orange,juice'], ['jus', 'fruit,juice'], ['air mineral', 'bottled,water'],
    ['aqua', 'bottled,water'], ['mineral', 'bottled,water'], ['susu', 'milk'], ['soda', 'soda,drink'],
    ['cola', 'cola,drink'], ['roti', 'bread'], ['donat', 'donut'], ['kue', 'cake'],
    ['cokelat', 'chocolate'], ['coklat', 'chocolate'], ['keripik', 'potato,chips'],
    ['kentang', 'potato,chips'], ['biskuit', 'biscuit,cookies'], ['permen', 'candy'],
    ['snack', 'snack,chips'], ['mie', 'noodles'], ['gula', 'sugar'], ['beras', 'rice,grain'],
    ['minyak', 'cooking,oil'], ['sabun', 'soap'], ['shampo', 'shampoo,bottle'], ['pulpen', 'pen'],
    ['buku', 'notebook'], ['sosis', 'sausage'], ['keju', 'cheese'], ['madu', 'honey'],
    ['apel', 'apple'], ['pisang', 'banana'], ['mangga', 'mango'],
];

const isLink = (s) => /^(https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('/');

const matchWord = (name, key) => new RegExp(`(^|[^a-z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`).test(name);

const flickr = (tags, id) =>
    `https://loremflickr.com/480/360/${tags.split(',').map(encodeURIComponent).join(',')}?lock=${id}`;

const getProductImage = (product) => {
    const raw = typeof product.image === 'string' ? product.image.trim() : '';
    if (raw) return isLink(raw) ? raw : `/storage/${raw.replace(/^\/+/, '')}`;

    const name = String(product.name || '').toLowerCase();

    for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
        if (name.includes(key.toLowerCase())) return url;
    }
    for (const [key, tags] of IMAGE_KEYWORDS) {
        if (matchWord(name, key)) return flickr(tags, product.id);
    }

    // nama tidak dikenal: pakai kata-kata dari nama barang itu sendiri
    const words = name.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3);
    return words.length ? flickr(words.slice(0, 2).join(','), product.id) : null;
};

/* Foto produk dengan cadangan huruf awal bila link gagal */
const ProductImage = ({ product, className = '', textSize = 'text-3xl' }) => {
    const [failed, setFailed] = useState(false);
    const src = getProductImage(product);

    useEffect(() => setFailed(false), [src]);

    if (!src || failed) {
        return (
            <div className={`flex items-center justify-center bg-blue-50 text-blue-500 font-extrabold ${textSize} ${className}`}>
                {(product.name || '?').charAt(0).toUpperCase()}
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={product.name}
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className={`object-cover ${className}`}
        />
    );
};

/* ================================================================== */
/*  CSS                                                                */
/* ================================================================== */
const css = `
@keyframes sc-rowin { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes sc-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }
@keyframes sc-toast { from { opacity: 0; transform: translateY(-12px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes sc-spin { to { transform: rotate(360deg) } }
.sc-rowin { animation: sc-rowin .4s cubic-bezier(.22,1,.36,1) backwards }
.sc-pop { animation: sc-pop .3s cubic-bezier(.22,1,.36,1) backwards }
.sc-toast { animation: sc-toast .35s cubic-bezier(.22,1,.36,1) backwards }
.sc-spin { animation: sc-spin .8s linear infinite }
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
.sc-thin::-webkit-scrollbar { width: 6px }
.sc-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin,.sc-pop,.sc-toast { animation: none !important }
}
`;

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconCart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 4h2.2l2.2 11h10.2l2-8H6.2" />
        <circle cx="9" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
);
const IconSearch = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.500-3.500" />
    </svg>
);
const IconPlus = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const IconMinus = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="M5 12h14" />
    </svg>
);
const IconClose = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.500}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={3}>
        <path d="m5 12.500 4.500 4.500L19 7.500" />
    </svg>
);
const IconTrash = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.500 1.500 0 0 0 1.500 1.400h7a1.500 1.500 0 0 0 1.500-1.400L18 7M9 7V4.500h6V7" />
    </svg>
);
const IconGrid = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="4" y="4" width="6.500" height="6.500" rx="1.500" />
        <rect x="13.500" y="4" width="6.500" height="6.500" rx="1.500" />
        <rect x="4" y="13.500" width="6.500" height="6.500" rx="1.500" />
        <rect x="13.500" y="13.500" width="6.500" height="6.500" rx="1.500" />
    </svg>
);
const IconFork = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M4.500 3v6M17 21V3c-2.200 1.200-3 4-3 7s1 4 3 4" />
    </svg>
);
const IconCup = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M5 8h14l-1.500 11a2 2 0 0 1-2 1.700h-7a2 2 0 0 1-2-1.700L5 8Z" />
        <path d="M6 8c0-2.500 2.500-4 6-4s6 1.500 6 4M14.500 3.500 16 1.500" />
    </svg>
);
const IconBag = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M5 8h14l1 12.500H4L5 8Z" />
        <path d="M9 10.500V7a3 3 0 0 1 6 0v3.500" />
    </svg>
);
const IconTag = ({ className = 'w-6 h-6' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 12.200V4.500A1.500 1.500 0 0 1 4.500 3h7.700a1.500 1.500 0 0 1 1.100.4l7.300 7.300a1.500 1.500 0 0 1 0 2.100l-7.700 7.700a1.500 1.500 0 0 1-2.100 0l-7.300-7.300a1.500 1.500 0 0 1-.5-1Z" />
        <circle cx="7.500" cy="7.500" r="1.200" fill="currentColor" />
    </svg>
);
const IconCard = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18M7 15h3" />
    </svg>
);
const IconChevronRight = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={2.500}>
        <path d="m9 6 6 6-6 6" />
    </svg>
);
const IconBasket = ({ className = 'w-12 h-12' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.4}>
        <path d="M3 4h2.200l2.200 11h10.200l2-8H6.200" />
        <circle cx="9" cy="19.500" r="1.400" />
        <circle cx="17" cy="19.500" r="1.400" />
    </svg>
);
const IconBox = ({ className = 'w-12 h-12' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip} strokeWidth={1.4}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
);

const categoryIcon = (name = '') => {
    const n = name.toLowerCase();
    if (/(makan|food|nasi|lauk)/.test(n)) return <IconFork />;
    if (/(minum|drink|beverage|kopi|teh)/.test(n)) return <IconCup />;
    if (/(snack|cemil|jajan|roti|kue)/.test(n)) return <IconBag />;
    return <IconTag />;
};

const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

/* ================================================================== */
/*  HALAMAN POS                                                        */
/* ================================================================== */
export default function Index({ auth, products = [], categories = [], activeDiscounts = [] }) {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [payAmount, setPayAmount] = useState(0); // Disimpan sebagai angka (integer) untuk akumulasi
    const [selectedDiscountId, setSelectedDiscountId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [flashId, setFlashId] = useState(null);
    const [toast, setToast] = useState(null);

    /* ---------- toast (pengganti alert) ---------- */
    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    /* ---------- data turunan ---------- */
    // id kategori dibandingkan sebagai teks supaya tetap cocok walau tipe datanya
    // berbeda (mis. category_id "2" dari database vs angka 2)
    const inCategory = (product, categoryValue) =>
        categoryValue === 'all' || String(product.category_id ?? product.category?.id ?? '') === String(categoryValue);

    // Daftar kategori: gabungan dari prop `categories` dan kategori yang melekat pada produk,
    // jadi tombol kategori tetap muncul walau backend belum mengirim daftar kategori
    const categoryList = (() => {
        const map = new Map();
        [...categories, ...products.map((p) => p.category)].forEach((c) => {
            if (c && c.id !== undefined && c.id !== null && !map.has(String(c.id))) map.set(String(c.id), c);
        });
        return [...map.values()];
    })();

    const filteredProducts = products.filter((product) => {
        const matchesCategory = inCategory(product, selectedCategory);
        const matchesSearch =
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.code.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    /* ---------- keranjang ---------- */
    const addToCart = (product) => {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            if (existing.qty >= product.stock) {
                showToast('error', 'Stok barang tidak mencukupi!');
                return;
            }
            setCart(cart.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item)));
        } else {
            if (product.stock < 1) {
                showToast('error', 'Stok barang habis!');
                return;
            }
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setFlashId(product.id);
        setTimeout(() => setFlashId((cur) => (cur === product.id ? null : cur)), 700);
    };

    const updateQty = (id, amount) => {
        setCart(
            cart.map((item) => {
                if (item.id !== id) return item;
                const newQty = item.qty + amount;
                if (amount > 0 && newQty > item.stock) {
                    showToast('error', 'Stok barang tidak mencukupi!');
                    return item;
                }
                return newQty > 0 ? { ...item, qty: newQty } : item;
            })
        );
    };

    const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

    const clearCart = () => {
        setCart([]);
        setPayAmount(0);
        setSelectedDiscountId('');
    };

    /* ---------- hitung total ---------- */
    // Total kotor belanjaan
    const grossTotal = cart.reduce((sum, item) => sum + item.selling_price * item.qty, 0);

    // Cari objek diskon yang dipilih
    const activeDiscountObj = activeDiscounts.find((d) => String(d.id) === String(selectedDiscountId));

    // Hitung potongan diskon & pastikan minimal belanja tercapai
    let discountAmount = 0;
    if (activeDiscountObj && grossTotal >= parseFloat(activeDiscountObj.min_purchase)) {
        if (activeDiscountObj.type === 'percentage') {
            discountAmount = (grossTotal * parseFloat(activeDiscountObj.value)) / 100;
        } else {
            discountAmount = parseFloat(activeDiscountObj.value);
        }
    }

    // Total akhir setelah diskon
    const totalPrice = Math.max(0, grossTotal - discountAmount);
    const changeAmount = payAmount ? payAmount - totalPrice : 0;

    /* ---------- pembayaran ---------- */
    // Tambah nominal secara akumulatif saat tombol diklik
    const handleAddMoney = (amount) => setPayAmount((prev) => prev + amount);

    // Tombol Uang Pas
    const handleExactMoney = () => setPayAmount(totalPrice);

    // Reset nominal pembayaran
    const handleResetMoney = () => setPayAmount(0);

    // Pintasan keyboard: tombol "C" untuk reset uang diterima
    useEffect(() => {
        const onKey = (e) => {
            const tag = (e.target?.tagName || '').toLowerCase();
            if (['input', 'textarea', 'select'].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.toLowerCase() === 'c') setPayAmount(0);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showToast('error', 'Keranjang belanja masih kosong!');
            return;
        }
        if (payAmount < totalPrice) {
            showToast('error', 'Uang pembayaran masih kurang!');
            return;
        }

        // Validasi minimal belanja jika diskon dipilih
        if (activeDiscountObj && grossTotal < parseFloat(activeDiscountObj.min_purchase)) {
            showToast(
                'error',
                `Total belanja belum mencapai syarat minimal diskon (${activeDiscountObj.name}: Rp ${Number(
                    activeDiscountObj.min_purchase
                ).toLocaleString('id-ID')})`
            );
            return;
        }

        router.post(
            route('pos.checkout'),
            {
                cart: cart,
                total_pay: payAmount,
                discount_id: selectedDiscountId ? parseInt(selectedDiscountId) : null,
            },
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    showToast('success', 'Transaksi Berhasil!');
                    setCart([]);
                    setPayAmount(0);
                    setSelectedDiscountId('');
                },
                onError: (errors) => {
                    showToast('error', errors.message || 'Gagal memproses transaksi.');
                },
            }
        );
    };

    const cannotPay = cart.length === 0 || payAmount < totalPrice || processing;
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                        <IconCart />
                    </span>
                    <h2 className="font-extrabold text-xl text-[#14214f] tracking-tight leading-tight truncate">
                        SmartCash <span className="text-blue-600">- Kasir POS</span>
                    </h2>
                </div>
            }
        >
            <Head title="POS Kasir" />
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="fixed top-20 right-4 sm:right-6 z-[60]">
                    <div
                        key={toast.id}
                        className={`sc-toast flex items-start gap-3 max-w-sm rounded-2xl px-4 py-3 shadow-md border text-sm font-semibold ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10'
                                : 'bg-red-50 border-red-200 text-red-800 shadow-red-500/10'
                        }`}
                    >
                        <span
                            className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-white ${
                                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                        >
                            {toast.type === 'success' ? <IconCheck className="w-3 h-3" /> : <IconClose className="w-3 h-3" />}
                        </span>
                        <span className="leading-snug">{toast.message}</span>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            aria-label="Tutup"
                            className="ml-1 opacity-60 hover:opacity-100 transition"
                        >
                            <IconClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                {/* ===================== KATALOG PRODUK ===================== */}
                <div className="space-y-5 min-w-0">
                    {/* pencarian */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <IconSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari nama / kode barang..."
                            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm shadow-sm placeholder:text-slate-400 transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                aria-label="Hapus pencarian"
                                className="sc-pop absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition active:scale-90"
                            >
                                <IconClose className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* kategori */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-base font-extrabold text-[#14214f] mb-4">Kategori</h3>
                        <div className="sc-noscroll flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                            {[{ id: 'all', name: 'Semua' }, ...categoryList].map((cat) => {
                                const value = String(cat.id);
                                const active = selectedCategory === value;
                                const count = products.filter((p) => inCategory(p, value)).length;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedCategory(value)}
                                        aria-pressed={active}
                                        className={`group shrink-0 min-w-[96px] flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-semibold transition duration-200 active:scale-95 ${
                                            active
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <span className="transition-transform duration-200 group-hover:scale-110">
                                            {cat.id === 'all' ? <IconGrid /> : categoryIcon(cat.name)}
                                        </span>
                                        <span className="truncate max-w-[110px]">{cat.name}</span>
                                        <span className={`text-[10px] font-bold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* daftar produk */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-extrabold text-[#14214f]">Daftar Produk</h3>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                                {filteredProducts.length} produk
                            </span>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-14">
                                <div className="inline-block text-blue-200">
                                    <IconBox />
                                </div>
                                <p className="text-sm font-semibold text-slate-500 mt-3">Produk tidak ditemukan</p>
                                <p className="text-xs text-slate-400 mt-1">Coba kata kunci atau kategori lain.</p>
                                {(search || selectedCategory !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedCategory('all');
                                        }}
                                        className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition active:scale-95"
                                    >
                                        Reset pencarian
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((product, i) => {
                                    const soldOut = product.stock < 1;
                                    const flashing = flashId === product.id;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                                            className={`sc-rowin group relative bg-white rounded-2xl border p-2.5 cursor-pointer flex flex-col transition duration-300 ${
                                                soldOut
                                                    ? 'border-slate-100 opacity-60'
                                                    : 'border-slate-100 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70 active:scale-[.98]'
                                            }`}
                                        >
                                            <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-50">
                                                <ProductImage
                                                    product={product}
                                                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <span
                                                    className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                                                        soldOut
                                                            ? 'bg-red-500/90 text-white'
                                                            : product.stock <= 10
                                                            ? 'bg-amber-400/95 text-amber-950'
                                                            : 'bg-white/90 text-emerald-700'
                                                    }`}
                                                >
                                                    {soldOut ? 'Habis' : `Stok: ${product.stock}`}
                                                </span>
                                            </div>

                                            <div className="px-1 pt-2.5 flex-1">
                                                <span className="text-[10px] font-semibold text-slate-400 tracking-wide">{product.code}</span>
                                                <h3 className="font-bold text-slate-800 text-[13px] leading-snug truncate">{product.name}</h3>
                                                <p className="text-[11px] text-slate-400 truncate">{product.category?.name || 'Umum'}</p>
                                            </div>

                                            <div className="px-1 pt-2 flex items-center justify-between">
                                                <span className="font-extrabold text-[13px] text-blue-600">{rp(product.selling_price)}</span>
                                                <span
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition duration-200 ${
                                                        flashing ? 'bg-emerald-500 scale-110' : 'bg-blue-600 group-hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {flashing ? <IconCheck className="w-4 h-4 sc-pop" /> : <IconPlus />}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===================== KERANJANG & PEMBAYARAN ===================== */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] overflow-y-auto sc-thin">
                    {/* judul */}
                    <div className="flex items-center justify-between gap-3 pb-4 shrink-0">
                        <h3 className="flex items-center gap-2.5 text-base font-extrabold text-[#14214f]">
                            <span className="text-blue-600">
                                <IconCart className="w-6 h-6" />
                            </span>
                            Keranjang Belanja
                            <span
                                key={totalItems}
                                className="sc-pop min-w-[22px] h-[22px] px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center"
                            >
                                {cart.length}
                            </span>
                        </h3>
                        <button
                            type="button"
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-lg transition duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <IconTrash className="w-3.5 h-3.5" />
                            Hapus Semua
                        </button>
                    </div>

                    {/* item keranjang */}
                    <div className="sc-thin flex-1 min-h-[140px] max-h-[340px] lg:max-h-none overflow-y-auto pr-1 border-t border-slate-100">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="text-blue-200">
                                    <IconBasket />
                                </div>
                                <p className="text-sm font-semibold text-slate-500 mt-2">Keranjang masih kosong</p>
                                <p className="text-xs text-slate-400 mt-0.5">Klik produk untuk menambahkannya.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="sc-rowin group flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                                >
                                    <ProductImage
                                        product={item}
                                        textSize="text-lg"
                                        className="w-12 h-12 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                                        <span className="text-[11px] font-semibold text-blue-600">{rp(item.selling_price)}</span>
                                    </div>

                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => updateQty(item.id, -1)}
                                            aria-label="Kurangi jumlah"
                                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-l-xl transition active:scale-75"
                                        >
                                            <IconMinus />
                                        </button>
                                        <span key={item.qty} className="sc-pop w-6 text-center text-xs font-bold text-slate-800">
                                            {item.qty}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => updateQty(item.id, 1)}
                                            aria-label="Tambah jumlah"
                                            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-r-xl transition active:scale-75"
                                        >
                                            <IconPlus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Hapus dari keranjang"
                                            className="w-5 h-5 rounded-full text-slate-300 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition active:scale-75"
                                        >
                                            <IconClose className="w-3 h-3" />
                                        </button>
                                        <span className="text-[11px] font-bold text-slate-600">{rp(item.selling_price * item.qty)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* bagian bawah: diskon, rincian, nominal & bayar */}
                    <div className="border-t border-slate-100 pt-4 space-y-3.5 shrink-0">
                        {/* PILIH DISKON */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Promo / Diskon</label>
                            <select
                                className="w-full rounded-xl border-slate-200 bg-slate-50 text-xs py-2 px-3 transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                value={selectedDiscountId}
                                onChange={(e) => setSelectedDiscountId(e.target.value)}
                            >
                                <option value="">-- Tanpa Diskon --</option>
                                {activeDiscounts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name} ({d.type === 'percentage' ? `${d.value}%` : `Rp ${Number(d.value).toLocaleString('id-ID')}`})
                                    </option>
                                ))}
                            </select>
                            {activeDiscountObj && grossTotal < parseFloat(activeDiscountObj.min_purchase) && (
                                <p className="sc-pop text-[10px] text-red-500 font-semibold mt-1">
                                    * Min. belanja Rp {Number(activeDiscountObj.min_purchase).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>

                        {/* RINCIAN HARGA */}
                        <div className="text-xs space-y-2">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-700">{rp(grossTotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="sc-pop flex justify-between text-emerald-600 font-semibold">
                                    <span>Diskon ({activeDiscountObj?.name})</span>
                                    <span>- {rp(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end border-t border-dashed border-slate-200 pt-3">
                                <span className="text-sm font-extrabold text-[#14214f]">Total</span>
                                <span key={totalPrice} className="sc-pop text-xl font-extrabold text-blue-600 tracking-tight">
                                    {rp(totalPrice)}
                                </span>
                            </div>
                        </div>

                        {/* UANG DITERIMA */}
                        <div className="bg-blue-50 border border-blue-100 px-3.5 py-2.5 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="block text-[10px] text-slate-500 font-semibold">Uang Diterima</span>
                                <span key={payAmount} className="sc-pop inline-block text-base font-extrabold text-blue-700">
                                    {rp(payAmount)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetMoney}
                                className="text-[11px] bg-white border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-600 font-bold px-3 py-1.5 rounded-lg shadow-sm transition duration-200 active:scale-90"
                            >
                                Reset (C)
                            </button>
                        </div>

                        {/* PINTASAN NOMINAL UANG (AKUMULASI) & UANG PAS */}
                        <div>
                            <span className="block text-[10px] font-semibold text-slate-500 mb-1.5">Pintasan Tambah Nominal</span>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].map((nominal) => (
                                    <button
                                        key={nominal}
                                        type="button"
                                        onClick={() => handleAddMoney(nominal)}
                                        className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold py-2 rounded-xl transition duration-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-600/25 active:scale-90"
                                    >
                                        +{nominal >= 1000 ? `${nominal / 1000}rb` : nominal}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleExactMoney}
                                    disabled={cart.length === 0}
                                    className="bg-emerald-50 border border-emerald-300 text-emerald-700 text-[11px] font-extrabold py-2 rounded-xl transition duration-200 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/25 active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    Uang Pas
                                </button>
                            </div>
                        </div>

                        {/* KEMBALIAN */}
                        {payAmount > 0 && (
                            <div className="sc-pop flex justify-between items-center text-xs font-semibold px-1">
                                <span className="text-slate-500">Kembalian</span>
                                <span className={`text-sm font-extrabold ${changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {changeAmount < 0 ? `- ${rp(Math.abs(changeAmount))}` : rp(changeAmount)}
                                </span>
                            </div>
                        )}

                        {/* BAYAR */}
                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={cannotPay}
                            className={`group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-extrabold text-sm text-white bg-blue-600 transition duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[.98] disabled:bg-slate-300 disabled:translate-y-0 disabled:cursor-not-allowed`}
                        >
                            {processing ? (
                                <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                    <path d="M12 3a9 9 0 1 0 9 9" />
                                </svg>
                            ) : (
                                <IconCard />
                            )}
                            {processing ? 'Memproses...' : 'Bayar & Cetak Struk'}
                            {!processing && <IconChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}