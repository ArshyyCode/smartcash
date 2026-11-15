<?php

namespace Tests\Unit;

use App\Support\VercelBlob;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VercelBlobTest extends TestCase
{
    public function test_it_uploads_a_public_banner_and_returns_a_managed_url(): void
    {
        config(['services.vercel_blob.token' => 'vercel_blob_rw_store123_test']);
        Http::fake([
            'https://vercel.com/api/blob/*' => Http::response([
                'url' => 'https://store123.public.blob.vercel-storage.com/banners/1/banner.jpg',
            ]),
        ]);

        $blob = app(VercelBlob::class);
        $storedUrl = $blob->upload(UploadedFile::fake()->image('banner.jpg'), 1);

        $this->assertSame(
            'vercel-blob:https://store123.public.blob.vercel-storage.com/banners/1/banner.jpg',
            $storedUrl,
        );
        Http::assertSent(fn (Request $request) => $request->method() === 'PUT'
            && str_starts_with($request->url(), 'https://vercel.com/api/blob/?pathname=')
            && $request->hasHeader('x-vercel-blob-store-id', 'store123')
            && $request->hasHeader('x-vercel-blob-access', 'public'));
    }

    public function test_it_deletes_only_the_url_marked_as_a_managed_banner(): void
    {
        config(['services.vercel_blob.token' => 'vercel_blob_rw_store123_test']);
        Http::fake();

        $blob = app(VercelBlob::class);
        $storedUrl = 'vercel-blob:https://store123.public.blob.vercel-storage.com/banners/1/banner.jpg';

        $this->assertTrue($blob->isStoredUrl($storedUrl));
        $blob->delete($storedUrl);

        Http::assertSent(fn (Request $request) => $request->method() === 'POST'
            && $request->url() === 'https://vercel.com/api/blob/delete'
            && $request->data()['urls'] === [
                'https://store123.public.blob.vercel-storage.com/banners/1/banner.jpg',
            ]);
    }
}
