<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsBannerUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_banner_upload_uses_vercel_blob_when_configured(): void
    {
        $store = Store::create([
            'name' => 'Toko Uji',
            'code' => 'TOKOUJI1',
        ]);
        $admin = User::factory()->create([
            'store_id' => $store->id,
            'role' => 'admin',
        ]);
        $url = 'https://store123.public.blob.vercel-storage.com/banners/1/banner.jpg';

        config(['services.vercel_blob.token' => 'vercel_blob_rw_store123_test']);
        Http::fake([
            'https://vercel.com/api/blob/*' => Http::response(['url' => $url], 200),
        ]);

        $response = $this->actingAs($admin)
            ->from('/settings?tab=store')
            ->put('/settings/store', [
                'name' => 'Toko Uji',
                'address' => '',
                'phone' => '',
                'banner_mode' => 'upload',
                'banner_overlay' => 45,
                'banner_file' => UploadedFile::fake()->image('banner.jpg'),
            ]);

        $response->assertRedirect('/settings?tab=store');
        $this->assertSame("vercel-blob:{$url}", $store->refresh()->banner);
        Http::assertSent(fn (Request $request) => $request->method() === 'PUT'
            && str_starts_with($request->url(), 'https://vercel.com/api/blob/?pathname=')
            && $request->hasHeader('x-vercel-blob-store-id', 'store123')
            && $request->hasHeader('x-vercel-blob-access', 'public'));
    }

    public function test_banner_upload_failure_is_returned_as_a_validation_error(): void
    {
        $store = Store::create([
            'name' => 'Toko Uji',
            'code' => 'TOKOUJI2',
            'banner' => 'https://example.com/old-banner.jpg',
        ]);
        $admin = User::factory()->create([
            'store_id' => $store->id,
            'role' => 'admin',
        ]);

        config(['services.vercel_blob.token' => 'vercel_blob_rw_store123_test']);
        Http::fake([
            'https://vercel.com/api/blob/*' => Http::response(['error' => 'upload failed'], 500),
        ]);

        $response = $this->actingAs($admin)
            ->from('/settings?tab=store')
            ->put('/settings/store', [
                'name' => 'Toko Uji',
                'address' => '',
                'phone' => '',
                'banner_mode' => 'upload',
                'banner_overlay' => 45,
                'banner_file' => UploadedFile::fake()->image('banner.jpg'),
            ]);

        $response->assertRedirect('/settings?tab=store')->assertSessionHasErrors('banner_file');
        $this->assertSame('https://example.com/old-banner.jpg', $store->refresh()->banner);
    }

    public function test_banner_upload_keeps_local_storage_for_non_production_environments(): void
    {
        $store = Store::create([
            'name' => 'Toko Uji',
            'code' => 'TOKOUJI3',
        ]);
        $admin = User::factory()->create([
            'store_id' => $store->id,
            'role' => 'admin',
        ]);

        config(['services.vercel_blob.token' => null]);
        Storage::fake('public');

        $response = $this->actingAs($admin)
            ->from('/settings?tab=store')
            ->put('/settings/store', [
                'name' => 'Toko Uji',
                'address' => '',
                'phone' => '',
                'banner_mode' => 'upload',
                'banner_overlay' => 45,
                'banner_file' => UploadedFile::fake()->image('banner.jpg'),
            ]);

        $response->assertRedirect('/settings?tab=store');
        $this->assertStringStartsWith('banners/', $store->refresh()->banner);
        Storage::disk('public')->assertExists($store->banner);
    }
}
