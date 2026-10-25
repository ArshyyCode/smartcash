<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SmartCashSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'Ayyub Rashif',
                'username' => 'admin',
                'email' => 'admin@smartcash.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Fernando Gandhi',
                'username' => 'kasir1',
                'email' => 'kasir1@smartcash.com',
                'password' => Hash::make('password'),
                'role' => 'kasir',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 2. Categories
        DB::table('categories')->insert([
            ['id' => 1, 'name' => 'Makanan', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Minuman', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Alat Tulis', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Suppliers
        DB::table('suppliers')->insert([
            ['id' => 1, 'name' => 'Distributor Snack Utama', 'phone' => '081234567890', 'address' => 'Jl. Merdeka No. 12', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'CV Agen Alat Tulis', 'phone' => '085678901234', 'address' => 'Jl. Pemuda No. 45', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Products
        DB::table('products')->insert([
            ['id' => 1, 'category_id' => 1, 'supplier_id' => 1, 'code' => 'BRG-001', 'name' => 'Roti Bakery Kasur', 'cost_price' => 6000, 'selling_price' => 8000, 'stock' => 50, 'image' => 'roti.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'category_id' => 1, 'supplier_id' => 1, 'code' => 'BRG-002', 'name' => 'Keripik Singkong 100g', 'cost_price' => 4000, 'selling_price' => 5000, 'stock' => 40, 'image' => 'keripik.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'category_id' => 1, 'supplier_id' => 1, 'code' => 'BRG-003', 'name' => 'Indomie Goreng', 'cost_price' => 2800, 'selling_price' => 3500, 'stock' => 100, 'image' => 'indomie.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'category_id' => 1, 'supplier_id' => 1, 'code' => 'BRG-004', 'name' => 'Wafer Cokelat 50g', 'cost_price' => 2000, 'selling_price' => 3000, 'stock' => 60, 'image' => 'wafer.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'category_id' => 2, 'supplier_id' => 1, 'code' => 'BRG-005', 'name' => 'Air Mineral 600ml', 'cost_price' => 2000, 'selling_price' => 3000, 'stock' => 120, 'image' => 'air_mineral.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'category_id' => 2, 'supplier_id' => 1, 'code' => 'BRG-006', 'name' => 'Teh Kotak 300ml', 'cost_price' => 3500, 'selling_price' => 4500, 'stock' => 80, 'image' => 'teh_kotak.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'category_id' => 2, 'supplier_id' => 1, 'code' => 'BRG-007', 'name' => 'Susu UHT Cokelat 200ml', 'cost_price' => 4500, 'selling_price' => 6000, 'stock' => 50, 'image' => 'susu.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'category_id' => 3, 'supplier_id' => 2, 'code' => 'BRG-008', 'name' => 'Buku Tulis A5 38 Lembar', 'cost_price' => 3000, 'selling_price' => 4000, 'stock' => 150, 'image' => 'buku_tulis.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'category_id' => 3, 'supplier_id' => 2, 'code' => 'BRG-009', 'name' => 'Pulpen Hitam 0.5mm', 'cost_price' => 1500, 'selling_price' => 2500, 'stock' => 200, 'image' => 'pulpen.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'category_id' => 3, 'supplier_id' => 2, 'code' => 'BRG-010', 'name' => 'Pensil 2B', 'cost_price' => 1500, 'selling_price' => 2000, 'stock' => 100, 'image' => 'pensil.jpg', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Discounts
        DB::table('discounts')->insert([
            [
                'id' => 1, 
                'name' => 'Tanpa Diskon', 
                'type' => 'fixed', 
                'value' => 0, 
                'min_purchase' => 0,
                'start_date' => '2026-01-01', 
                'end_date' => '2030-12-31', 
                'is_active' => true,
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'id' => 2, 
                'name' => 'Diskon Promo Siswa 10%', 
                'type' => 'percentage', 
                'value' => 10, 
                'min_purchase' => 20000, // Minimal Belanja Rp 20.000
                'start_date' => '2026-10-01', 
                'end_date' => '2026-10-31', 
                'is_active' => true,
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);

        // 6. Transactions & Details
        DB::table('transactions')->insert([
            ['id' => 1, 'user_id' => 2, 'invoice_code' => 'TRX-20261003-001', 'total_price' => 8000, 'total_pay' => 10000, 'change' => 2000, 'status' => 'selesai', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('transaction_details')->insert([
            ['id' => 1, 'transaction_id' => 1, 'product_id' => 1, 'discount_id' => null, 'cost_price' => 6000, 'qty' => 1, 'unit_price' => 8000, 'subtotal' => 8000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}