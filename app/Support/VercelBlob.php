<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use UnexpectedValueException;

class VercelBlob
{
    private const API_URL = 'https://vercel.com/api/blob';

    private const STORED_URL_PREFIX = 'vercel-blob:';

    public function configured(): bool
    {
        return filled(config('services.vercel_blob.token'));
    }

    public function upload(UploadedFile $file, int $storeId): string
    {
        $token = config('services.vercel_blob.token');
        $pathname = "banners/{$storeId}/".Str::uuid().'.'.$file->extension();
        $url = self::API_URL.'/?'.http_build_query(['pathname' => $pathname]);

        $response = Http::withToken($token)
            ->withHeaders($this->apiHeaders($token) + [
                'x-vercel-blob-access' => 'public',
                'x-add-random-suffix' => '1',
                'x-content-type' => $file->getMimeType(),
            ])
            ->withBody($file->get(), 'application/octet-stream')
            ->timeout(20)
            ->put($url)
            ->throw();

        $blobUrl = $response->json('url');
        $host = is_string($blobUrl) ? parse_url($blobUrl, PHP_URL_HOST) : null;

        if (
            ! is_string($blobUrl)
            || ! str_starts_with($blobUrl, 'https://')
            || ! is_string($host)
            || ! str_ends_with($host, '.public.blob.vercel-storage.com')
        ) {
            throw new UnexpectedValueException('Vercel Blob returned an invalid public URL.');
        }

        return self::STORED_URL_PREFIX.$blobUrl;
    }

    public function isStoredUrl(?string $value): bool
    {
        return is_string($value) && str_starts_with($value, self::STORED_URL_PREFIX);
    }

    public function publicUrl(string $value): string
    {
        return substr($value, strlen(self::STORED_URL_PREFIX));
    }

    public function delete(string $value): void
    {
        $token = config('services.vercel_blob.token');

        Http::withToken($token)
            ->withHeaders($this->apiHeaders($token))
            ->timeout(10)
            ->post(self::API_URL.'/delete', [
                'urls' => [$this->publicUrl($value)],
            ])
            ->throw();
    }

    private function storeId(string $token): string
    {
        return explode('_', $token)[3] ?? '';
    }

    private function apiHeaders(string $token): array
    {
        return [
            'x-api-version' => '13',
            'x-vercel-blob-store-id' => $this->storeId($token),
            'x-api-blob-request-id' => (string) Str::uuid(),
            'x-api-blob-request-attempt' => '0',
        ];
    }
}
