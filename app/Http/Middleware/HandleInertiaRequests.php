<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],

            // Tema warna toko yang sedang login: samudra | bumi | noir | malam.
            // Tema lama yang sudah dihapus (zamrud, senja) otomatis kembali ke samudra.
            'theme' => fn () => $request->user()
                ? $this->resolveTheme(Store::whereKey($request->user()->store_id)->value('theme'))
                : null,
        ];
    }

    /**
     * Pastikan nilai tema valid; selain itu pakai tema bawaan.
     */
    private function resolveTheme(?string $theme): string
    {
        return in_array($theme, ['samudra', 'bumi', 'noir', 'malam'], true) ? $theme : 'samudra';
    }
}