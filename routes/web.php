<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ROUTE KASIR & ADMIN (Bisa akses Dashboard & POS)
    Route::middleware('role:admin,kasir')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/pos', [ProductController::class, 'index'])->name('pos.index');
        Route::post('/pos/checkout', [TransactionController::class, 'store'])->name('pos.checkout');

        // PENGATURAN: Keamanan Akun (profil akun & ganti kata sandi) untuk admin dan kasir
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account');
        Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
    });

    // ROUTE KHUSUS ADMIN (Kasir tidak bisa akses)
    Route::middleware('role:admin')->group(function () {
        // PENGATURAN TOKO: Profil Toko & Kode Unik Toko (dipindahkan dari Dashboard)
        Route::put('/settings/store', [SettingsController::class, 'updateStore'])->name('settings.store');
        Route::put('/settings/store-code', [SettingsController::class, 'updateStoreCode'])->name('settings.store-code');
        Route::put('/settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');

        Route::get('/reports', [TransactionController::class, 'reports'])->name('reports.index');
        Route::post('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel'])->name('transactions.cancel');
        
        // ROUTE MANAJEMEN PRODUK
        Route::get('/products', [ProductController::class, 'manage'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        
        // ROUTE MANAJEMEN KATEGORI (Lengkap: Store, Update, Destroy)
        Route::post('/categories', [ProductController::class, 'storeCategory'])->name('categories.store');
        Route::put('/categories/{category}', [ProductController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{category}', [ProductController::class, 'destroyCategory'])->name('categories.destroy');

        // ROUTE PEMBELIAN / RESTOCK STOK
        Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
        Route::post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');

        // ROUTE MANAJEMEN SUPPLIER (CRUD)
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        // ROUTE MANAJEMEN DISKON / PROMO
        Route::get('/discounts', [DiscountController::class, 'index'])->name('discounts.index');
        Route::post('/discounts', [DiscountController::class, 'store'])->name('discounts.store');
        Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discounts.update');
        Route::patch('/discounts/{discount}/toggle', [DiscountController::class, 'toggleStatus'])->name('discounts.toggle');
        Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy'])->name('discounts.destroy');

        // ROUTE MANAJEMEN USER (CRUD)
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/auth.php';