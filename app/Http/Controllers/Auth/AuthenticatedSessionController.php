<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'store_code' => 'required|string',
            'username'   => 'required|string',
            'password'   => 'required|string',
        ], [
            'store_code.required' => 'Kode toko wajib diisi.',
            'username.required'   => 'Username wajib diisi.',
            'password.required'   => 'Password wajib diisi.',
        ]);

        // 1. Cari Toko berdasarkan Kode Toko
        $store = Store::where('code', strtoupper(trim($request->store_code)))->first();

        if (!$store) {
            throw ValidationException::withMessages([
                'store_code' => ['Kode toko tidak ditemukan.'],
            ]);
        }

        // 2. Cari User di Toko tersebut berdasarkan username.
        //    orWhere('email', ...) hanya cadangan agar akun lama yang belum punya
        //    username tetap bisa masuk dengan emailnya. Hapus baris itu bila sudah
        //    tidak diperlukan.
        $login = trim($request->username);

        $user = User::where('store_id', $store->id)
            ->where(function ($query) use ($login) {
                $query->where('username', $login)
                      ->orWhere('email', $login);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah untuk toko ini.'],
            ]);
        }

        // 3. Login User
        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}