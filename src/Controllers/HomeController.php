<?php
namespace Wiki\Controllers;

use Wiki\Helpers\NavRenderer;
use Wiki\Wiki;

class HomeController extends AbstractController
{
    private $navRenderer;

    public function __construct(Wiki $wiki)
    {
        parent::__construct($wiki);
        $this->navRenderer = new NavRenderer($wiki);
    }

    public function index($request)
    {
        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => $this->render(VIEWS_DIR . '/includes/home/article.php'),
            'footer' => $this->render(VIEWS_DIR . '/includes/home/footer.php'),
            'js' => $this->render(VIEWS_DIR . '/includes/home/js.php'),
        ]);
    }

    public function loadNav($request)
    {
        return $this->navRenderer->output();
    }
}
