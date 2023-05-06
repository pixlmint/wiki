<?php

namespace App\Models;

use Nacho\Contracts\ArrayableInterface;

class ScaledMedia implements ArrayableInterface
{
    private string $scaleName;
    private string $fileExtension;

    public function __construct(string $scaleName, string $fileExtension)
    {
        $this->scaleName = $scaleName;
        $this->fileExtension = $fileExtension;
    }

    public function getScaleName(): string
    {
        return $this->scaleName;
    }

    public function getFileExtension(): string
    {
        return $this->fileExtension;
    }

    public function toArray(): array
    {
        return [
            'scale_name' => $this->scaleName,
            'file_extension' => $this->fileExtension,
        ];
    }
}