import React, { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';

/* ================================================================== */
/*  CSS ANIMASI                                                        */
/* ================================================================== */
const css = `
@keyframes sc-navin { from { opacity: 0; transform: translateX(-14px) } to { opacity: 1; transform: none } }
@keyframes sc-fadein { from { opacity: 0 } to { opacity: 1 } }
.sc-navin { animation: sc-navin .5s cubic-bezier(.22,1,.36,1) backwards }
.sc-fadein { animation: sc-fadein .25s ease backwards }
.sc-side-scroll::-webkit-scrollbar { width: 6px }
.sc-side-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 9999px }
@media (prefers-reduced-motion: reduce) {
    .sc-navin, .sc-fadein { animation: none !important }
}
`;

/* ================================================================== */
/*  IKON                                                               */
/* ================================================================== */
const ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconHome = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V10" />
    </svg>
);
const IconCart = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M3 4h2.2l2.2 11h10.2l2-8H6.2" />
        <circle cx="9" cy="19.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
);
const IconBox = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
);
const IconInbox = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M12 3v10m0 0-3.500-3.500M12 13l3.500-3.500" />
        <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4h-5l-1 2h-4l-1-2H4Z" />
    </svg>
);
const IconTruck = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M2.500 6.500A1.500 1.500 0 0 1 4 5h9v11H2.500V6.500Z" />
        <path d="M13 9h4.500l3 3.500V16H13V9Z" />
        <circle cx="7" cy="17.500" r="1.800" fill="#16255a" />
        <circle cx="17" cy="17.500" r="1.800" fill="#16255a" />
    </svg>
);
const IconTag = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M3 12.200V4.500A1.500 1.500 0 0 1 4.500 3h7.700a1.500 1.500 0 0 1 1.100.4l7.300 7.300a1.500 1.500 0 0 1 0 2.100l-7.700 7.700a1.500 1.500 0 0 1-2.100 0l-7.300-7.300a1.500 1.500 0 0 1-.5-1Z" />
        <circle cx="7.500" cy="7.500" r="1.200" fill="currentColor" />
    </svg>
);
const IconChart = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <rect x="4" y="3.500" width="16" height="17" rx="3" />
        <path d="M8.500 16.500v-4M12 16.500v-7M15.500 16.500v-2.500" />
    </svg>
);
const IconUsers = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <circle cx="9" cy="8" r="3.500" />
        <path d="M2.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6" />
        <path d="M16 4.600a3.500 3.500 0 0 1 0 6.800M18.500 14.300c1.800.8 3 2.600 3 5.200" />
    </svg>
);
const IconGear = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
);
const IconMenu = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
);
const IconClose = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...ip}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);
const IconChevron = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" {...ip} strokeWidth={2.500}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);
const IconCalendar = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" {...ip}>
        <rect x="3.500" y="5" width="17" height="15.500" rx="3" />
        <path d="M3.500 10h17M8 3v4M16 3v4" />
    </svg>
);

/* ================================================================== */
/*  MENU                                                               */
/*  `pattern` dipakai route().current() agar menu tetap aktif di       */
/*  sub-halaman (mis. products.create tetap menyalakan Kelola Produk)  */
/* ================================================================== */
const MAIN_MENU = [
    { label: 'Dashboard', routeName: 'dashboard', pattern: 'dashboard*', icon: <IconHome /> },
    { label: 'POS Kasir', routeName: 'pos.index', pattern: 'pos.*', icon: <IconCart /> },
];

const ADMIN_MENU = [
    { label: 'Kelola Produk', routeName: 'products.index', pattern: 'products.*', icon: <IconBox /> },
    { label: 'Restock Barang', routeName: 'purchases.index', pattern: 'purchases.*', icon: <IconInbox /> },
    { label: 'Kelola Supplier', routeName: 'suppliers.index', pattern: 'suppliers.*', icon: <IconTruck /> },
    { label: 'Kelola Diskon', routeName: 'discounts.index', pattern: 'discounts.*', icon: <IconTag /> },
    { label: 'Laporan Penjualan', routeName: 'reports.index', pattern: 'reports.*', icon: <IconChart /> },
    { label: 'Kelola Staf / User', routeName: 'users.index', pattern: 'users.*', icon: <IconUsers /> },
];

// Pengaturan tersedia untuk admin dan kasir (kasir hanya melihat bagian Keamanan Akun)
const SETTINGS_ITEM = { label: 'Pengaturan', routeName: 'settings.index', pattern: 'settings.*', icon: <IconGear /> };

