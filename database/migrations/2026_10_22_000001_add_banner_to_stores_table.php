<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Berisi link gambar (https://...) atau path file unggahan (banners/xxx.jpg)
            $table->string('banner', 2048)->nullable()->after('phone');
            // Tingkat gelap lapisan di atas banner, 0-80 (persen)
            $table->unsignedTinyInteger('banner_overlay')->default(45)->after('banner');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['banner', 'banner_overlay']);
        });
    }
};
