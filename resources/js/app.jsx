import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'SmartCash';

createInertiaApp({
    // Jika judulnya sudah lengkap (mengandung kata "SmartCash"), pakai apa adanya. 
    // Jika belum, otomatis tambahkan "- SmartCash" di belakangnya.
    title: (title) => title.includes('SmartCash') ? title : `${title} - SmartCash`,
    
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});