const NavItem = ({ item, index, onNavigate }) => {
    const active = route().current(item.pattern);
    return (
        <Link
            href={route(item.routeName)}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 45}ms` }}
            className={`sc-navin group relative flex items-center gap-3 px-3.5 py-2.5 [@media(max-height:800px)]:py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
            }`}
        >
            {active && <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-sky-400" />}
            <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
            {item.label}
        </Link>
    );
};

/* ================================================================== */
/*  LAYOUT                                                             */
/* ================================================================== */
export default function AuthenticatedLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // tema warna toko (dibagikan dari HandleInertiaRequests); dipasang ke <html data-theme="...">
    const { theme } = usePage().props;
    useEffect(() => {
        const t = theme || 'samudra';
        document.documentElement.setAttribute('data-theme', t);
        try {
            localStorage.setItem('sc-theme', t);
        } catch (e) {
            // abaikan jika penyimpanan lokal diblokir
        }
    }, [theme]);
    const [now, setNow] = useState(() => new Date());

    // jam & tanggal di topbar
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);

    // tutup sidebar (mobile) dengan tombol Esc
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const closeSidebar = () => setSidebarOpen(false);
    const isAdmin = user?.role === 'admin';
    const initial = (user?.name || 'U').charAt(0).toUpperCase();

    const dateText = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <style>{css}</style>

            {/* overlay untuk mobile */}
            {sidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="sc-fadein md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                    aria-hidden="true"
                />
            )}

            {/* ===================== SIDEBAR ===================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col justify-between bg-[#16255a] transition-transform duration-300 ease-out md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col min-h-0">
                    {/* logo & nama */}
                    <div className="flex items-center justify-between h-20 px-5 [@media(max-height:800px)]:h-16">
                        <Link href={route('dashboard')} onClick={closeSidebar} className="group flex items-center gap-3">
                            <span className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-black/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                                <ApplicationLogo className="w-full h-full" />
                            </span>
                            <span>
                                <span className="block text-xl font-extrabold text-white tracking-tight leading-none">
                                    Smart<span className="text-sky-400">Cash</span>
                                </span>
                                <span className="block text-[11px] text-slate-400 mt-1">Solusi Kasir Modern</span>
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={closeSidebar}
                            aria-label="Tutup menu"
                            className="md:hidden w-9 h-9 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition"
                        >
                            <IconClose />
                        </button>
                    </div>

                    {/* menu */}
                    <nav className="sc-side-scroll flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-1">
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400/80 uppercase tracking-widest">Menu Utama</p>
                        {MAIN_MENU.map((item, i) => (
                            <NavItem key={item.routeName} item={item} index={i} onNavigate={closeSidebar} />
                        ))}

                        {isAdmin && (
                            <>
                                <p className="px-3 pt-6 [@media(max-height:800px)]:pt-4 pb-1 text-[10px] font-bold text-slate-400/80 uppercase tracking-widest">
                                    Manajemen Toko
                                </p>
                                {ADMIN_MENU.map((item, i) => (
                                    <NavItem key={item.routeName} item={item} index={i + MAIN_MENU.length} onNavigate={closeSidebar} />
                                ))}
                            </>
                        )}

                        <p className="px-3 pt-6 [@media(max-height:800px)]:pt-4 pb-1 text-[10px] font-bold text-slate-400/80 uppercase tracking-widest">Akun</p>
                        <NavItem item={SETTINGS_ITEM} index={MAIN_MENU.length + (isAdmin ? ADMIN_MENU.length : 0)} onNavigate={closeSidebar} />
                    </nav>
                </div>

                {/* status */}
                <div className="shrink-0 m-4 [@media(max-height:780px)]:m-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 [@media(max-height:780px)]:py-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                        <span className="relative flex w-2.5 h-2.5">
                            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </span>
                        Online
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">SmartCash v1.0.0</p>
                </div>
            </aside>

            {/* ===================== AREA KONTEN ===================== */}
            <div className="flex-1 min-w-0 flex flex-col md:pl-64">
                {/* topbar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
                    <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka menu"
                            className="md:hidden w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition"
                        >
                            <IconMenu />
                        </button>

                        <div className="min-w-0 flex-1 truncate">{header}</div>

                        {/* tanggal & jam */}
                        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                            <span className="text-blue-500">
                                <IconCalendar />
                            </span>
                            <span>{dateText}</span>
                            <span className="w-px h-3.5 bg-slate-200" />
                            <span className="font-semibold text-slate-700 tabular-nums">{timeText}</span>
                        </div>

                        {/* menu user */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="group flex items-center gap-2.5 rounded-xl pl-1.5 pr-2.5 py-1.5 hover:bg-blue-50 active:scale-95 transition duration-200"
                                >
                                    <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                        {initial}
                                    </span>
                                    <span className="hidden sm:block text-left leading-tight">
                                        <span className="block text-xs font-bold text-slate-800 max-w-[120px] truncate">{user?.name}</span>
                                        <span className="block text-[10px] font-semibold text-blue-600 capitalize">{user?.role}</span>
                                    </span>
                                    <span className="hidden sm:block text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5">
                                        <IconChevron />
                                    </span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="48">
                                <Dropdown.Link href={route('settings.index', { tab: 'security' })}>Pengaturan Akun</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}