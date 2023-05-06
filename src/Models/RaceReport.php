<?php

namespace App\Models;

class RaceReport
{
    public string $distance;
    public string $time;
    public string $pace;
    public int $bpm;
    public int $calories;

    public function __construct(?array $data = [])
    {
        foreach($data as $key => $value) {
            if (!is_null($value)) {
                $this->$key = $value;
            }
        }
    }
}