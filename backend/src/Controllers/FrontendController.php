<?php

namespace App\Controllers;

use Nacho\Controllers\AbstractController;
use Nacho\Models\HttpResponse;

class FrontendController extends AbstractController
{
    public function index(): HttpResponse
    {
        $content = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/dist/index.html');
        return new HttpResponse($content);
    }
}