<?php

namespace App\Helpers\Media;

use App\Helpers\JournalConfiguration;
use App\Models\Media;
use App\Models\MediaDirectory;
use App\Models\Mime;
use Exception;

abstract class AbstractMediaHelper
{
    public function deleteMedia(Media $media, bool $dryRun = false): bool|array
    {
        $files = $this->getFilesToDelete($media);

        if ($dryRun) {
            return $files;
        }

        foreach ($files as $file) {
            unlink($file);
        }

        return true;
    }

    private function getFilesToDelete(Media $media): array
    {
        $ret = [];
        if (!is_file($media->getAbsolutePath())) {
            return $ret;
        } else {
            $ret[] = $media->getAbsolutePath();
        }

        foreach ($media->getAllScaled() as $scaled) {
            if (is_file($media->getAbsolutePath($scaled->getScaleName()))) {
                $ret[] = $media->getAbsolutePath($scaled->getScaleName());
            }
        }

        return $ret;
    }

    public function loadMedia(MediaDirectory $directory): array
    {
        $mediaDir = JournalConfiguration::mediaDir();
        $media = [];
        $dir = $directory->printDirectory();
        foreach (scandir("${mediaDir}/${dir}") as $file) {
            if ($file === '.' || $file === '..' || is_dir("${mediaDir}/${dir}/${file}")) {
                continue;
            }
            if ($this->isApplicableMediaMime("${mediaDir}/${dir}/${file}")) {
                $media[] = MediaFactory::run("${mediaDir}/${dir}/${file}", [$this]);
            }
        }

        return $media;
    }

    public static function generateFileName(array $file)
    {
        return sha1_file($file['tmp_name']) . $file['name'];
    }

    public static function getMimeType(): string
    {
        throw new Exception('Mime Type not defined');
    }

    protected function isApplicableMediaMime(string $file): bool
    {
        $fileMime = Mime::init(mime_content_type($file));
        $testMime = Mime::init(static::getMimeType());

        return MimeHelper::compareMimeTypes($testMime, $fileMime);
    }
}