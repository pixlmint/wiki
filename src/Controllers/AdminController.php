<?php

namespace Wiki\Controllers;

use Nacho\Models\HttpMethod;
use Nacho\Models\HttpResponseCode;
use Nacho\Controllers\AbstractController;
use Wiki\Actions\AddFileAction;

class AdminController extends AbstractController
{
    public function add()
    {
        if (HttpMethod::POST !== strtoupper($_SERVER['REQUEST_METHOD'])) {
            return $this->json(['message' => 'Only POST allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
        if (!key_exists('parent-folder', $_REQUEST) || !key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'Please define title, parent-page, and token'], HttpResponseCode::BAD_REQUEST);
        }

        // TODO: check token

        AddFileAction::setMarkdownHelper($this->nacho->getMarkdownHelper());
        AddFileAction::run($_REQUEST);


        return $this->json([], HttpResponseCode::CREATED);
    }

    function edit($request)
    {
        if (!key_exists('entry', $_REQUEST) || !key_exists('content', $_REQUEST)) {
            return $this->json(['message' => 'Please define entry and content'], HttpResponseCode::BAD_REQUEST);
        }

        if (strtoupper($request->requestMethod) !== HttpMethod::PUT) {
            return $this->json(['message' => 'Only PUT allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
        $success = $this->nacho->getMarkdownHelper()->editPage($_REQUEST['entry'], $_REQUEST['content'], null);

        if (!$success) {
            return $this->json(['message' => 'Error Saving Content'], HttpResponseCode::INTERNAL_SERVER_ERROR);
        }
        return $this->json(['message' => 'successfully saved content']);
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
}
