<?php

namespace App\Helpers\Media;

use App\Models\Mime;

class MimeHelper
{
    // Checks if 2 mime types match. This will match mime/* with mime/container
    public static function compareMimeTypes(Mime $controlMime, Mime $toCheckMime): bool
    {
        if (self::isSameMime($controlMime, $toCheckMime)) {
            return true;
        }

        if ($controlMime->isAnyType()) {
            return true;
        }

        if (!self::isSameType($controlMime, $toCheckMime)) {
            return false;
        }

        if ($controlMime->getType() === $toCheckMime->getType()) {
            if ($controlMime->isAnyContainer()) {
                return true;
            }
        }

        return false;
    }

    private static function isSameMime(Mime $mime1, Mime $mime2): bool
    {
        return $mime1->printMime() === $mime2->printMime();
    }

    private static function isSameType(Mime $mime1, Mime $mime2): bool
    {
        return $mime1->getType() === $mime2->getType();
    }
}