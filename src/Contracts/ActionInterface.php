<?php

namespace Wiki\Contracts;

interface ActionInterface
{
    public static function run(array $arguments):bool;
}