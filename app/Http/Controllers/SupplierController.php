<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $storeId = auth()->user()->store_id;

        // Hanya ambil supplier milik toko yang sedang login
        $suppliers = Supplier::where('store_id', $storeId)->latest()->get();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
        ]);

        Supplier::create([
            'store_id' => auth()->user()->store_id, // Kunci ke store_id toko aktif
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return back()->with('success', 'Supplier berhasil ditambahkan!');
    }

    public function update(Request $request, Supplier $supplier)
    {
        // Pastikan supplier milik toko yang sama
        if ($supplier->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
        ]);

        $supplier->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return back()->with('success', 'Supplier berhasil diperbarui!');
    }

    public function destroy(Supplier $supplier)
    {
        // Pastikan supplier milik toko yang sama
        if ($supplier->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $supplier->delete();

        return back()->with('success', 'Supplier berhasil dihapus!');
    }
}