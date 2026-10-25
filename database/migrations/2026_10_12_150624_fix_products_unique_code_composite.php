<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop index unique lama yang hanya mengunci kolom code
            $table->dropUnique('products_code_unique');

            // Buat composite unique index baru: kombinasi store_id + code
            $table->unique(['store_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['store_id', 'code']);
            $table->unique('code');
        });
    }
};