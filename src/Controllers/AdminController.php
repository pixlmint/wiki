<?php

include $_SERVER['DOCUMENT_ROOT'] . '/src/Controllers/AbstractController.php';

class AdminController extends AbstractController
{
    public function __construct()
    {
        if (!$this->isGranted('Editor')) {
            header('Http/1.1 401');
            echo('You are not allowed to view this part of the page. <a href="/">Return</a>');
            die();
        }
    }

    function index($request)
    {
        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => 'Please choose a file to edit',
            'js' => $this->render(VIEWS_DIR . '/includes/admin/js.php'),
            'nav' => $this->render(VIEWS_DIR . '/includes/admin/nav.php'),
            'css' => $this->render(VIEWS_DIR . '/includes/admin/css.php'),
        ]);
    }

    function edit($request)
    {
        if (key_exists('file', $_REQUEST)) {
            $url = $_SERVER['DOCUMENT_ROOT'] . '/' . urldecode($_REQUEST['file']);
        } elseif (key_exists('fulldir', $_REQUEST)) {
            $url = urldecode($_REQUEST['fulldir']);
        }

        if ($request->requestMethod === 'POST') {
            file_put_contents($_REQUEST['fulldir'], $_REQUEST['content']);
            header('content-type: application/json');
            return json_encode(['message' => 'successfully saved content']);
        }

        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => $this->render(VIEWS_DIR . '/includes/admin/edit/article.php', ['url' => $url]),
            'js' => $this->render(VIEWS_DIR . '/includes/admin/js.php', ['url' => $url]),
            'url' => $url,
            'nav' => $this->render(VIEWS_DIR . '/includes/admin/nav.php'),
            'css' => $this->render(VIEWS_DIR . '/includes/admin/css.php'),
        ]);
    }
}
