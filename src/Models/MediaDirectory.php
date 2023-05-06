<?php

namespace App\Models;

class MediaDirectory
{
    private string $month;
    private string $day;

    public function __construct(string $month, string $day)
    {
        $this->month = $month;
        $this->day = $day;
    }

    public function getMonth(): string
    {
        return $this->month;
    }

    public function getDay(): string
    {
        return $this->day;
    }

    public function printDirectory(): string
    {
        return $this->month . DIRECTORY_SEPARATOR . $this->day;
    }
}