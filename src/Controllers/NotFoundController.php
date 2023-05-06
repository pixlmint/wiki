<?php

namespace App\Controllers;

use Nacho\Controllers\AbstractController;

class NotFoundController extends AbstractController
{
    function index()
    {
        return $this->json(['message' => 'Route not found'], 404);
    }
}