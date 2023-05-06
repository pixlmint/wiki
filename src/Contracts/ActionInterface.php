<?php

namespace App\Contracts;

interface ActionInterface
{
    public static function run(array $arguments):bool;
}