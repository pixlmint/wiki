<?php

namespace App\Helpers;

use Nacho\Helpers\ConfigurationHelper;

class JournalConfiguration
{
    public static function mediaDir(): string
    {
        return self::getConfigValue('mediaDir');
    }

    public static function mediaBaseUrl(): string
    {
        return self::getConfigValue('mediaBaseUrl');
    }

    public static function year(): string|int
    {
        return self::getConfigValue('year');
    }

    public static function version(): string|int
    {
        return self::getConfigValue('version');
    }

    private static function getConfigValue(string $confName): mixed
    {
        return ConfigurationHelper::getInstance()->getCustomConfig('journal')[$confName];
    }
}