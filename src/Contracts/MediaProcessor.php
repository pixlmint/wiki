<?php

namespace App\Contracts;

use App\Models\Media;
use App\Models\MediaDirectory;

interface MediaProcessor
{
    public static function getMimeType(): string;

    public static function getName(): string;

    public static function getApplicableExtensions(): array;

    public static function getDefaultSizes(): array;

    public static function getScaledExtension(): string;

    public function getDefaultScaled(): string;

    public function deleteMedia(Media $media, bool $dryRun): bool|array;

    public function storeMedia(array $file, MediaDirectory $directory): Media;

    public function loadMedia(MediaDirectory $directory): array;
}