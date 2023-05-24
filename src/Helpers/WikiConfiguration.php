<?php

namespace App\Helpers;

use Nacho\Helpers\ConfigurationHelper;

class WikiConfiguration
{
    public static function mediaDir(): string
    {
        return self::getConfigValue('mediaDir');
    }

    public static function mediaBaseUrl(): string
    {
        return self::getConfigValue('mediaBaseUrl');
    }

    public static function title(): string
    {
        return self::getConfigValue('title');
    }

    public static function version(): string|int
    {
        return self::getConfigValue('version');
    }

    public static function contentDir(): string
    {
        return self::getConfigValue('contentDir');
    }

    private static function getConfigValue(string $confName): mixed
    {
        return ConfigurationHelper::getInstance()->getCustomConfig('wiki')[$confName];
    }
}