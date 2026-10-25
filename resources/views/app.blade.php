<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon / Logo Tab -->
        <link rel="icon" type="image/png" href="{{ asset('images/logo-smartcash-tab.png') }}" />

        <!-- Tema warna: dipasang sebelum halaman tampil agar tidak berkedip -->
        <script>
            (function () {
                try {
                    var t = localStorage.getItem('sc-theme');
                    // halaman beranda (/) selalu memakai tema bawaan
                    if (t && location.pathname !== '/') {
                        document.documentElement.setAttribute('data-theme', t);
                    }
                } catch (e) {}
            })();
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>