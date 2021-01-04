<?php


namespace Wiki\Controllers;

/**
 * Class WikiController
 */
class WikiController extends AbstractController
{
    public function loadEntry()
    {
        $url = $_REQUEST['p'];
        $page = $this->wiki->getPage($url);
        if (is_bool($page)) {
            header('HTTP/1.1 404');
            die();
        }
        $content = $this->wiki->renderPage($page);
        $ret = ['content' => base64_encode($content)];
        $ret = array_merge($ret, $page);

        return json_encode($ret);
    }
}