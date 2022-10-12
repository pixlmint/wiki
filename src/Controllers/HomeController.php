<?php
namespace Wiki\Controllers;

use Wiki\Helpers\NavRenderer;
use Nacho\Nacho;
use Nacho\Controllers\AbstractController;

class HomeController extends AbstractController
{
    private $navRenderer;

    public function __construct(Nacho $wiki)
    {
        parent::__construct($wiki);
        $this->navRenderer = new NavRenderer($wiki);
    }

    public function index($request)
    {
        return file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/dist/index.html');
    }

    public function loadNav($request)
    {
        return $this->json($this->navRenderer->output());
    }
}
