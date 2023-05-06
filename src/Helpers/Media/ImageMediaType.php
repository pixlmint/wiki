<?php

namespace App\Helpers\Media;

use App\Contracts\MediaProcessor;
use App\Helpers\JournalConfiguration;
use App\Models\Media;
use App\Models\MediaDirectory;
use App\Models\ScaledMedia;

class ImageMediaType extends AbstractMediaHelper implements MediaProcessor
{
    public static function getDefaultSizes(): array
    {
        return [100, 500, 1080];
    }

    public static function getMimeType(): string
    {
        return 'image/*';
    }

    public static function getName(): string
    {
        return 'Images';
    }

    public function getDefaultScaled(): string
    {
        return '1080';
    }

    public static function getScaledExtension(): string
    {
        return 'webp';
    }

    public static function getApplicableExtensions(): array
    {
        return ['jpg', 'jpeg', 'webp', 'png'];
    }

    public function deleteMedia(Media $media, bool $dryRun = false): bool|array
    {
        return parent::deleteMedia($media, $dryRun);
    }

    /**
     * @return array|Media[]
     */
    public function loadMedia(MediaDirectory $directory): array
    {
        return parent::loadMedia($directory);
    }

    public function storeMedia(array $file, MediaDirectory $directory): Media
    {
        $media = new Media(self::generateFileName($file), $directory);

        $this->outputFile($file['tmp_name'], $media);

        $media = $this->scale($media);

        return $media;
    }

    protected function outputFile(string $mediaPath, Media $media)
    {
        // Rotate Image
        $image = imagecreatefromjpeg($mediaPath);
        $exif = exif_read_data($mediaPath);
        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 8:
                    $image = imagerotate($image, 90, 0);
                    break;
                case 3:
                    $image = imagerotate($image, 180, 0);
                    break;
                case 6:
                    $image = imagerotate($image, -90, 0);
                    break;
            }
        }

        // Save rotated image
        imagewebp($image, $media->getAbsolutePath());
    }

    protected function scale(Media $media): Media
    {
        foreach ($this::getDefaultSizes() as $size) {
            $media->addScaled(new ScaledMedia($size, 'webp'));
            $this->compressImage($media, $size);
        }

        return $media;
    }

    private function compressImage(Media $media, int $size): void
    {
        $targetDirectory = $media->getAbsoluteDirectory($size);

        if (!is_dir($targetDirectory)) {
            mkdir($targetDirectory, 0777, true);
        }

        $targetPath = implode(DIRECTORY_SEPARATOR, [$targetDirectory, $media->getName() . '.' . $media->getScaled($size)->getFileExtension()]);

        // Scale down image
        $imgObject = imagecreatefromstring(file_get_contents($media->getAbsolutePath()));
        $scaled = imagescale($imgObject, $size);

        // Save scaled down version in new path
        imagewebp($scaled, $targetPath);
    }
}
