<?php

namespace App\Helpers;

use Exception;

class FileNameHelper
{
    public static function generateFileNameFromTitle(string $title): string
    {
        return self::slugify($title) . '.md';
    }

    public static function slugify(string $text, string $divider = '-'): string
    {
        // replace non letter or digits by divider
        $text = preg_replace('~[^\pL\d]+~u', $divider, $text);

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