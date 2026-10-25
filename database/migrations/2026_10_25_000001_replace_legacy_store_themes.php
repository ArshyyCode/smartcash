<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Tema "zamrud" dan "senja" diganti oleh "bumi" dan "noir".
     * Toko yang masih memakai tema lama dikembalikan ke tema bawaan (samudra).
     */
    public function up(): void
    {
        DB::table('stores')
            ->whereIn('theme', ['zamrud', 'senja'])
            ->update(['theme' => 'samudra']);
    }

    public function down(): void
    {
        // tidak ada yang perlu dikembalikan
    }
};
