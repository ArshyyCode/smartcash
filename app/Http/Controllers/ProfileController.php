<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class ProfileController extends Controller
{
    /**
     * Halaman profil digabung ke Pengaturan > Keamanan Akun.
     * Route profile.edit dipertahankan agar link lama tetap berfungsi.
     */
    public function edit(Request $request): RedirectResponse
    {
        return Redirect::route('settings.index', ['tab' => 'security']);
    }

    /**
     * Update informasi profil (tetap tersedia; form baru memakai settings.account).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return back();
    }

    /**
     * Hapus akun milik user yang login.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Admin terakhir toko tidak boleh menghapus akunnya (toko akan tanpa admin)
        if ($user->role === 'admin') {
            $otherAdminExists = User::where('store_id', $user->store_id)
                ->where('role', 'admin')
                ->where('id', '!=', $user->id)
                ->exists();

            if (!$otherAdminExists) {
                return back()->withErrors([
                    'password' => 'Anda adalah satu-satunya admin toko ini. Jadikan user lain sebagai admin terlebih dahulu.',
                ]);
            }
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}