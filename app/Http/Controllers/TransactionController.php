<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'total_pay' => 'required|numeric',
            'cart' => 'required|array',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.qty' => 'required|integer|min:1',
            'discount_id' => 'nullable|exists:discounts,id',
        ]);

        $storeId = auth()->user()->store_id;

        DB::beginTransaction();
        try {
            $grossTotal = 0;
            foreach ($request->cart as $item) {
                $product = Product::where('store_id', $storeId)->findOrFail($item['id']);
                if ($product->stock < $item['qty']) {
                    return back()->withErrors(['message' => "Stok produk {$product->name} tidak mencukupi!"]);
                }
                $grossTotal += $product->selling_price * $item['qty'];
            }

            $discountAmount = 0;
            $selectedDiscountId = null;

            if ($request->discount_id) {
                $discount = Discount::where('store_id', $storeId)->find($request->discount_id);
                if ($discount && $discount->is_active) {
                    if ($grossTotal >= $discount->min_purchase) {
                        $selectedDiscountId = $discount->id;
                        if ($discount->type === 'percentage') {
                            $discountAmount = ($grossTotal * $discount->value) / 100;
                        } else {
                            $discountAmount = $discount->value;
                        }
                    } else {
                        return back()->withErrors(['message' => "Total belanja belum mencapai minimal syarat diskon!"]);
                    }
                }
            }

            $totalPrice = max(0, $grossTotal - $discountAmount);

            if ($request->total_pay < $totalPrice) {
                return back()->withErrors(['message' => 'Uang pembayaran kurang!']);
            }

            // Simpan dengan store_id
            $transaction = Transaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'invoice_code' => 'TRX-' . date('YmdHis'),
                'total_price' => $totalPrice,
                'total_pay' => $request->total_pay,
                'change' => $request->total_pay - $totalPrice,
                'status' => 'selesai',
            ]);

            foreach ($request->cart as $item) {
                $product = Product::where('store_id', $storeId)->findOrFail($item['id']);
                
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'discount_id' => $selectedDiscountId,
                    'cost_price' => $product->cost_price,
                    'qty' => $item['qty'],
                    'unit_price' => $product->selling_price,
                    'subtotal' => $product->selling_price * $item['qty'],
                ]);

                $product->decrement('stock', $item['qty']);
            }

            DB::commit();
            return back()->with('success', 'Transaksi berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Terjadi kesalahan saat memproses transaksi: ' . $e->getMessage()]);
        }
    }

    public function reports(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $query = Transaction::where('store_id', $storeId)->with(['user', 'details.product']);

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $transactions = $query->latest()->get();

        $totalRevenue = $transactions->where('status', '!=', 'batal')->sum('total_price');
        $totalTransactions = $transactions->where('status', '!=', 'batal')->count();

        $chartQuery = Transaction::where('store_id', $storeId)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            )
            ->where('status', '!=', 'batal');

        if ($request->filled('start_date')) {
            $chartQuery->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $chartQuery->whereDate('created_at', '<=', $request->end_date);
        }

        $chartData = $chartQuery->groupBy('date')->orderBy('date', 'ASC')->get();

        return Inertia::render('Reports/Index', [
            'transactions' => $transactions,
            'totalRevenue' => $totalRevenue,
            'totalTransactions' => $totalTransactions,
            'chartData' => $chartData,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function cancel(Transaction $transaction)
    {
        if ($transaction->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        if ($transaction->status === 'batal') {
            return back()->withErrors(['message' => 'Transaksi ini sudah pernah dibatalkan!']);
        }

        if ($transaction->created_at->lt(now()->subDay())) {
            return back()->withErrors(['message' => 'Transaksi sudah lebih dari 1 hari dan tidak dapat direfund!']);
        }

        DB::beginTransaction();
        try {
            foreach ($transaction->details as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->increment('stock', $detail->qty);
                }
            }

            $transaction->update(['status' => 'batal']);

            DB::commit();
            return back()->with('success', 'Transaksi berhasil dibatalkan dan stok dikembalikan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Gagal membatalkan transaksi: ' . $e->getMessage()]);
        }
    }
}