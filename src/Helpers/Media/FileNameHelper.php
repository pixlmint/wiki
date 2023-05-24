<?php

namespace App\Helpers\Media;

class FileNameHelper
{
    public static function extensionMatches(string $filename, array $applicableExtensions): bool
    {
        foreach ($applicableExtensions as $ext) {
            if (str_ends_with($filename, $ext)) {
                return true;
            }
        }

        return false;
    }
}
