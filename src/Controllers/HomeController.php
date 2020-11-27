<?php
namespace Wiki\Controllers;

use Wiki\Controllers\AbstractController;

class HomeController extends AbstractController
{
    public function index($request)
    {
        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => $this->render(VIEWS_DIR . '/includes/home/article.php'),
            'footer' => $this->render(VIEWS_DIR . '/includes/home/footer.php'),
            'js' => $this->render(VIEWS_DIR . '/includes/home/js.php'),
        ]);
    }
}
