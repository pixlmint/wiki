<?php

namespace Wiki\Controllers;

use DateTime;
use Nacho\Nacho;
use Nacho\Controllers\AbstractController;
use Wiki\Helpers\NavRenderer;

class AdminController extends AbstractController
{
    public function __construct(Nacho $wiki)
    {
        parent::__construct($wiki);
        if (!$this->isGranted('Editor')) {
            header('Http/1.1 401');
            echo 'You are not allowed to view this part of the page. <a href="/">Return</a>';
            die();
        }
    }

    function index($request)
    {
        return $this->render('admin/admin.twig');
    }

    public function delete($request)
    {
        function returnHome()
        {
            header('Location: /admin');
            header('HTTP/1.1 302');
        }
        if (key_exists('file', $_REQUEST)) {
            $file = $_REQUEST['file'];
        } elseif (key_exists('dir', $_REQUEST)) {
            $file = $_REQUEST['dir'];
        } else {
            returnHome();
        }
        if (
            substr($file, 0, strlen($_SERVER['DOCUMENT_ROOT'])) !==
            $_SERVER['DOCUMENT_ROOT']
        ) {
            returnHome();
        }

        function rmdirRecursive($dir)
        {
            foreach (scandir($dir) as $sub) {
                if ($sub !== '.' && $sub !== '..') {
                    $newDir = $dir . '/' . $sub;
                    if (is_file($newDir)) {
                        unlink($newDir);
                    } elseif (is_dir($newDir)) {
                        rmdirRecursive($newDir);
                    }
                }
            }
            rmdir($dir);
        }

        if (is_file($file)) {
            unlink($file);
        } elseif (is_dir($file)) {
            rmdirRecursive($file);
        }
        returnHome();
    }

    public function add($request)
    {
        if (strtolower($request->requestMethod) === 'post') {
            $date = new DateTime();
            $content =
                "---\ntitle: " .
                $_REQUEST['filename'] .
                "\ndate: " .
                $date->format('Y-m-d H:i') .
                "\n---";
            $file = CONTENT_DIR . '/' . $_REQUEST['filename'];
            $parentDir = explode('/', $_REQUEST['filename']);
            array_pop($parentDir);
            $createdDirs = '';
            foreach ($parentDir as $newDir) {
                if (!is_dir(CONTENT_DIR . '/' . $createdDirs . '/' . $newDir)) {
                    mkdir(CONTENT_DIR . '/' . $createdDirs . '/' . $newDir);
                }
                if ($createdDirs) {
                    $createdDirs .= '/';
                }
                $createdDirs .= $newDir;
            }
            file_put_contents($file, $content);
            header('Location: /admin/edit?fulldir=' . $file);
            header('HTTP/1.1 302');
        }

        return $this->render('admin/add.twig');
    }

    function edit($request)
    {
        if (key_exists('file', $_REQUEST)) {
            $url =
                $_SERVER['DOCUMENT_ROOT'] . '/' . urldecode($_REQUEST['file']);
        } elseif (key_exists('fulldir', $_REQUEST)) {
            $url = urldecode($_REQUEST['fulldir']);
        }

        if ($request->requestMethod === 'POST') {
            if (!is_file($_REQUEST['fulldir'])) {
                echo ('this is not a directory');
            }
            file_put_contents($_REQUEST['fulldir'], $_REQUEST['content']);
            header('content-type: application/json');
            return json_encode(['message' => 'successfully saved content']);
        }

        $content = file_get_contents($url);

        return $this->render('admin/edit.twig', [
            'content' => base64_encode($content),
            'fulldir' => $url,
        ]);
    }

    protected function render(string $file, array $args = [])
    {
        $nav = new NavRenderer($this->nacho);
        $tmp = $this->nacho->getPages();
        $page = $this->nacho->getPage('/');
        $pages = ['/' => $nav->findChildPages('/', $page, $tmp)];

        $args['pages'] = $pages;
        $args['referer'] = $_SERVER['HTTP_REFERER'];

        return parent::render($file, $args);
    }
}
