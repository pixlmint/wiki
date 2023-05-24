<?php

namespace App\Models;

use Nacho\Contracts\ArrayableInterface;
use Nacho\ORM\AbstractModel;
use Nacho\ORM\ModelInterface;
use Nacho\ORM\TemporaryModel;

class Cache extends AbstractModel implements ModelInterface, ArrayableInterface
{
    private string $renderDate;
    private array $content = [];

    public static function init(TemporaryModel $data, int $id): ModelInterface
    {
        return new Cache($data->get('renderDate'), $data->get('content')->asArray());
    }

    public function __construct(string $renderDate, array $content)
    {
        $this->id = 1;
        $this->renderDate = $renderDate;
        $this->content = $content;
    }

    public function toArray(): array
    {
        return [
            'renderDate' => $this->renderDate,
            'content' => $this->content,
        ];
    }

    public function getContent(): array
    {
        return $this->content;
    }

    public function getRenderDate(): string
    {
        return $this->renderDate;
    }
}