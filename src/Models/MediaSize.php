<?php

namespace App\Models;

class MediaSize
{
    private int $height;
    private int $width;

    public function __construct(int $height, int $width)
    {
        $this->height = $height;
        $this->width = $width;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    public function getWidth(): int
    {
        return $this->width;
    }

    public function setHeight(int $height): void
    {
        $this->height = $height;
    }

    public function setWidth(int $width): void
    {
        $this->width = $width;
    }
}