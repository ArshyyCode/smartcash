import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
import { Head, useForm, router } from '@inertiajs/react';

/* ================================================================== */
/*  Kelola Diskon & Promo                                          */
/*  Letakkan di: resources/js/Pages/Discounts/Index.jsx               */
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
    nonaktif: { label: 'Nonaktif', cls: 'bg-slate-100 text-slate-600' },
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
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

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
    'w-full min-h-[44px] text-base sm:text-sm rounded-xl bg-white placeholder:text-slate-400 transition duration-150 focus:ring-4';
const okBorder = 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-100';
const errBorder = 'border-red-300 focus:border-red-500 focus:ring-red-100';

const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-colors duration-150 hover:bg-blue-700 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600';
const btnSecondary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold transition-colors duration-150 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50';
/* chip pilihan cepat (nilai potongan, durasi) */
const chipCls = (active) =>
    `inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border text-sm font-bold transition-colors duration-150 ${
        active
            ? 'bg-blue-600 border-blue-600 text-white active:brightness-90'
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50'
    }`;

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

/* Ringkasan: satu panel, kolom dipisah garis tipis (lebih ringan daripada empat kotak) */
const SummaryStrip = ({ items }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', slate: 'bg-slate-100 text-slate-600' };
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
            {items.map((it) => (
                <div key={it.label} className="flex items-center gap-3.5 bg-white p-4 sm:p-5">
                    <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tones[it.tone || 'blue']}`}>{it.icon}</span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600">{it.label}</p>
                        <p className="text-xl font-extrabold text-slate-900 leading-tight">{it.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* Tombol aksi berupa ikon (44 px); nama tetap terbaca lewat aria-label */
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

/* Saklar aktif / nonaktif: area sentuh 44 px, status juga tertulis di lencana sebelahnya */
const Switch = ({ checked, onChange, label, disabled = false }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-busy={disabled || undefined}
        disabled={disabled}
        onClick={onChange}
        className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <span className={`relative block h-6 w-11 rounded-full transition-colors duration-150 ${checked ? 'bg-blue-600' : 'bg-slate-400'}`}>
            <span
                className={`absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </span>
    </button>
);

const StatusBadge = ({ status }) => {
    const st = STATUS_STYLE[status];
    return <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>;
};

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

    /* ---------- aksi daftar ---------- */
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
    const filtersActive = Boolean(q) || statusFilter !== 'all';

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
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
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

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* RINGKASAN */}
                <SummaryStrip
                    items={[
                        { icon: <IconTag />, label: 'Total program', value: withStatus.length },
                        { icon: <IconPlay />, label: 'Sedang berlaku', value: count('berlaku'), tone: 'green' },
                        { icon: <IconClock />, label: 'Akan datang', value: count('akan') },
                        { icon: <IconPause />, label: 'Nonaktif / berakhir', value: count('nonaktif') + count('berakhir'), tone: 'slate' },
                    ]}
                />

                {/* PENCARIAN, AKSI, DAN FILTER STATUS */}
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
                                aria-label="Cari promo berdasarkan nama"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama promo..."
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

                        <button type="button" onClick={openAddModal} className={`${btnPrimary} shrink-0`}>
                            <IconPlus />
                            Buat Promo Baru
                        </button>
                    </div>

                    <div role="group" aria-label="Filter status promo" className="sc-noscroll flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                        {tabs.map((tab) => {
                            const active = statusFilter === tab.key;
                            return (
                                <button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)} aria-pressed={active} className={`shrink-0 gap-2 ${chipCls(active)}`}>
                                    {tab.label}
                                    <span className={`text-xs font-bold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.n}</span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                        <span className="text-blue-600 mt-0.5 shrink-0">
                            <IconInfo />
                        </span>
                        <span>
                            Hanya promo berstatus <b className="text-emerald-700">Berlaku</b> (aktif dan dalam masa berlaku) yang muncul di pilihan diskon halaman POS Kasir.
                        </span>
                    </p>
                </Panel>

                {/* DAFTAR PROMO */}
                <Panel className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900 text-base">Daftar Program Diskon</h3>
                        <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                            {filtersActive ? `${shown.length} dari ${discounts.length}` : discounts.length}
                        </span>
                    </div>

                    {shown.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <IconTag className="w-10 h-10" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">
                                {discounts.length === 0 ? 'Belum ada program diskon' : 'Promo tidak ditemukan'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                                {discounts.length === 0 ? 'Buat promo, atur masa berlaku, dan aktifkan kapan saja.' : 'Coba ubah filter atau kata kunci.'}
                            </p>
                            <div className="mt-4">
                                {discounts.length === 0 ? (
                                    <button type="button" onClick={openAddModal} className={btnPrimary}>
                                        <IconPlus />
                                        Buat promo pertama
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }}
                                        className={btnSecondary}
                                    >
                                        Reset filter
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabel (layar lebar) */}
                            <div className="hidden xl:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Daftar program diskon beserta masa berlaku dan status</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Nama promo</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Potongan</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Minimal belanja</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Masa berlaku</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shown.map((d, i) => (
                                            <tr
                                                key={d.id}
                                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                                className={`sc-rowin border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50 ${d._status === 'berakhir' ? 'opacity-75' : ''}`}
                                            >
                                                <td className="px-5 py-2.5 font-bold text-slate-800">{d.name}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="inline-block bg-blue-50 text-blue-700 font-extrabold text-sm px-2.5 py-1 rounded-lg">{discountLabel(d)}</span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-700">
                                                    {Number(d.min_purchase) > 0 ? rp(d.min_purchase) : <span className="text-slate-600">Tanpa minimal</span>}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <p className="text-slate-700 font-medium whitespace-nowrap">
                                                        {fmtDate(d.start_date)} &ndash; {fmtDate(d.end_date)}
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-0.5">{periodHint(d, d._status)}</p>
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <Switch
                                                            checked={Boolean(d.is_active)}
                                                            onChange={() => handleToggle(d)}
                                                            disabled={togglingId === d.id}
                                                            label={`${d.is_active ? 'Nonaktifkan' : 'Aktifkan'} promo ${d.name}`}
                                                        />
                                                        <StatusBadge status={d._status} />
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <RowAction label={`Ubah ${d.name}`} onClick={() => openEditModal(d)}>
                                                            <IconEdit className="w-[18px] h-[18px]" />
                                                        </RowAction>
                                                        <RowAction label={`Salin ${d.name} sebagai promo baru`} onClick={() => openDuplicateModal(d)}>
                                                            <IconCopy className="w-[18px] h-[18px]" />
                                                        </RowAction>
                                                        <RowAction label={`Hapus ${d.name}`} tone="danger" onClick={() => handleDelete(d)}>
                                                            <IconTrash className="w-[18px] h-[18px]" />
                                                        </RowAction>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP & tablet): enam kolom terlalu sempit di layar kecil */}
                            <ul role="list" className="xl:hidden divide-y divide-slate-100">
                                {shown.map((d, i) => (
                                    <li
                                        key={d.id}
                                        style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                                        className={`sc-rowin px-4 py-4 ${d._status === 'berakhir' ? 'opacity-75' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-bold text-sm text-slate-800 leading-snug">{d.name}</p>
                                            <span className="shrink-0 bg-blue-50 text-blue-700 font-extrabold text-sm px-2.5 py-1 rounded-lg">{discountLabel(d)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-2">
                                            {fmtDate(d.start_date)} &ndash; {fmtDate(d.end_date)}
                                            <span className="text-slate-600"> &middot; {periodHint(d, d._status)}</span>
                                        </p>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            {Number(d.min_purchase) > 0 ? `Minimal belanja ${rp(d.min_purchase)}` : 'Tanpa minimal belanja'}
                                        </p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <Switch
                                                checked={Boolean(d.is_active)}
                                                onChange={() => handleToggle(d)}
                                                disabled={togglingId === d.id}
                                                label={`${d.is_active ? 'Nonaktifkan' : 'Aktifkan'} promo ${d.name}`}
                                            />
                                            <StatusBadge status={d._status} />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <button type="button" onClick={() => openEditModal(d)} className={`${btnSecondary} !px-2 gap-1.5`}>
                                                <IconEdit className="w-4 h-4" />
                                                Ubah
                                            </button>
                                            <button type="button" onClick={() => openDuplicateModal(d)} className={`${btnSecondary} !px-2 gap-1.5`}>
                                                <IconCopy className="w-4 h-4" />
                                                Salin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(d)}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-bold transition-colors duration-150 hover:bg-red-50 active:bg-red-100"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT ================= */}
            {isModalOpen && (
                <DialogShell onClose={() => setIsModalOpen(false)} labelledBy="judul-modal-diskon" size="md">
                    <div className="flex justify-between items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-200">
                        <h3 id="judul-modal-diskon" className="text-base font-bold text-slate-900">
                            {editingDiscount ? 'Ubah Program Diskon' : 'Buat Program Diskon Baru'}
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

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
                            <Field id="disc-name" label="Nama promo" error={errors.name}>
                                <input
                                    id="disc-name"
                                    data-autofocus
                                    type="text"
                                    className={`${inputCls} ${errors.name ? errBorder : okBorder}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Diskon Grand Opening"
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? 'disc-name-error' : undefined}
                                    required
                                />
                            </Field>

                            {/* tipe potongan: dua pilihan */}
                            <div>
                                <p id="disc-type-label" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Tipe potongan
                                </p>
                                <div role="group" aria-labelledby="disc-type-label" className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                                    {[
                                        { v: 'percentage', l: 'Persentase (%)' },
                                        { v: 'fixed', l: 'Nominal (Rp)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.v}
                                            type="button"
                                            onClick={() => setData((prev) => ({ ...prev, type: opt.v, value: '' }))}
                                            aria-pressed={data.type === opt.v}
                                            className={`min-h-[44px] rounded-lg text-sm font-bold transition-colors duration-150 ${
                                                data.type === opt.v ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Field id="disc-value" label="Nilai potongan" error={errors.value}>
                                <div className="relative">
                                    {data.type === 'fixed' && (
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                                    )}
                                    <input
                                        id="disc-value"
                                        type="number"
                                        inputMode="numeric"
                                        className={`${inputCls} ${data.type === 'fixed' ? 'pl-10' : 'pr-10'} ${errors.value ? errBorder : okBorder}`}
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        placeholder={data.type === 'percentage' ? '10' : '5000'}
                                        min="0"
                                        max={data.type === 'percentage' ? 100 : undefined}
                                        aria-invalid={Boolean(errors.value)}
                                        aria-describedby={errors.value ? 'disc-value-error' : undefined}
                                        required
                                    />
                                    {data.type === 'percentage' && (
                                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">%</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {valuePresets.map((p) => (
                                        <button key={p} type="button" onClick={() => setData('value', String(p))} className={chipCls(String(data.value) === String(p))}>
                                            {data.type === 'percentage' ? `${p}%` : rp(p)}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field id="disc-min" label="Minimal belanja" error={errors.min_purchase} hint="Isi 0 jika tidak ada batas minimal.">
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                                    <input
                                        id="disc-min"
                                        type="number"
                                        inputMode="numeric"
                                        className={`${inputCls} pl-10 ${errors.min_purchase ? errBorder : okBorder}`}
                                        value={data.min_purchase}
                                        onChange={(e) => setData('min_purchase', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field id="disc-start" label="Tanggal mulai" error={errors.start_date}>
                                    <input
                                        id="disc-start"
                                        type="date"
                                        className={`${inputCls} ${errors.start_date ? errBorder : okBorder}`}
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field id="disc-end" label="Tanggal selesai" error={errors.end_date}>
                                    <input
                                        id="disc-end"
                                        type="date"
                                        className={`${inputCls} ${errors.end_date ? errBorder : okBorder}`}
                                        value={data.end_date}
                                        min={data.start_date || undefined}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        aria-invalid={Boolean(errors.end_date)}
                                        aria-describedby={errors.end_date ? 'disc-end-error' : undefined}
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="-mt-1">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Durasi cepat</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { d: 1, l: '1 hari' },
                                        { d: 7, l: '7 hari' },
                                        { d: 14, l: '14 hari' },
                                        { d: 30, l: '30 hari' },
                                    ].map((x) => (
                                        <button key={x.d} type="button" onClick={() => setDuration(x.d)} className={chipCls(false)}>
                                            {x.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* pratinjau */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5">
                                <p className="text-sm font-bold text-slate-700">Pratinjau potongan</p>
                                {data.value === '' ? (
                                    <p className="text-sm text-slate-600 mt-1">Isi nilai potongan untuk melihat contoh perhitungan.</p>
                                ) : (
                                    <div key={`${data.type}-${data.value}-${previewBase}`} aria-live="polite" className="sc-pop text-sm text-slate-600 mt-2 space-y-1.5">
                                        <div className="flex justify-between">
                                            <span>Belanja {Number(data.min_purchase) > 0 ? '(sesuai minimal)' : '(contoh)'}</span>
                                            <span className="font-semibold text-slate-800">{rp(previewBase)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-700 font-semibold">
                                            <span>Potongan</span>
                                            <span>- {rp(Math.round(previewCut))}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-dashed border-slate-300 pt-2 font-extrabold text-blue-700">
                                            <span>Total bayar</span>
                                            <span>{rp(Math.round(previewBase - previewCut))}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* saklar aktif */}
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 pl-4 pr-2 py-1.5">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Aktifkan promo ini sekarang</p>
                                    <p className="text-xs text-slate-600">Promo yang nonaktif tidak muncul di POS.</p>
                                </div>
                                <Switch checked={data.is_active} onChange={() => setData('is_active', !data.is_active)} label="Aktifkan promo" />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button type="button" onClick={() => setIsModalOpen(false)} className={btnSecondary}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing} aria-busy={processing} className={btnPrimary}>
                                {processing && <Spinner />}
                                {processing ? 'Menyimpan...' : editingDiscount ? 'Perbarui Promo' : 'Simpan Promo'}
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