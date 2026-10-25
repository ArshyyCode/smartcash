<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $storeId = auth()->user()->store_id;

        $purchases = Purchase::where('store_id', $storeId)
            ->with(['supplier', 'user', 'details.product'])
            ->latest()
            ->get();

        $suppliers = Supplier::where('store_id', $storeId)->get();
        $products = Product::where('store_id', $storeId)->get();

        // Ambil produk yang stoknya 10 atau kurang KHUSUS toko ini
        $lowStockProducts = Product::where('store_id', $storeId)
            ->where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->get();

        $totalExpenditure = Purchase::where('store_id', $storeId)->sum('total_purchase');

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'products' => $products,
            'lowStockProducts' => $lowStockProducts,
            'totalExpenditure' => $totalExpenditure,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_code' => 'required|string|max:50|unique:purchases,purchase_code',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $totalPurchase = 0;
            foreach ($request->items as $item) {
                $totalPurchase += $item['qty'] * $item['cost_price'];
            }

            // Simpan Header Pembelian dengan store_id
            $purchase = Purchase::create([
                'store_id' => $storeId,
                'supplier_id' => $request->supplier_id,
                'user_id' => auth()->id(),
                'purchase_code' => $request->purchase_code,
                'total_purchase' => $totalPurchase,
            ]);

            // Simpan Detail Item
            foreach ($request->items as $item) {
                $subtotal = $item['qty'] * $item['cost_price'];

                PurchaseDetail::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'cost_price' => $item['cost_price'],
                    'subtotal' => $subtotal,
                ]);

                // Update stok & harga modal produk khusus produk toko tersebut
                $product = Product::where('store_id', $storeId)->findOrFail($item['product_id']);
                $product->stock += $item['qty'];
                $product->cost_price = $item['cost_price'];
                $product->save();
            }

            DB::commit();

            return back()->with('success', 'Restock barang berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memproses restock: ' . $e->getMessage()]);
        }
    }
}