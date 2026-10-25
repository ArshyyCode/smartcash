<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index()
    {
        $storeId = auth()->user()->store_id;
        $discounts = Discount::where('store_id', $storeId)->latest()->get();

        return Inertia::render('Discounts/Index', [
            'discounts' => $discounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        Discount::create([
            'store_id' => auth()->user()->store_id, // Kunci store_id
            'name' => $request->name,
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase' => $request->min_purchase ?? 0,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => $request->is_active ?? true,
        ]);

        return back()->with('success', 'Program diskon berhasil dibuat!');
    }

    public function update(Request $request, Discount $discount)
    {
        if ($discount->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $discount->update([
            'name' => $request->name,
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase' => $request->min_purchase ?? 0,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_active' => $request->is_active,
        ]);

        return back()->with('success', 'Data diskon berhasil diperbarui!');
    }

    public function toggleStatus(Discount $discount)
    {
        if ($discount->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $discount->update([
            'is_active' => !$discount->is_active,
        ]);

        return back()->with('success', 'Status diskon berhasil diubah!');
    }

    public function destroy(Discount $discount)
    {
        if ($discount->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $discount->delete();

        return back()->with('success', 'Program diskon berhasil dihapus!');
    }
}