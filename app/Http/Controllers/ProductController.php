<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Halaman Kasir POS (Filter per Toko)
    public function index()
    {
        $storeId = auth()->user()->store_id;

        $products = Product::where('store_id', $storeId)->with(['category', 'supplier'])->latest()->get();
        $categories = Category::where('store_id', $storeId)->get();

        $today = date('Y-m-d');
        $activeDiscounts = Discount::where('store_id', $storeId)
            ->where('is_active', true)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->get();

        return Inertia::render('Pos/Index', [
            'products' => $products,
            'categories' => $categories,
            'activeDiscounts' => $activeDiscounts,
        ]);
    }

    // Halaman Kelola Produk Admin (Filter per Toko)
    public function manage()
    {
        $storeId = auth()->user()->store_id;

        $products = Product::where('store_id', $storeId)->with(['category', 'supplier'])->latest()->get();
        $categories = Category::where('store_id', $storeId)->get(); 
        $suppliers = Supplier::where('store_id', $storeId)->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('products')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                }),
            ],
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|url',
        ]);

        Product::create([
            'store_id' => $storeId,
            'name' => $request->name,
            'code' => $request->code,
            'category_id' => $request->category_id,
            'supplier_id' => $request->supplier_id,
            'cost_price' => $request->cost_price,
            'selling_price' => $request->selling_price,
            'stock' => $request->stock,
            'image' => $request->image,
        ]);

        return back()->with('success', 'Produk berhasil ditambahkan!');
    }

    public function update(Request $request, Product $product)
    {
        $storeId = auth()->user()->store_id;

        if ($product->store_id !== $storeId) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('products')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                })->ignore($product->id),
            ],
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|url',
        ]);

        $product->update([
            'name' => $request->name,
            'code' => $request->code,
            'category_id' => $request->category_id,
            'supplier_id' => $request->supplier_id,
            'cost_price' => $request->cost_price,
            'selling_price' => $request->selling_price,
            'stock' => $request->stock,
            'image' => $request->image,
        ]);

        return back()->with('success', 'Produk berhasil diperbarui!');
    }

    public function destroy(Product $product)
    {
        if ($product->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus!');
    }

    // --- MANAJEMEN KATEGORI ---

    public function categoriesIndex()
    {
        $storeId = auth()->user()->store_id;
        $categories = Category::where('store_id', $storeId)->withCount('products')->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    // Menyimpan Kategori Baru (Dilindungi dari null store_id)
    public function storeCategory(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return back()->withErrors(['error' => 'Gagal: Sesi akun tidak memiliki ID Toko.']);
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('categories')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                }),
            ],
        ]);

        Category::create([
            'store_id' => $storeId,
            'name' => $request->name,
        ]);

        return back()->with('success', 'Kategori berhasil ditambahkan!');
    }

    // Memperbarui Kategori
    public function updateCategory(Request $request, Category $category)
    {
        $storeId = auth()->user()->store_id;

        if ($category->store_id !== $storeId) {
            abort(403);
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('categories')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                })->ignore($category->id),
            ],
        ]);

        $category->update([
            'name' => $request->name,
        ]);

        return back()->with('success', 'Kategori berhasil diperbarui!');
    }

    // Menghapus Kategori dengan Proteksi Produk
    public function destroyCategory(Category $category)
    {
        $storeId = auth()->user()->store_id;

        if ($category->store_id !== $storeId) {
            abort(403);
        }

        if ($category->products()->count() > 0) {
            return back()->withErrors(['error' => 'Kategori tidak dapat dihapus karena masih memiliki produk!']);
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus!');
    }
}