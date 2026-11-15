import React, { useEffect } from 'react';

/* ================================================================== */
/*  Toast: pemberitahuan singkat                                       */
/*  Letakkan di: resources/js/Components/Toast.jsx                     */
/*                                                                     */
/*  Pemakaian: <Toast toast={toast} onClose={() => setToast(null)} />  */
/*  toast = { type: 'success' | 'error', message, id }                 */
/*  Sukses hilang sendiri setelah 3,2 detik, galat 5 detik.            */
/*  Pembaca layar langsung membacakannya (status / alert).             */
/* ================================================================== */
const css = `
@keyframes tst-in { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: none } }
.tst-in { animation: tst-in 220ms cubic-bezier(.22,1,.36,1) backwards }
@media (prefers-reduced-motion: reduce) { .tst-in { animation: none !important } }
`;

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(onClose, toast.type === 'error' ? 5000 : 3200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    if (!toast) return null;
    const ok = toast.type === 'success';

    return (
        <div
            className="fixed top-20 right-4 sm:right-6 z-[80] max-w-[calc(100vw-2rem)]"
            role={ok ? 'status' : 'alert'}
            aria-live={ok ? 'polite' : 'assertive'}
        >
            <style>{css}</style>
            <div
                key={toast.id}
                className={`tst-in flex items-start gap-3 max-w-sm rounded-2xl pl-4 pr-1.5 py-2 border shadow-md text-sm font-semibold ${
                    ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}
            >
                <span className={`mt-2 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-white ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {ok ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6 6 18" />}
                    </svg>
                </span>
                <span className="leading-snug py-2 break-words">{toast.message}</span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup pemberitahuan"
                    className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors duration-150"
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
