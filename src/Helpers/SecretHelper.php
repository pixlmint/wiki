<?php

namespace App\Helpers;

class SecretHelper
{
    private static ?string $secret = null;

    public static function getSecret(): string
    {
        if (!self::$secret) {
            self::readSecret();
        }

        return self::$secret;
    }

    public static function setSecret(string $secret): void
    {
        self::$secret = $secret;
    }

    private static function readSecret(): void
    {
        $secretVar = '';
        if (is_file('.secret')) {
            $secretVar = file_get_contents('.secret');
        } else {
            $secretVar = getenv('SECRET');
        }

        if (!$secretVar) {
            throw new \Exception('SECRET is not defined');
        }

        self::$secret = $secretVar;
    }
}