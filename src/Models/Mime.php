<?php

namespace App\Models;

class Mime
{
    private string $type;
    private string $container;

    public function __construct(string $type, string $container)
    {
        $this->type = $type;
        $this->container = $container;
    }

    public static function init(string $mime): Mime
    {
        $splMime = explode('/', $mime);
        if (count($splMime) < 2) {
            throw new \Exception($mime . ' is not a valid mime type');
        }

        return new Mime($splMime[0], $splMime[1]);
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getContainer(): string
    {
        return $this->container;
    }

    public function isAnyType(): bool
    {
        return $this->type === '*';
    }

    public function isAnyContainer(): bool
    {
        return $this->container === '*';
    }

    public function printMime(): string
    {
        return $this->type . '/' . $this->container;
    }
}