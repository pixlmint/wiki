<?php

namespace Wiki\Controllers;

use DateTime;

class AdminController extends AbstractController
{
    public function __construct()
    {
        parent::__construct();
        if (!$this->isGranted('Editor')) {
            header('Http/1.1 401');
            echo 'You are not allowed to view this part of the page. <a href="/">Return</a>';
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
                        echo "deleting ${dir}<br>";
                        unlink($newDir);
                    } elseif (is_dir($newDir)) {
                        rmdirRecursive($newDir);
                    }
                }
            }
            rmdir($dir);
        }

        if (is_file($file)) {
            echo "deleting ${file}<br>";
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
            $file = $_REQUEST['parent'] . '/' . $_REQUEST['filename'];
            $parentDir = explode('/', $_REQUEST['filename']);
            array_pop($parentDir);
            $createDirs = '';
            foreach ($parentDir as $newDir) {
                if (
                    !is_dir(
                        $_REQUEST['parent'] . '/' . $createDirs . '/' . $newDir
                    )
                ) {
                    mkdir(
                        $_REQUEST['parent'] . '/' . $createdDirs . '/' . $newDir
                    );
                }
                if ($createdDirs) {
                    $createdDirs .= '/';
                }
                $createdDirs .= $newDir;
            }
            file_put_contents($file, $content);
            header('Location: /admin/edit&fulldir=' . $file);
            header('HTTP/1.1 302');
        }

        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => $this->render(
                VIEWS_DIR . '/includes/admin/add/article.php'
            ),
        ]);
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
            file_put_contents($_REQUEST['fulldir'], $_REQUEST['content']);
            header('content-type: application/json');
            return json_encode(['message' => 'successfully saved content']);
        }

        return $this->render(VIEWS_DIR . '/base.php', [
            'article' => $this->render(
                VIEWS_DIR . '/includes/admin/edit/article.php',
                ['url' => $url]
            ),
            'js' => $this->render(VIEWS_DIR . '/includes/admin/js.php', [
                'url' => $url,
            ]),
            'url' => $url,
            'nav' => $this->render(VIEWS_DIR . '/includes/admin/nav.php'),
            'css' => $this->render(VIEWS_DIR . '/includes/admin/css.php'),
        ]);
    }
}
