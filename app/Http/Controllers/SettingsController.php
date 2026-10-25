<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Halaman Pengaturan (admin: Profil Toko, Kode Unik Toko, Keamanan Akun;
     * kasir: hanya Keamanan Akun).
     */
    public function index(Request $request)
    {
        $store = Store::find($request->user()->store_id);

        return Inertia::render('Settings/Index', [
            'store' => $store,
            'initialTab' => $request->query('tab'),
        ]);
    }

    // ------------------------------------------------------------------
    // KHUSUS ADMIN (dilindungi middleware role:admin di routes/web.php)
    // ------------------------------------------------------------------

    /**
     * Memperbarui profil toko (nama, alamat, telepon) dan banner Dashboard.
     *
     * banner_mode:
     *   upload -> memakai foto unggahan (file baru, atau foto lama yang sudah tersimpan)
     *   url    -> memakai link gambar
     *   none   -> tanpa gambar (warna polos bawaan)
     */
    public function updateStore(Request $request)
    {
        $store = Store::findOrFail($request->user()->store_id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'banner_mode' => 'required|in:upload,url,none',
            'banner_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'banner_url' => 'nullable|url|max:2048',
            'banner_overlay' => 'required|integer|min:0|max:80',
        ], [
            'name.required' => 'Nama toko wajib diisi.',
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung.',
            'banner_file.image' => 'File banner harus berupa gambar.',
            'banner_file.mimes' => 'Format banner harus JPG, PNG, atau WEBP.',
            'banner_file.max' => 'Ukuran banner maksimal 2 MB.',
            'banner_url.url' => 'Link gambar tidak valid. Awali dengan http:// atau https://',
        ]);

        $old = $store->banner;
        $oldIsLocal = $old && !preg_match('#^(https?:)?//#i', $old);

        $data = [
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'banner_overlay' => $validated['banner_overlay'],
        ];

        switch ($validated['banner_mode']) {
            case 'upload':
                if ($request->hasFile('banner_file')) {
                    $data['banner'] = $request->file('banner_file')->store('banners', 'public');
                    if ($oldIsLocal) {
                        Storage::disk('public')->delete($old);
                    }
                } elseif (!$oldIsLocal) {
                    // belum ada foto unggahan sebelumnya dan tidak ada file baru
                    throw ValidationException::withMessages([
                        'banner_file' => 'Pilih foto yang ingin diunggah.',
                    ]);
                }
                // jika tidak ada file baru dan foto lama masih ada: banner tidak diubah
                break;

            case 'url':
                if (empty($validated['banner_url'])) {
                    throw ValidationException::withMessages([
                        'banner_url' => 'Masukkan link gambar banner.',
                    ]);
                }
                $data['banner'] = $validated['banner_url'];
                if ($oldIsLocal) {
                    Storage::disk('public')->delete($old);
                }
                break;

            case 'none':
                $data['banner'] = null;
                if ($oldIsLocal) {
                    Storage::disk('public')->delete($old);
                }
                break;
        }

        $store->update($data);

        return back()->with('success', 'Profil toko dan banner berhasil diperbarui!');
    }

    /**
     * Memperbarui tema warna aplikasi untuk seluruh pengguna toko.
     */
    public function updateTheme(Request $request)
    {
        $validated = $request->validate([
            'theme' => ['required', Rule::in(['samudra', 'bumi', 'noir', 'malam'])],
        ], [
            'theme.in' => 'Tema yang dipilih tidak tersedia.',
        ]);

        Store::findOrFail($request->user()->store_id)->update([
            'theme' => $validated['theme'],
        ]);

        return back()->with('success', 'Tema tampilan berhasil diperbarui!');
    }

    /**
     * Memperbarui kode unik toko (dipindahkan dari DashboardController).
     */
    public function updateStoreCode(Request $request)
    {
        $store = Store::findOrFail($request->user()->store_id);

        $request->validate([
            'code' => ['required', 'string', 'min:4', 'max:50', Rule::unique('stores', 'code')->ignore($store->id)],
        ], [
            'code.required' => 'Kode toko wajib diisi.',
            'code.min' => 'Kode toko minimal harus 4 karakter.',
            'code.unique' => 'Kode toko telah digunakan oleh toko lain.',
        ]);

        $store->update([
            'code' => strtoupper(trim($request->code)),
        ]);

        return back()->with('success', 'Kode toko berhasil diperbarui!');
    }

    // ------------------------------------------------------------------
    // ADMIN & KASIR: Keamanan Akun
    // ------------------------------------------------------------------

    /**
     * Memperbarui informasi akun (nama, username, email) milik user yang login.
     */
    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9._-]+$/', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ], [
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (tanpa spasi).',
            'username.unique' => 'Username sudah digunakan, coba yang lain.',
            'email.unique' => 'Email sudah digunakan akun lain.',
        ]);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Informasi akun berhasil diperbarui!');
    }

    /**
     * Memperbarui kata sandi user yang login.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Kata sandi berhasil diperbarui!');
    }
}