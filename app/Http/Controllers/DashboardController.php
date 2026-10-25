<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Store;
use App\Models\Transaction;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $storeId = $user->store_id;
        $store = Store::find($storeId);

        // Statistik Ringkasan Finansial & Operasional
        // Transaksi yang dibatalkan TIDAK dihitung (omzet, jumlah struk, dan daftar terbaru)
        $totalProducts = Product::where('store_id', $storeId)->count();
        $totalTransactions = $this->notCancelled(Transaction::where('store_id', $storeId))->count();
        $totalSales = $this->notCancelled(Transaction::where('store_id', $storeId))->sum('total_price');

        // 5 Transaksi Terbaru (tanpa yang dibatalkan)
        $recentTransactions = $this->notCancelled(Transaction::where('store_id', $storeId))
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        // Peringatan Stok Menipis (Stok <= 10)
        $lowStockProducts = Product::where('store_id', $storeId)
            ->where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'store' => $store,
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalTransactions' => $totalTransactions,
                'totalSales' => $totalSales,
            ],
            'recentTransactions' => $recentTransactions,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }

    /**
     * Saring transaksi yang belum dibatalkan.
     * Status NULL tetap dianggap valid agar transaksi lama (sebelum ada kolom status) ikut terhitung.
     */
    private function notCancelled($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('status')->orWhere('status', '!=', 'batal');
        });
    }

    // Catatan: updateStoreCode() dipindahkan ke SettingsController::updateStoreCode()
}