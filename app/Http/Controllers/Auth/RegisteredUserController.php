<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            // Form pendaftaran tidak mengirim kode toko, jadi dibuat otomatis (lihat di bawah).
            // Aturan ini hanya berlaku bila suatu saat kode toko diisi manual.
            'store_code' => 'nullable|string|min:4|max:50|unique:stores,code',
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9._-]+$/', 'unique:users,username'],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'store_code.unique' => 'Kode toko telah digunakan oleh toko lain.',
            'store_code.min' => 'Kode toko minimal harus 4 karakter.',
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (tanpa spasi).',
            'username.unique' => 'Username sudah digunakan, coba yang lain.',
        ]);

        // 1. Buat Toko Baru. Kode toko dibuat otomatis (contoh: STR-K7P2QX) bila tidak diisi.
        //    Admin bisa mengubahnya nanti lewat Dashboard.
        $store = Store::create([
            'name' => $request->store_name,
            'code' => $request->filled('store_code')
                ? strtoupper($request->store_code)
                : $this->generateStoreCode(),
        ]);

        // 2. Buat User Pemilik/Admin Toko
        $user = User::create([
            'store_id' => $store->id,
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Buat kode toko unik berformat STR-XXXXXX.
     */
    private function generateStoreCode(): string
    {
        do {
            $code = 'STR-' . strtoupper(Str::random(6));
        } while (Store::where('code', $code)->exists());

        return $code;
    }
}