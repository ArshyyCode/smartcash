import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/*
 * Warna dibaca dari variabel CSS (didefinisikan di resources/css/app.css),
 * sehingga tema bisa diganti lewat atribut data-theme tanpa mengedit halaman satu per satu.
 */
const cssVar = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix, shades) => Object.fromEntries(shades.map((s) => [s, cssVar(`${prefix}-${s}`)]));

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            colors: {
                blue: scale('p', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
                sky: scale('a', [300, 400, 500]),
                slate: scale('s', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
                gray: scale('s', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
                emerald: scale('e', [50, 100, 200, 300, 400, 500, 600, 700, 800]),
                red: scale('r', [50, 100, 200, 300, 500, 600, 700, 800]),
                amber: scale('am', [50, 100, 400, 600, 700, 800, 950]),
            },
        },
    },

    plugins: [forms],
};