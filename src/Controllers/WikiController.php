<?php


namespace Wiki\Controllers;

use Nacho\Controllers\AbstractController;
use Nacho\Models\HttpResponseCode;

/**
 * Class WikiController
 */
class WikiController extends AbstractController
{
    public function loadEntry()
    {
        $url = $_REQUEST['p'];
        $page = $this->nacho->getMarkdownHelper()->getPage($url);
        if (is_bool($page)) {
            header('HTTP/1.1 ' . HttpResponseCode::NOT_FOUND);
            die();
        }
        $content = $this->nacho->getMarkdownHelper()->renderPage($page);
        $ret = ['content' => $content];
        $ret = array_merge($ret, $page);

        return $this->json($ret);
    }
}