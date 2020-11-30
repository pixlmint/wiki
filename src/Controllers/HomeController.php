<?php
namespace Wiki\Controllers;

use Wiki\Controllers\AbstractController;
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
        $pages = $this->wiki->getPages();
        $this->navRenderer->onPagesLoaded($pages);
        print_r($this->navRenderer->getItems());
        print_r($this->navRenderer->nestedPages($this->wiki->getPages()));

        return '{"foo": "bar"}';
    }
}
