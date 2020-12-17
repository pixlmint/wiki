<?php


namespace Wiki\Controllers;

/**
 * Class WikiController
 */
class WikiController extends AbstractController
{
    public function loadEntry()
    {
        $url = 'http://localhost:90' . $_SERVER['REQUEST_URI'];
        $page = $this->wiki->getPage($url);
        if (is_bool($page)) {
            header('HTTP/1.1 404');
            die();
        }
        return $this->wiki->renderPage($page);
    }
}