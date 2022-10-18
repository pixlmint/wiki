<?php

namespace Wiki\Helpers;

use Exception;

class FileNameHelper
{
    public static function generateFileNameFromTitle(string $title)
    {
        return self::slugify($title) . '.md';
    }

    private static function slugify(string $text, string $divider = '-'): string
    {
        // replace non letter or digits by divider
        $text = preg_replace('~[^\pL\d]+~u', $divider, $text);

        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);

        // trim
        $text = trim($text, $divider);

        // remove duplicate divider
        $text = preg_replace('~-+~', $divider, $text);

        // lowercase
        $text = strtolower($text);

        if (empty($text)) {
            throw new Exception('File Name cannot be empty (' . $text . ')');
        }

        return $text;
    }
}