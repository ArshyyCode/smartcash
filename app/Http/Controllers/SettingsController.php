<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Support\VercelBlob;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
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
        $blob = app(VercelBlob::class);

        // samakan baris baru (CRLF -> LF) agar hitungan karakter alamat sama dengan di layar
        if ($request->has('address')) {
            $request->merge([
                'address' => str_replace(["\r\n", "\r"], "\n", (string) $request->input('address')),
            ]);
        }

        $validated = $request->validate([
            // Batas dan karakter yang diperbolehkan sama dengan validasi langsung di halaman Pengaturan
            'name' => ['required', 'string', 'max:30', "regex:/^[\\p{L}\\p{N}\\s.,&'’\\-()\\/+:]+$/u"],
            'address' => ['nullable', 'string', 'max:250', "regex:/^[\\p{L}\\p{N}\\s.,\\-()\\/#:'’&+]+$/u"],
            'phone' => ['nullable', 'string', 'max:17', 'regex:/^\\+?[0-9\\s\\-()]+$/'],
            'banner_mode' => 'required|in:upload,url,none',
            'banner_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'banner_url' => 'nullable|url|max:2048',
            'banner_overlay' => 'required|integer|min:0|max:80',
        ], [
            'name.required' => 'Nama toko wajib diisi.',
            'name.max' => 'Nama toko melebihi batas 30 karakter.',
            'name.regex' => 'Nama toko memuat simbol yang tidak diperbolehkan. Gunakan huruf, angka, dan tanda . , & \' - ( ) /',
            'address.max' => 'Alamat melebihi batas 250 karakter.',
            'address.regex' => 'Alamat memuat simbol yang tidak diperbolehkan. Gunakan huruf, angka, dan tanda . , - / ( ) # : &',
            'phone.max' => 'Nomor telepon melebihi batas 17 karakter.',
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, tanda -, tanda kurung, dan tanda + di awal.',
            'banner_file.image' => 'File banner harus berupa gambar.',
            'banner_file.mimes' => 'Format banner harus JPG, PNG, atau WEBP.',
            'banner_file.max' => 'Ukuran banner maksimal 2 MB.',
            'banner_url.url' => 'Link gambar tidak valid. Awali dengan http:// atau https://',
        ]);

        $old = $store->banner;
        $oldIsLocal = $old && !preg_match('#^(https?:)?//#i', $old);
        $deleteOldBanner = false;

        $data = [
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'banner_overlay' => $validated['banner_overlay'],
        ];

        switch ($validated['banner_mode']) {
            case 'upload':
                if ($request->hasFile('banner_file')) {
                    $file = $request->file('banner_file');
                    if ($blob->configured()) {
                        try {
                            $data['banner'] = $blob->upload($file, $store->id);
                        } catch (ConnectionException|RequestException|\UnexpectedValueException $exception) {
                            Log::error('Banner upload to Vercel Blob failed.', [
                                'store_id' => $store->id,
                                'exception' => $exception::class,
                                'status' => $exception instanceof RequestException ? $exception->response->status() : null,
                            ]);

                            throw ValidationException::withMessages([
                                'banner_file' => 'Foto banner gagal diunggah ke penyimpanan. Coba lagi atau periksa konfigurasi Vercel Blob.',
                            ]);
                        }
                    } elseif (app()->environment('production')) {
                        throw ValidationException::withMessages([
                            'banner_file' => 'Penyimpanan banner belum dikonfigurasi. Hubungkan Vercel Blob dan atur BLOB_READ_WRITE_TOKEN.',
                        ]);
                    } else {
                        $data['banner'] = $file->store('banners', 'public');
                    }
                    $deleteOldBanner = $oldIsLocal && $old !== $data['banner'];
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
                $deleteOldBanner = $oldIsLocal && $old !== $data['banner'];
                break;

            case 'none':
                $data['banner'] = null;
                $deleteOldBanner = $oldIsLocal;
                break;
        }

        $store->update($data);

        if ($deleteOldBanner) {
            try {
                if ($blob->isStoredUrl($old)) {
                    if ($blob->configured()) {
                        $blob->delete($old);
                    } else {
                        Log::warning('Old Vercel Blob banner was not removed because storage is not configured.', [
                            'store_id' => $store->id,
                        ]);
                    }
                } else {
                    Storage::disk('public')->delete($old);
                }
            } catch (ConnectionException|RequestException $exception) {
                Log::warning('Old banner could not be removed from storage.', [
                    'store_id' => $store->id,
                    'exception' => $exception::class,
                    'status' => $exception instanceof RequestException ? $exception->response->status() : null,
                ]);
            }
        }

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