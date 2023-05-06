<?php

namespace App\Controllers;

use Nacho\Controllers\AbstractController;

class FrontendController extends AbstractController
{
    public function index(): string
    {
        return file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/dist/index.html');
    }
}