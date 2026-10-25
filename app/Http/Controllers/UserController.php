<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Aturan username: huruf, angka, titik, garis bawah, strip (tanpa spasi dan tanpa "@").
     * Tanpa "@" supaya username tidak bisa menyerupai email orang lain saat login.
     */
    private const USERNAME_REGEX = '/^[A-Za-z0-9._-]+$/';

    private const USERNAME_MESSAGES = [
        'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, dan strip (tanpa spasi).',
        'username.unique' => 'Username sudah digunakan, coba yang lain.',
    ];

    public function index()
    {
        $storeId = auth()->user()->store_id;

        // Hanya ambil user yang memiliki store_id yang sama dengan user yang login
        $users = User::where('store_id', $storeId)->latest()->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'regex:' . self::USERNAME_REGEX, 'unique:users,username'],
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,kasir',
        ], self::USERNAME_MESSAGES);

        User::create([
            'store_id' => auth()->user()->store_id, // Kunci ke store_id admin yang membuat
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return back()->with('success', 'User berhasil ditambahkan!');
    }

    public function update(Request $request, User $user)
    {
        // Pastikan user yang diedit berada di toko yang sama
        if ($user->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        // Admin tidak boleh menurunkan role akunnya sendiri (agar tidak kehilangan akses admin)
        if ($user->id === auth()->id() && $request->role !== 'admin') {
            return back()->withErrors(['role' => 'Anda tidak bisa mengubah role akun Anda sendiri.']);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'regex:' . self::USERNAME_REGEX, 'unique:users,username,' . $user->id],
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,kasir',
            'password' => 'nullable|string|min:6',
        ], self::USERNAME_MESSAGES);

        $data = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'User berhasil diperbarui!');
    }

    public function destroy(User $user)
    {
        if ($user->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        if (auth()->id() === $user->id) {
            return back()->withErrors(['message' => 'Anda tidak bisa menghapus akun Anda sendiri!']);
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus!');
    }
}