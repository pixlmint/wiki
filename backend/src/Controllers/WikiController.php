<?php


namespace App\Controllers;

use Nacho\Contracts\PageManagerInterface;
use Nacho\Controllers\AbstractController;
use Nacho\Models\HttpResponse;
use Nacho\Models\HttpResponseCode;

/**
 * Class WikiController
 */
class WikiController extends AbstractController
{
    private PageManagerInterface $pageManager;

    public function __construct(PageManagerInterface $pageManager)
    {
        parent::__construct();
        $this->pageManager = $pageManager;
    }

    // /api/entry/view
    public function loadEntry(): HttpResponse
    {
        $url = $_REQUEST['p'];
        $url = str_replace('%20', ' ', $url);
        $page = $this->pageManager->getPage($url);
        if (is_null($page)) {
            return $this->json(['message' => 'Unable to find Entry ' . $url], HttpResponseCode::NOT_FOUND);
        }
        $content = $this->pageManager->renderPage($page);
        $ret = ['content' => $content];
        $ret = array_merge($ret, (array)$page);

        return $this->json($ret);
    }
}