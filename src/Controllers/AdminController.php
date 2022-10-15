<?php

namespace Wiki\Controllers;

use DateTime;
use Nacho\Models\HttpMethod;
use Nacho\Models\HttpResponseCode;
use Nacho\Nacho;
use Nacho\Controllers\AbstractController;

class AdminController extends AbstractController
{
    public function __construct(Nacho $wiki)
    {
        parent::__construct($wiki);
        if (!$this->isGranted('Editor')) {
            header('Http/1.1 ' . HttpResponseCode::UNAUTHORIZED);
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
        if (HttpMethod::DELETE !== strtoupper($_SERVER['REQUEST_METHOD'])) {
            return $this->json(['message' => 'Only DELETE allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
        if (key_exists('file', $_REQUEST)) {
            $file = $_REQUEST['file'];
        } elseif (key_exists('dir', $_REQUEST)) {
            $file = $_REQUEST['dir'];
        } else {
            $file = '';
        }
        // What does this do?
        // if (substr($file, 0, strlen($_SERVER['DOCUMENT_ROOT'])) !== $_SERVER['DOCUMENT_ROOT']) {
        //     returnHome();
        // }

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

        return $this->json(['message' => 'Successfully Deleted File']);
    }

    public function add($request)
    {
        if (HttpMethod::POST !== strtoupper($_SERVER['REQUEST_METHOD'])) {
            return $this->json(['message' => 'Only POST allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
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
        }

        return $this->json([], HttpResponseCode::CREATED);
    }

    function edit($request)
    {
        if (!key_exists('url', $_REQUEST) || !key_exists('newContent', $_REQUEST) || !key_exists('newMeta', $_REQUEST)) {
            return $this->json(['message' => 'Please define url, newContent, and newMeta'], HttpResponseCode::BAD_REQUEST);
        }

        if (strtoupper($request->requestMethod) !== HttpMethod::PUT) {
            return $this->json(['message' => 'Only PUT allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
        $page = $this->nacho->getMarkdownHelper()->getPage($_REQUEST['url']);
        $success = $this->nacho->getMarkdownHelper()->editPage($page->file, $_REQUEST['newContent'], $_REQUEST['newMeta']);

        if (!$success) {
            return $this->json(['message' => 'Error Saving Content'], HttpResponseCode::INTERNAL_SERVER_ERROR);
        }
        return $this->json(['message' => 'successfully saved content']);
    }
}
