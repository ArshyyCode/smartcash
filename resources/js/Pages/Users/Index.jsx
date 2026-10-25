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
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

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
    'w-full text-sm rounded-xl border-slate-200 bg-white placeholder:text-slate-400 transition duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400';

const Panel = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

const Field = ({ label, error, hint, right, children }) => (
    <div>
        <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">{label}</label>
            {right}
        </div>
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
    const tones = { blue: 'bg-blue-50 text-blue-600', slate: 'bg-slate-100 text-slate-600', green: 'bg-emerald-50 text-emerald-600' };
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

const Avatar = ({ user, size = 'w-10 h-10 text-sm' }) => (
    <span className={`${size} ${roleMeta(user.role).avatar} shrink-0 rounded-full text-white font-bold flex items-center justify-center`}>
        {(user.name || '?').charAt(0).toUpperCase()}
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

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setShowPassword(false);
        reset();
        clearErrors();
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            setConfirmState(null);
            if (isModalOpen) closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen]);

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

    let rowIndex = 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
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
                    <StatChip icon={<IconUsers />} label="Total Pengguna" value={users.length} />
                    <StatChip icon={<IconShield />} label="Admin" value={adminCount} />
                    <StatChip icon={<IconCart />} label="Kasir" value={kasirCount} tone="green" />
                </div>

                {/* TOOLBAR */}
                <Panel className="p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Daftar Pengguna Aplikasi</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Kelola data admin dan kasir yang berhak mengakses akun toko Anda.</p>
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
                                    placeholder="Cari nama, username, email..."
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
                                Tambah User Baru
                            </button>
                        </div>
                    </div>

                    <div className="sc-noscroll flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const active = roleFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setRoleFilter(tab.key)}
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
                </Panel>

                {/* TABEL USER (ADMIN DI ATAS, LALU KASIR) */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Pengguna</th>
                                    <th className="px-5 py-3.5 font-semibold">Username &amp; Email</th>
                                    <th className="px-5 py-3.5 font-semibold">Role</th>
                                    <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-14 text-center">
                                            <span className="text-slate-300 inline-block">
                                                <IconUsers className="w-10 h-10" />
                                            </span>
                                            <p className="text-slate-400 text-xs mt-2">
                                                {users.length === 0 ? 'Belum ada data user.' : 'Tidak ada user yang cocok dengan filter atau pencarian.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    groups.map((group) => (
                                        <React.Fragment key={group.role}>
                                            {roleFilter === 'all' && (
                                                <tr className="bg-slate-50/70 border-t border-slate-100">
                                                    <td colSpan="4" className="px-5 py-2">
                                                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                                            <span className={group.role === 'admin' ? 'text-blue-600' : 'text-emerald-600'}>
                                                                {group.role === 'admin' ? <IconShield className="w-4 h-4" /> : <IconCart className="w-4 h-4" />}
                                                            </span>
                                                            {roleMeta(group.role).label}
                                                            <span className="text-slate-400 font-semibold normal-case">&middot; {group.items.length} pengguna</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            )}

                                            {group.items.map((u) => {
                                                const isMe = auth.user.id === u.id;
                                                const delay = Math.min(rowIndex++, 12) * 30;
                                                return (
                                                    <tr
                                                        key={u.id}
                                                        style={{ animationDelay: `${delay}ms` }}
                                                        className="sc-rowin border-t border-slate-100 transition-colors hover:bg-slate-50"
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar user={u} />
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-800 truncate max-w-[220px]">{u.name}</p>
                                                                    {isMe && (
                                                                        <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                            Akun Anda
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <p className="font-semibold text-slate-700">@{u.username || '-'}</p>
                                                            <p className="text-xs text-slate-400">{u.email}</p>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${roleMeta(u.role).badge}`}>
                                                                {String(u.role).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEdit(u)}
                                                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition duration-200 active:scale-95"
                                                                >
                                                                    <IconEdit />
                                                                    Edit
                                                                </button>
                                                                {!isMe && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDelete(u)}
                                                                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition duration-200 active:scale-95"
                                                                    >
                                                                        <IconTrash />
                                                                        Hapus
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>

            {/* ================= MODAL TAMBAH / EDIT USER ================= */}
            {isModalOpen && (
                <div onClick={closeModal} className="sc-fade fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-center p-4">
                    <div onClick={(e) => e.stopPropagation()} className="sc-pop bg-white p-6 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <h3 className="text-base font-bold text-slate-900">{isEditing ? 'Edit Data User' : 'Tambah User Baru'}</h3>
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
                            <Field label="Nama Lengkap" error={errors.name}>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`${inputCls} py-2.5`}
                                    placeholder="Masukkan nama pengguna"
                                    required
                                />
                            </Field>

                            <Field label="Username" error={errors.username} hint="Dipakai untuk login. Gunakan huruf kecil tanpa spasi.">
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">@</span>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className={`${inputCls} py-2.5 pl-8`}
                                        placeholder="kasir1"
                                        required
                                    />
                                </div>
                            </Field>

                            <Field label="Email" error={errors.email}>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`${inputCls} py-2.5`}
                                    placeholder="email@domain.com"
                                    required
                                />
                            </Field>

                            <Field
                                label={
                                    <>
                                        Password{' '}
                                        {isEditing && <span className="text-[10px] text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                                    </>
                                }
                                error={errors.password}
                                right={
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('password', randomPassword());
                                            setShowPassword(true);
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition active:scale-95"
                                    >
                                        <IconDice />
                                        Buat acak
                                    </button>
                                }
                            >
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`${inputCls} py-2.5 pr-11`}
                                        placeholder="Minimal 8 karakter"
                                        autoComplete="new-password"
                                        required={!isEditing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
                                    >
                                        {showPassword ? <IconEyeOff /> : <IconEye />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="sc-pop mt-2">
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.w}`} />
                                        </div>
                                        <p className={`text-[11px] font-semibold mt-1 ${strength.text}`}>Kekuatan password: {strength.label}</p>
                                    </div>
                                )}
                            </Field>

                            {/* role sebagai pilihan kartu */}
                            <Field label="Role / Hak Akses" error={errors.role}>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { v: 'kasir', title: 'Kasir', desc: 'Akses POS dan transaksi penjualan.', icon: <IconCart /> },
                                        { v: 'admin', title: 'Admin', desc: 'Akses penuh: produk, laporan, dan staf.', icon: <IconShield /> },
                                    ].map((opt) => {
                                        const active = data.role === opt.v;
                                        return (
                                            <button
                                                key={opt.v}
                                                type="button"
                                                disabled={editingSelf}
                                                onClick={() => setData('role', opt.v)}
                                                aria-pressed={active}
                                                className={`text-left rounded-xl border p-3 transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    active ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300'
                                                }`}
                                            >
                                                <span className={`flex items-center gap-2 text-xs font-bold ${active ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {opt.icon}
                                                    {opt.title}
                                                </span>
                                                <span className="block text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {editingSelf && (
                                    <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 mt-2">
                                        <span className="mt-0.5 shrink-0">
                                            <IconAlert className="w-3.5 h-3.5" />
                                        </span>
                                        Role akun Anda sendiri dikunci agar Anda tidak kehilangan akses admin.
                                    </p>
                                )}
                            </Field>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
                                    {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah User'}
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