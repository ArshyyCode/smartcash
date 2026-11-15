import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DialogShell from '@/Components/DialogShell';
import Toast from '@/Components/Toast';
import { Head, useForm, router } from '@inertiajs/react';

/* ================================================================== */
/*  Manajemen User & Hak Akses                                         */
/*  Letakkan di: resources/js/Pages/Users/Index.jsx                    */
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
// Admin selalu di atas, lalu kasir, lalu role lain. Di dalam role diurutkan nama A-Z.
const ROLE_RANK = { admin: 0, kasir: 1 };
const rankOf = (role) => (role in ROLE_RANK ? ROLE_RANK[role] : 2);

const sortUsers = (list) =>
    [...list].sort((a, b) => rankOf(a.role) - rankOf(b.role) || String(a.name).localeCompare(String(b.name), 'id'));

const ROLE_META = {
    admin: { label: 'Admin', badge: 'bg-blue-100 text-blue-700', avatar: 'bg-blue-600' },
    kasir: { label: 'Kasir', badge: 'bg-emerald-100 text-emerald-700', avatar: 'bg-slate-700' },
};
const roleMeta = (role) => ROLE_META[role] || { label: String(role || '-'), badge: 'bg-slate-100 text-slate-600', avatar: 'bg-slate-500' };

const randomPassword = (length = 10) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let out = '';
    const arr = new Uint32Array(length);
    (window.crypto || window.msCrypto).getRandomValues(arr);
    arr.forEach((n) => (out += chars[n % chars.length]));
    return out;
};

const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
    if (pw.length < 6) score = Math.min(score, 1);
    const levels = [
        { label: 'Sangat lemah', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Lemah', bar: 'bg-red-500', text: 'text-red-500', w: 'w-1/4' },
        { label: 'Sedang', bar: 'bg-amber-400', text: 'text-amber-600', w: 'w-2/4' },
        { label: 'Kuat', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-3/4' },
        { label: 'Sangat kuat', bar: 'bg-emerald-500', text: 'text-emerald-600', w: 'w-full' },
    ];
    return levels[score];
};

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const IconUsers = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.3c1.8.8 3 2.6 3 5.2" />
    </svg>
);
const IconShield = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
);
const IconCart = ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 4h2.2l2.2 11h10.2l2-8H6.2" />
        <circle cx="9" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
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
const IconEye = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const IconEyeOff = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.6A9.5 9.5 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 4M6.5 7.2A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
);
const IconDice = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <rect x="4" y="4" width="16" height="16" rx="3.5" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
        <circle cx="9" cy="15" r="1" fill="currentColor" />
    </svg>
);
const IconAlert = ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" className={className} {...ip}>
        <path d="M12 3.5 2.8 19.5a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3.5Z" />
        <path d="M12 10v4.5M12 17.5v.1" />
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
const textBtn =
    'inline-flex items-center gap-1.5 min-h-[44px] px-1 text-sm font-bold text-blue-600 transition-colors duration-150 hover:text-blue-800 active:opacity-70';
const chipCls = (active) =>
    `shrink-0 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors duration-150 ${
        active
            ? 'bg-blue-600 border-blue-600 text-white active:brightness-90'
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 active:bg-blue-50'
    }`;

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
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

