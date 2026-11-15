import React, { useEffect, useRef } from 'react';

/* ================================================================== */
/*  DialogShell: kerangka jendela dialog yang aksesibel                */
/*  Letakkan di: resources/js/Components/DialogShell.jsx               */
/*                                                                     */
/*  - role dialog + aria-modal, judul lewat aria-labelledby            */
/*  - fokus masuk ke dalam dialog, Tab berputar di dalamnya,           */
/*    fokus kembali ke tombol pemicu saat ditutup                      */
/*  - Esc menutup dialog paling atas saja (dialog bertumpuk aman)      */
/*  - klik di area gelap menutup; halaman di belakang tidak bisa       */
/*    digulir                                                          */
/*  - di HP tampil sebagai lembar dari bawah, di layar lebar di tengah */
/*                                                                     */
/*  Tombol batal dapat diberi atribut data-dialog-cancel dan elemen    */
/*  yang ingin difokuskan lebih dulu diberi data-autofocus.            */
/* ================================================================== */
const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-3xl',
};

const stack = []; // dialog yang sedang terbuka (yang terakhir = paling atas)
let counter = 0;

const css = `
@keyframes dlg-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes dlg-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
.dlg-fade { animation: dlg-fade 160ms ease backwards }
.dlg-rise { animation: dlg-rise 200ms cubic-bezier(.22,1,.36,1) backwards }
@media (prefers-reduced-motion: reduce) { .dlg-fade, .dlg-rise { animation: none !important } }
`;

export default function DialogShell({ onClose, labelledBy, describedBy, role = 'dialog', size = 'md', z = 'z-50', initialFocus = 'first', children }) {
    const panelRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const id = ++counter;
        stack.push(id);
        const previous = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const panel = panelRef.current;
        const target =
            (initialFocus === 'cancel' && panel.querySelector('[data-dialog-cancel]')) ||
            panel.querySelector('[data-autofocus]') ||
            panel.querySelector(FOCUSABLE);
        (target || panel).focus();

        const onKey = (e) => {
            if (stack[stack.length - 1] !== id) return; // hanya dialog paling atas yang merespons
            if (e.key === 'Escape' && !e.defaultPrevented) {
                e.preventDefault();
                closeRef.current();
                return;
            }
            if (e.key !== 'Tab') return;
            const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;
            if (e.shiftKey && (current === first || current === panel)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && current === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            const i = stack.indexOf(id);
            if (i >= 0) stack.splice(i, 1);
            document.body.style.overflow = prevOverflow;
            if (previous && typeof previous.focus === 'function') previous.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeRef.current();
            }}
            className={`dlg-fade fixed inset-0 ${z} bg-slate-900/50 flex items-end sm:items-center justify-center sm:p-4`}
        >
            <style>{css}</style>
            <div
                ref={panelRef}
                role={role}
                aria-modal="true"
                aria-labelledby={labelledBy}
                aria-describedby={describedBy}
                tabIndex={-1}
                className={`dlg-rise bg-white w-full ${SIZES[size] || SIZES.md} rounded-t-2xl sm:rounded-2xl max-h-[92dvh] flex flex-col shadow-xl outline-none`}
            >
                {children}
            </div>
        </div>
    );
}
