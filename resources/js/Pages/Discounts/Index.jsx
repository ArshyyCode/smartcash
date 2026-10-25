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
.sc-noscroll::-webkit-scrollbar { display: none }
.sc-noscroll { scrollbar-width: none }
@media (prefers-reduced-motion: reduce) {
    .sc-rowin, .sc-pop, .sc-toast, .sc-fade { animation: none !important }
}
`;

/* ================================================================== */
/*  HELPER TANGGAL & FORMAT                                            */
/* ================================================================== */
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

// terima "2026-10-18" maupun "2026-10-18T00:00:00.000000Z", hasilnya selalu "YYYY-MM-DD"
const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

const parseDate = (v) => {
    const [y, m, d] = toDateInput(v).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
};

const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const fmtDate = (v) => parseDate(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const startOfToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
};

const diffDays = (a, b) => Math.round((a - b) / 86400000);

/*  Status promo (sama dengan aturan di halaman POS: aktif + dalam masa berlaku)
 *  berakhir  : tanggal selesai sudah lewat
 *  nonaktif  : dimatikan manual
 *  akan      : belum mulai
 *  berlaku   : sedang berjalan                                                  */
const getStatus = (d) => {
    const today = startOfToday();
    if (diffDays(parseDate(d.end_date), today) < 0) return 'berakhir';
    if (!d.is_active) return 'nonaktif';
    if (diffDays(parseDate(d.start_date), today) > 0) return 'akan';
    return 'berlaku';
};

const STATUS_STYLE = {
    berlaku: { label: 'Berlaku', cls: 'bg-emerald-100 text-emerald-700' },
    akan: { label: 'Akan Datang', cls: 'bg-blue-100 text-blue-700' },
    nonaktif: { label: 'Nonaktif', cls: 'bg-slate-100 text-slate-500' },
    berakhir: { label: 'Berakhir', cls: 'bg-red-100 text-red-700' },
};

const periodHint = (d, status) => {
    const today = startOfToday();
    if (status === 'berlaku' || status === 'nonaktif') {
        const left = diffDays(parseDate(d.end_date), today);
        if (left === 0) return 'Berakhir hari ini';
        if (left > 0) return `Sisa ${left} hari`;
    }
    if (status === 'akan') {
        const until = diffDays(parseDate(d.start_date), today);
        return `Mulai ${until} hari lagi`;
    }
    if (status === 'berakhir') return 'Masa berlaku habis';
    return '';
};

const discountLabel = (d) => (d.type === 'percentage' ? `${Number(d.value)}%` : rp(d.value));

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconTag = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7a1.5 1.5 0 0 1 1.1.4l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-7.7 7.7a1.5 1.5 0 0 1-2.1 0l-7.3-7.3a1.5 1.5 0 0 1-.5-1Z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
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
const IconCopy = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="9" y="9" width="11" height="11" rx="2.5" />
        <path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15" />
    </svg>
);
const IconTrash = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V4.5h6V7" />
    </svg>
);
const IconPlay = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8.5 5 3.5-5 3.5v-7Z" fill="currentColor" />
    </svg>
);
const IconClock = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);
const IconPause = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9v6M14 9v6" />
    </svg>
);
const IconInfo = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.1" />
    </svg>
);

/* ================================================================== */
/*  KOMPONEN KECIL                                                     */
/* ================================================================== */
const inputCls =
    'w-full text-sm rounded-xl border-slate-200 bg-white placeholder:text-slate-400 transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Field = ({ label, error, hint, children }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
        {children}
        {hint && !error && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
        {error && <p className="sc-pop text-red-500 text-[11px] font-semibold mt-1">{error}</p>}
    </div>
);

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const StatChip = ({ icon, label, value, tone = 'blue' }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-emerald-50 text-emerald-600',
        slate: 'bg-slate-100 text-slate-600',
        red: 'bg-red-50 text-red-600',
    };
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

/* Saklar aktif / nonaktif */
const Switch = ({ checked, onChange, label, disabled = false }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 ${
            checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
    >
        <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                checked ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
        />
    </button>
);

/* ================================================================== */
/*  HALAMAN KELOLA DISKON                                              */
/* ================================================================== */
export default function Index({ auth, discounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const { data, setData, post, put, reset, errors, setError, clearErrors, processing } = useForm({
        name: '',
        type: 'percentage',
        value: '',
        min_purchase: '0',
        start_date: '',
        end_date: '',
        is_active: true,
    });

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            setConfirmState(null);
            setIsModalOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    /* ---------- modal ---------- */
    const openAddModal = () => {
        setEditingDiscount(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const fillForm = (discount, nameOverride) => {
        setData({
            name: nameOverride ?? (discount.name || ''),
            type: discount.type || 'percentage',
            value: discount.value !== undefined && discount.value !== null ? String(Number(discount.value)) : '',
            min_purchase: String(Number(discount.min_purchase || 0)),
            start_date: toDateInput(discount.start_date),
            end_date: toDateInput(discount.end_date),
            is_active: Boolean(discount.is_active),
        });
        clearErrors();
    };

    const openEditModal = (discount) => {
        setEditingDiscount(discount);
        fillForm(discount);
        setIsModalOpen(true);
    };

    // salin promo yang ada sebagai promo baru
    const openDuplicateModal = (discount) => {
        setEditingDiscount(null);
        fillForm(discount, `${discount.name} (Salinan)`);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        if (data.type === 'percentage' && Number(data.value) > 100) {
            setError('value', 'Persentase tidak boleh lebih dari 100%.');
            return;
        }
        if (data.start_date && data.end_date && data.end_date < data.start_date) {
            setError('end_date', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                showToast('success', editingDiscount ? 'Promo berhasil diperbarui!' : 'Promo baru berhasil dibuat!');
            },
        };

        if (editingDiscount) {
            put(route('discounts.update', editingDiscount.id), options);
        } else {
            post(route('discounts.store'), options);
        }
    };

    // atur masa berlaku dengan cepat: mulai (atau hari ini) sampai N hari
    const setDuration = (days) => {
        const start = data.start_date ? parseDate(data.start_date) : startOfToday();
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);
        setData((prev) => ({ ...prev, start_date: formatDateInput(start), end_date: formatDateInput(end) }));
    };

    /* ---------- aksi tabel ---------- */
    const handleToggle = (d) => {
        setTogglingId(d.id);
        router.patch(
            route('discounts.toggle', d.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => showToast('success', `Promo "${d.name}" ${d.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`),
                onError: () => showToast('error', 'Gagal mengubah status promo.'),
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const handleDelete = (d) => {
        setConfirmState({
            title: 'Hapus program diskon ini?',
            message: `Promo "${d.name}" akan dihapus dan tidak dapat dikembalikan.`,
            confirmLabel: 'Ya, hapus',
            onConfirm: () =>
                router.delete(route('discounts.destroy', d.id), {
                    preserveScroll: true,
                    onSuccess: () => showToast('success', 'Promo berhasil dihapus.'),
                }),
        });
    };

    /* ---------- data turunan ---------- */
    const withStatus = discounts.map((d) => ({ ...d, _status: getStatus(d) }));
    const count = (key) => withStatus.filter((d) => d._status === key).length;

    const q = search.trim().toLowerCase();
    const shown = withStatus.filter((d) => (statusFilter === 'all' || d._status === statusFilter) && (!q || d.name.toLowerCase().includes(q)));

    const tabs = [
        { key: 'all', label: 'Semua', n: withStatus.length },
        { key: 'berlaku', label: 'Berlaku', n: count('berlaku') },
        { key: 'akan', label: 'Akan Datang', n: count('akan') },
        { key: 'nonaktif', label: 'Nonaktif', n: count('nonaktif') },
        { key: 'berakhir', label: 'Berakhir', n: count('berakhir') },
    ];

    /* ---------- pratinjau potongan di form ---------- */
    const previewBase = Math.max(Number(data.min_purchase) || 0, 100000);
    const previewCut =
        data.value === ''
            ? 0
            : data.type === 'percentage'
            ? Math.min(previewBase, (previewBase * Number(data.value)) / 100)
            : Math.min(previewBase, Number(data.value));

    const valuePresets = data.type === 'percentage' ? [5, 10, 15, 20, 25] : [2000, 5000, 10000, 20000];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <IconTag />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Kelola <span className="text-blue-600">Diskon &amp; Promo</span>
                    </h2>
                </div>
            }
        >
            <Head title="Kelola Diskon" />
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
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatChip icon={<IconTag />} label="Total Program" value={withStatus.length} />
                    <StatChip icon={<IconPlay />} label="Sedang Berlaku" value={count('berlaku')} tone="green" />
                    <StatChip icon={<IconClock />} label="Akan Datang" value={count('akan')} />
                    <StatChip icon={<IconPause />} label="Nonaktif / Berakhir" value={count('nonaktif') + count('berakhir')} tone="slate" />
                </div>

                {/* TOOLBAR */}
                <Panel className="p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Daftar Program Diskon ({discounts.length})</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Buat promo, atur masa berlaku, dan aktifkan kapan saja.</p>
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
                                    placeholder="Cari nama promo..."
                                    className={`${inputCls} text-xs pl-9 pr-9 py-2.5`}
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
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-200 hover:-translate-y-0.5 active:scale-95"
                            >
                                <IconPlus />
                                Buat Promo Baru
                            </button>
                        </div>
                    </div>

                    <div className="sc-noscroll flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const active = statusFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.key)}
                                    aria-pressed={active}
                                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition duration-200 active:scale-95 ${
                                        active
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {tab.n}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
                        <span className="text-blue-600 mt-0.5">
                            <IconInfo />
                        </span>
                        <p className="leading-relaxed">
                            Hanya promo berstatus <b className="text-emerald-700">Berlaku</b> (aktif dan dalam masa berlaku) yang muncul di pilihan diskon halaman POS Kasir.
                        </p>
                    </div>
                </Panel>

                {/* TABEL */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Nama Promo</th>
                                    <th className="px-5 py-3.5 font-semibold">Potongan</th>
                                    <th className="px-5 py-3.5 font-semibold">Min. Belanja</th>
                                    <th className="px-5 py-3.5 font-semibold">Masa Berlaku</th>
                                    <th className="px-5 py-3.5 font-semibold">Status</th>
                                    <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-14 text-center">
                                            <span className="text-slate-300 inline-block">
                                                <IconTag className="w-10 h-10" />
                                            </span>
                                            <p className="text-slate-400 text-xs mt-2">
                                                {discounts.length === 0 ? 'Belum ada program diskon.' : 'Tidak ada promo yang cocok dengan filter atau pencarian.'}
                                            </p>
                                            {discounts.length === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={openAddModal}
                                                    className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition active:scale-95"
                                                >
                                                    Buat promo pertama
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    shown.map((d, i) => {
                                        const st = STATUS_STYLE[d._status];
                                        const expired = d._status === 'berakhir';
                                        return (
                                            <tr
                                                key={d.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className={`sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50 ${expired ? 'opacity-70' : ''}`}
                                            >
                                                <td className="px-5 py-4 font-bold text-slate-800">{d.name}</td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-block bg-blue-50 text-blue-700 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                                                        {discountLabel(d)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-700 text-xs">
                                                    {Number(d.min_purchase) > 0 ? rp(d.min_purchase) : <span className="text-slate-400">Tanpa minimal</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-xs text-slate-700 font-medium whitespace-nowrap">
                                                        {fmtDate(d.start_date)} &ndash; {fmtDate(d.end_date)}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{periodHint(d, d._status)}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={Boolean(d.is_active)}
                                                            onChange={() => handleToggle(d)}
                                                            disabled={togglingId === d.id}
                                                            label={`${d.is_active ? 'Nonaktifkan' : 'Aktifkan'} promo ${d.name}`}
                                                        />
                                                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(d)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-95"
                                                        >
                                                            <IconEdit />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openDuplicateModal(d)}
                                                            title="Salin sebagai promo baru"
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-800 hover:border-slate-800 hover:text-white transition duration-200 active:scale-95"
                                                        >
                                                            <IconCopy />
                                                            Salin
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(d)}
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
            {isModalOpen && (
                <div onClick={() => setIsModalOpen(false)} className="sc-fade fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-center p-4">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="sc-pop bg-white p-6 rounded-2xl w-full max-w-md space-y-4 max-h-[92vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingDiscount ? 'Edit Program Diskon' : 'Buat Program Diskon Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Tutup"
                                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                            >
                                <IconClose />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Nama Promo / Diskon" error={errors.name}>
                                <input
                                    type="text"
                                    className={`${inputCls} py-2.5`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Diskon Grand Opening"
                                    required
                                />
                            </Field>

                            {/* tipe potongan: tombol pilihan */}
                            <Field label="Tipe Potongan">
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                                    {[
                                        { v: 'percentage', l: 'Persentase (%)' },
                                        { v: 'fixed', l: 'Nominal (Rp)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.v}
                                            type="button"
                                            onClick={() => setData((prev) => ({ ...prev, type: opt.v, value: '' }))}
                                            aria-pressed={data.type === opt.v}
                                            className={`py-2 rounded-lg text-xs font-bold transition duration-200 active:scale-95 ${
                                                data.type === opt.v ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Nilai Potongan" error={errors.value}>
                                <input
                                    type="number"
                                    className={`${inputCls} py-2.5`}
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    placeholder={data.type === 'percentage' ? '10 (%)' : '5000 (Rp)'}
                                    min="0"
                                    max={data.type === 'percentage' ? 100 : undefined}
                                    required
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {valuePresets.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setData('value', String(p))}
                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition duration-150 active:scale-95 ${
                                                String(data.value) === String(p)
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {data.type === 'percentage' ? `${p}%` : rp(p)}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Minimal Belanja (Rp)" error={errors.min_purchase} hint="Isi 0 jika tidak ada batas minimal.">
                                <input
                                    type="number"
                                    className={`${inputCls} py-2.5`}
                                    value={data.min_purchase}
                                    onChange={(e) => setData('min_purchase', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Tanggal Mulai" error={errors.start_date}>
                                    <input
                                        type="date"
                                        className={`${inputCls} py-2.5`}
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field label="Tanggal Selesai" error={errors.end_date}>
                                    <input
                                        type="date"
                                        className={`${inputCls} py-2.5`}
                                        value={data.end_date}
                                        min={data.start_date || undefined}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                                <span className="text-[11px] font-semibold text-slate-500 mr-1">Durasi cepat:</span>
                                {[
                                    { d: 1, l: '1 hari' },
                                    { d: 7, l: '7 hari' },
                                    { d: 14, l: '14 hari' },
                                    { d: 30, l: '30 hari' },
                                ].map((x) => (
                                    <button
                                        key={x.d}
                                        type="button"
                                        onClick={() => setDuration(x.d)}
                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition duration-150 active:scale-95"
                                    >
                                        {x.l}
                                    </button>
                                ))}
                            </div>

                            {/* pratinjau */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pratinjau Potongan</p>
                                {data.value === '' ? (
                                    <p className="text-xs text-slate-400 mt-1">Isi nilai potongan untuk melihat contoh perhitungan.</p>
                                ) : (
                                    <div key={`${data.type}-${data.value}-${previewBase}`} className="sc-pop text-xs text-slate-600 mt-1.5 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Belanja {Number(data.min_purchase) > 0 ? '(sesuai minimal)' : '(contoh)'}</span>
                                            <span className="font-semibold text-slate-800">{rp(previewBase)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 font-semibold">
                                            <span>Potongan</span>
                                            <span>- {rp(Math.round(previewCut))}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-dashed border-slate-300 pt-1.5 font-extrabold text-blue-700">
                                            <span>Total bayar</span>
                                            <span>{rp(Math.round(previewBase - previewCut))}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* saklar aktif */}
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Aktifkan promo ini sekarang</p>
                                    <p className="text-[11px] text-slate-400">Promo yang nonaktif tidak muncul di POS.</p>
                                </div>
                                <Switch checked={data.is_active} onChange={() => setData('is_active', !data.is_active)} label="Aktifkan promo" />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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
                                    {processing ? 'Menyimpan...' : editingDiscount ? 'Update Promo' : 'Simpan Promo'}
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