const Spinner = () => (
    <svg viewBox="0 0 24 24" className="sc-spin w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

/* Ringkasan: satu panel, tiga kolom (lebih ringan daripada tiga kotak terpisah) */
const SummaryStrip = ({ items }) => {
    const tones = { blue: 'bg-blue-50 text-blue-600', slate: 'bg-slate-100 text-slate-600', green: 'bg-emerald-50 text-emerald-600' };
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

const Avatar = ({ user, size = 'w-10 h-10 text-sm' }) => (
    <span aria-hidden="true" className={`${size} ${roleMeta(user.role).avatar} shrink-0 rounded-full text-white font-bold flex items-center justify-center`}>
        {(user.name || '?').charAt(0).toUpperCase()}
    </span>
);

const RoleBadge = ({ role }) => (
    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${roleMeta(role).badge}`}>{roleMeta(role).label}</span>
);

const MeBadge = () => <span className="inline-block mt-0.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Akun Anda</span>;

/* Judul kelompok role (Admin / Kasir) */
const GroupLabel = ({ group }) => (
    <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
        <span className={group.role === 'admin' ? 'text-blue-600' : 'text-emerald-700'}>
            {group.role === 'admin' ? <IconShield className="w-4 h-4" /> : <IconCart className="w-4 h-4" />}
        </span>
        {roleMeta(group.role).label}
        <span className="font-semibold text-slate-600">&middot; {group.items.length} pengguna</span>
    </span>
);

/* ================================================================== */
/*  HALAMAN KELOLA USER                                                */
/* ================================================================== */
export default function Index({ auth, users = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');

    const [toast, setToast] = useState(null);
    const [confirmState, setConfirmState] = useState(null);

    const { data, setData, post, put, reset, clearErrors, errors, processing } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'kasir',
    });

    const showToast = (type, message) => setToast({ type, message, id: Date.now() });

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setShowPassword(false);
        reset();
        clearErrors();
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setShowPassword(false);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setShowPassword(false);
        setData({
            name: user.name,
            username: user.username || '',
            email: user.email,
            password: '',
            role: user.role,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                showToast('success', isEditing ? 'Data user berhasil diperbarui!' : 'User baru berhasil ditambahkan!');
                closeModal();
            },
        };
        if (isEditing) {
            put(route('users.update', editId), options);
        } else {
            post(route('users.store'), options);
        }
    };

    const handleDelete = (user) => {
        setConfirmState({
            title: 'Hapus user ini?',
            message: `Akun "${user.name}" (@${user.username || user.email}) akan dihapus dan tidak dapat mengakses aplikasi lagi.`,
            confirmLabel: 'Ya, hapus',
            onConfirm: () =>
                router.delete(route('users.destroy', user.id), {
                    preserveScroll: true,
                    onSuccess: () => showToast('success', 'User berhasil dihapus.'),
                    onError: (errs) => showToast('error', errs.message || 'Gagal menghapus user.'),
                }),
        });
    };

    /* ---------- data turunan ---------- */
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const kasirCount = users.filter((u) => u.role === 'kasir').length;

    const q = search.trim().toLowerCase();
    const shown = sortUsers(users).filter(
        (u) =>
            (roleFilter === 'all' || u.role === roleFilter) &&
            (!q || String(u.name).toLowerCase().includes(q) || String(u.username || '').toLowerCase().includes(q) || String(u.email).toLowerCase().includes(q))
    );

    // kelompokkan per role (admin dulu, lalu kasir)
    const groups = [];
    shown.forEach((u) => {
        let g = groups.find((x) => x.role === u.role);
        if (!g) {
            g = { role: u.role, items: [] };
            groups.push(g);
        }
        g.items.push(u);
    });

    const tabs = [
        { key: 'all', label: 'Semua', n: users.length },
        { key: 'admin', label: 'Admin', n: adminCount },
        { key: 'kasir', label: 'Kasir', n: kasirCount },
    ];

    const editingSelf = isEditing && editId === auth.user.id;
    const strength = passwordStrength(data.password);
    const filtersActive = Boolean(q) || roleFilter !== 'all';

    let rowIndex = 0; // jeda animasi baris tabel
    let cardIndex = 0; // jeda animasi kartu (HP)

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
                        <IconUsers />
                    </span>
                    <h2 className="font-extrabold text-xl text-slate-900 tracking-tight leading-tight truncate">
                        Manajemen <span className="text-blue-600">User &amp; Hak Akses</span>
                    </h2>
                </div>
            }
        >
            <Head title="Kelola User" />
            <style>{css}</style>

            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* RINGKASAN */}
                <SummaryStrip
                    items={[
                        { icon: <IconUsers />, label: 'Total pengguna', value: users.length },
                        { icon: <IconShield />, label: 'Admin', value: adminCount },
                        { icon: <IconCart />, label: 'Kasir', value: kasirCount, tone: 'green' },
                    ]}
                />

                {/* PENCARIAN, AKSI, DAN FILTER ROLE */}
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
                                aria-label="Cari pengguna berdasarkan nama, username, atau email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, username, email..."
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
                            Tambah User Baru
                        </button>
                    </div>

                    <div role="group" aria-label="Filter role" className="sc-noscroll flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                        {tabs.map((tab) => {
                            const active = roleFilter === tab.key;
                            return (
                                <button key={tab.key} type="button" onClick={() => setRoleFilter(tab.key)} aria-pressed={active} className={chipCls(active)}>
                                    {tab.label}
                                    <span className={`text-xs font-bold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{tab.n}</span>
                                </button>
                            );
                        })}
                    </div>
                </Panel>

                {/* DAFTAR USER (ADMIN DI ATAS, LALU KASIR) */}
                <Panel className="overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-900 text-base">Daftar Pengguna Aplikasi</h3>
                        <span role="status" className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                            {filtersActive ? `${shown.length} dari ${users.length}` : users.length}
                        </span>
                    </div>

                    {shown.length === 0 ? (
                        <div className="px-5 py-14 text-center">
                            <span className="text-slate-400 inline-block">
                                <IconUsers className="w-10 h-10" />
                            </span>
                            <p className="text-sm font-semibold text-slate-700 mt-3">{users.length === 0 ? 'Belum ada data user' : 'User tidak ditemukan'}</p>
                            <p className="text-sm text-slate-600 mt-1">{users.length === 0 ? 'Tambahkan admin atau kasir pertama Anda.' : 'Coba ubah filter atau kata kunci.'}</p>
                            <div className="mt-4">
                                {users.length === 0 ? (
                                    <button type="button" onClick={openAddModal} className={btnPrimary}>
                                        <IconPlus />
                                        Tambah User Baru
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setRoleFilter('all');
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
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Daftar pengguna, admin di atas lalu kasir</caption>
                                    <thead className="bg-slate-50 text-slate-600 text-xs">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 font-semibold">Pengguna</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Username &amp; email</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groups.map((group) => (
                                            <React.Fragment key={group.role}>
                                                {roleFilter === 'all' && (
                                                    <tr className="bg-slate-50 border-t border-slate-100">
                                                        <th scope="colgroup" colSpan="4" className="px-5 py-2 text-left font-normal">
                                                            <GroupLabel group={group} />
                                                        </th>
                                                    </tr>
                                                )}
                                                {group.items.map((u) => {
                                                    const isMe = auth.user.id === u.id;
                                                    const delay = Math.min(rowIndex++, 12) * 30;
                                                    return (
                                                        <tr
                                                            key={u.id}
                                                            style={{ animationDelay: `${delay}ms` }}
                                                            className="sc-rowin border-t border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                                                        >
                                                            <td className="px-5 py-2.5">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar user={u} />
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-slate-800 truncate max-w-[220px]">{u.name}</p>
                                                                        {isMe && <MeBadge />}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <p className="font-semibold text-slate-700">@{u.username || '-'}</p>
                                                                <p className="text-xs text-slate-600">{u.email}</p>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <RoleBadge role={u.role} />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <RowAction label={`Ubah ${u.name}`} onClick={() => handleEdit(u)}>
                                                                        <IconEdit className="w-[18px] h-[18px]" />
                                                                    </RowAction>
                                                                    {!isMe && (
                                                                        <RowAction label={`Hapus ${u.name}`} tone="danger" onClick={() => handleDelete(u)}>
                                                                            <IconTrash className="w-[18px] h-[18px]" />
                                                                        </RowAction>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kartu (HP & tablet): tidak perlu menggeser tabel ke samping */}
                            <div className="lg:hidden">
                                {groups.map((group) => (
                                    <section key={group.role} aria-label={`${roleMeta(group.role).label}, ${group.items.length} pengguna`}>
                                        {roleFilter === 'all' && (
                                            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
                                                <GroupLabel group={group} />
                                            </div>
                                        )}
                                        <ul role="list" className="divide-y divide-slate-100 border-t border-slate-100">
                                            {group.items.map((u) => {
                                                const isMe = auth.user.id === u.id;
                                                return (
                                                    <li key={u.id} style={{ animationDelay: `${Math.min(cardIndex++, 12) * 30}ms` }} className="sc-rowin flex items-start gap-3 pl-4 pr-2 py-3">
                                                        <Avatar user={u} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-sm text-slate-800 leading-snug">{u.name}</p>
                                                            <p className="text-xs font-semibold text-slate-700 mt-0.5">@{u.username || '-'}</p>
                                                            <p className="text-xs text-slate-600 break-all">{u.email}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                <RoleBadge role={u.role} />
                                                                {isMe && <MeBadge />}
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0">
                                                            <RowAction label={`Ubah ${u.name}`} onClick={() => handleEdit(u)}>
                                                                <IconEdit className="w-[18px] h-[18px]" />
                                                            </RowAction>
                                                            {!isMe && (
                                                                <RowAction label={`Hapus ${u.name}`} tone="danger" onClick={() => handleDelete(u)}>
                                                                    <IconTrash className="w-[18px] h-[18px]" />
                                                                </RowAction>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </>
                    )}
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT USER ================= */}
            {isModalOpen && (
                <DialogShell onClose={closeModal} labelledBy="judul-modal-user" size="md">
                    <div className="flex justify-between items-center gap-3 px-5 sm:px-6 py-4 border-b border-slate-200">
                        <h3 id="judul-modal-user" className="text-base font-bold text-slate-900">
                            {isEditing ? 'Ubah Data User' : 'Tambah User Baru'}
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
                            <Field id="user-name" label="Nama lengkap" error={errors.name}>
                                <input
                                    id="user-name"
                                    data-autofocus
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`${inputCls} ${errors.name ? errBorder : okBorder}`}
                                    placeholder="Masukkan nama pengguna"
                                    autoComplete="off"
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={errors.name ? 'user-name-error' : undefined}
                                    required
                                />
                            </Field>

                            <Field id="user-username" label="Username" error={errors.username} hint="Dipakai untuk masuk. Gunakan huruf kecil tanpa spasi.">
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">@</span>
                                    <input
                                        id="user-username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className={`${inputCls} pl-8 ${errors.username ? errBorder : okBorder}`}
                                        placeholder="kasir1"
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        aria-invalid={Boolean(errors.username)}
                                        aria-describedby={errors.username ? 'user-username-error' : undefined}
                                        required
                                    />
                                </div>
                            </Field>

                            <Field id="user-email" label="Email" error={errors.email}>
                                <input
                                    id="user-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`${inputCls} ${errors.email ? errBorder : okBorder}`}
                                    placeholder="email@domain.com"
                                    autoComplete="off"
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'user-email-error' : undefined}
                                    required
                                />
                            </Field>

                            <Field
                                id="user-password"
                                label={isEditing ? 'Kata sandi (kosongkan jika tidak diubah)' : 'Kata sandi'}
                                error={errors.password}
                                right={
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('password', randomPassword());
                                            setShowPassword(true);
                                        }}
                                        className={textBtn}
                                    >
                                        <IconDice className="w-4 h-4" />
                                        Buat acak
                                    </button>
                                }
                            >
                                <div className="relative">
                                    <input
                                        id="user-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`${inputCls} pr-14 ${errors.password ? errBorder : okBorder}`}
                                        placeholder="Minimal 8 karakter"
                                        autoComplete="new-password"
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? 'user-password-error' : undefined}
                                        required={!isEditing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                        aria-pressed={showPassword}
                                        className="absolute right-0.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                                    >
                                        {showPassword ? <IconEyeOff /> : <IconEye />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="sc-pop mt-2.5">
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" role="presentation">
                                            <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.w}`} />
                                        </div>
                                        <p aria-live="polite" className={`text-xs font-semibold mt-1.5 ${strength.text}`}>
                                            Kekuatan kata sandi: {strength.label}
                                        </p>
                                    </div>
                                )}
                            </Field>

                            {/* role sebagai pilihan kartu */}
                            <div>
                                <p id="user-role-label" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Role / hak akses
                                </p>
                                <div role="radiogroup" aria-labelledby="user-role-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {[
                                        { v: 'kasir', title: 'Kasir', desc: 'Akses POS dan transaksi penjualan.', icon: <IconCart /> },
                                        { v: 'admin', title: 'Admin', desc: 'Akses penuh: produk, laporan, dan staf.', icon: <IconShield /> },
                                    ].map((opt) => {
                                        const active = data.role === opt.v;
                                        return (
                                            <button
                                                key={opt.v}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                disabled={editingSelf}
                                                onClick={() => setData('role', opt.v)}
                                                className={`relative text-left rounded-xl border p-3.5 min-h-[44px] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    active ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300 active:bg-blue-50'
                                                }`}
                                            >
                                                <span className={`flex items-center gap-2 text-sm font-bold ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {opt.icon}
                                                    {opt.title}
                                                </span>
                                                <span className="block text-xs text-slate-600 mt-1 leading-snug">{opt.desc}</span>
                                                {active && (
                                                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center" aria-hidden="true">
                                                        <IconCheck />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.role && (
                                    <p role="alert" className="sc-pop text-red-600 text-xs font-semibold mt-1.5">
                                        {errors.role}
                                    </p>
                                )}
                                {editingSelf && (
                                    <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mt-2.5">
                                        <span className="mt-0.5 shrink-0">
                                            <IconAlert className="w-4 h-4" />
                                        </span>
                                        Role akun Anda sendiri dikunci agar Anda tidak kehilangan akses admin.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200 px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <button type="button" onClick={closeModal} className={btnSecondary}>
                                Batal
                            </button>
                            <button type="submit" disabled={processing} aria-busy={processing} className={btnPrimary}>
                                {processing && <Spinner />}
                                {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah User'}
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