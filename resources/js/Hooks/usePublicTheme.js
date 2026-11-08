import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

/* ================================================================== */
/*  Tema halaman PUBLIK (landing, login, daftar, lupa password, dst.)  */
/*  Letakkan di: resources/js/Hooks/usePublicTheme.js                  */
/*                                                                     */
/*  - Hanya dua pilihan: 'terang' dan 'gelap'.                         */
/*  - Disimpan di kunci sendiri (sc-public-theme), TERPISAH dari tema   */
/*    aplikasi di dalam akun (Pengaturan > Tampilan), sehingga          */
/*    mengganti tema di dalam aplikasi tidak mengubah halaman publik.   */
/*  - Tidak menyentuh atribut data-theme milik aplikasi.               */
/* ================================================================== */

export const PUBLIC_THEME_KEY = 'sc-public-theme';
export const THEME_LIGHT = 'terang';
export const THEME_DARK = 'gelap';

const isValid = (value) => value === THEME_LIGHT || value === THEME_DARK;

const readSaved = () => {
    try {
        const value = localStorage.getItem(PUBLIC_THEME_KEY);
        return isValid(value) ? value : null;
    } catch (error) {
        return null;
    }
};

const saveTheme = (value) => {
    try {
        localStorage.setItem(PUBLIC_THEME_KEY, value);
    } catch (error) {
        console.warn('Pilihan tema SmartCash tidak dapat disimpan di browser.', error);
    }
};

// useLayoutEffect mencegah kedipan tema terang saat halaman dibuka di mode gelap
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function usePublicTheme() {
    const [theme, setTheme] = useState(THEME_LIGHT);

    // muat pilihan tersimpan; bila belum ada, ikuti pengaturan mode perangkat
    useIsomorphicLayoutEffect(() => {
        const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        const saved = readSaved();
        if (saved) setTheme(saved);
        else if (mq && mq.matches) setTheme(THEME_DARK);

        // selama pengguna belum memilih sendiri, ikuti perubahan mode perangkat
        const onSystemChange = (e) => {
            if (!readSaved()) setTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        };
        // sinkron antar tab / antar halaman publik
        const onStorage = (e) => {
            if (e.key === PUBLIC_THEME_KEY && isValid(e.newValue)) setTheme(e.newValue);
        };

        if (mq && mq.addEventListener) mq.addEventListener('change', onSystemChange);
        window.addEventListener('storage', onStorage);
        return () => {
            if (mq && mq.removeEventListener) mq.removeEventListener('change', onSystemChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // warna bawaan browser (scrollbar, kolom isian) ikut mode
    useEffect(() => {
        document.documentElement.style.colorScheme = theme === THEME_DARK ? 'dark' : 'light';
        return () => {
            document.documentElement.style.colorScheme = '';
        };
    }, [theme]);

    /* rootEl (opsional): elemen akar halaman, dipakai untuk transisi warna yang halus */
    const toggleTheme = useCallback(
        (rootEl) => {
            const next = theme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
            const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (rootEl && !reduceMotion) {
                rootEl.classList.add('sc-switching');
                window.setTimeout(() => rootEl.classList.remove('sc-switching'), 450);
            }
            setTheme(next);
            saveTheme(next);
        },
        [theme]
    );

    return { theme, isDark: theme === THEME_DARK, toggleTheme };
}
