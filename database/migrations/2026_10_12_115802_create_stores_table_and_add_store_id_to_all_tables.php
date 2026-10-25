<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Buat Tabel Stores
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // Kode unik toko
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        // 2. Tambahkan store_id ke tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 3. Tambahkan store_id ke tabel products
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 4. Tambahkan store_id ke tabel categories
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 5. Tambahkan store_id ke tabel suppliers
        Schema::table('suppliers', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 6. Tambahkan store_id ke tabel discounts
        Schema::table('discounts', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 7. Tambahkan store_id ke tabel transactions
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
        });

        // 8. Tambahkan store_id ke tabel purchases (jika ada)
        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        Schema::table('products', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        Schema::table('categories', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        Schema::table('suppliers', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        Schema::table('discounts', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        Schema::table('transactions', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) { $table->dropForeign(['store_id']); $table->dropColumn('store_id'); });
        }
        Schema::dropIfExists('stores');
    }
};