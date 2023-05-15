<?php

namespace App\Controllers;

use App\Actions\AddFileAction;
use App\Actions\RenameAction;
use App\Helpers\Media\ImageMediaType;
use DateTime;
use App\Helpers\TokenHelper;
use App\Helpers\BackupHelper;
use App\Helpers\CacheHelper;
use Nacho\Controllers\AbstractController;
use Nacho\Models\HttpMethod;
use Nacho\Models\HttpResponseCode;
use Nacho\Models\Request;

class AdminController extends AbstractController
{
    /**
     * GET:  fetch the markdown for a file
     * POST: save edited file
     */
    function edit(Request $request)
    {
        if (!key_exists('token', $_GET)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_GET['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }
        $strPage = $_GET['entry'];
        $page = $this->nacho->getMarkdownHelper()->getPage($strPage);

        if (!$page || !is_file($page->file)) {
            return $this->json(['message' => 'Unable to find this file']);
        }

        if (strtoupper($request->requestMethod) === HttpMethod::PUT) {
            $this->nacho->getMarkdownHelper()->editPage($page->id, $_GET['content'], []);
            $cacheHelper = new CacheHelper($this->nacho);
            $cacheHelper->build();

            return $this->json(['message' => 'successfully saved content', 'file' => $page->file]);
        }

        return $this->json((array) $page);
    }

    public function addFolder()
    {
        $token = $_REQUEST['token'];
        $parentFolder = $_REQUEST['parentFolder'];
        $folderName = $_REQUEST['folderName'];
        // TODO: Token check

    }

    function add()
    {
        $token = $_REQUEST['token'];
        $title = $_REQUEST['title'];
        $parentFolder = $_REQUEST['parentFolder'];
        // TODO: token check?

        $action = new AddFileAction();
        $action::setMarkdownHelper($this->nacho->getMarkdownHelper());
        $success = $action::run(['title' => $title, 'parent-folder' => $parentFolder]);

        return $this->json(['success' => $success]);
    }

    function rename(Request $request)
    {
        if (!key_exists('entry', $_GET) || !key_exists('new-title', $_GET) || !key_exists('token', $_GET)) {
            return $this->json(['message' => 'Please define entry and content'], HttpResponseCode::BAD_REQUEST);
        }
        if (strtoupper($request->requestMethod) !== HttpMethod::PUT) {
            return $this->json(['message' => 'Only PUT allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }

        RenameAction::setMarkdownHelper($this->nacho->getMarkdownHelper());
        $success = RenameAction::run($_GET);

        return $this->json(['success' => $success]);
    }

    public function delete($request)
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_REQUEST['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }
        if (!key_exists('entry', $_GET)) {
            return $this->json($_GET, 400);
        }

        $file = $_SERVER['DOCUMENT_ROOT'] . '/content' . $_GET['entry'] . '.md';

        if (is_file($file)) {
            unlink($file);
        } else {
            return $this->json(['file' => $file], 404);
        }
        $cacheHelper = new CacheHelper($this->nacho);
        $cacheHelper->build();

        return $this->json(['message' => "successfully deleted ${file}"]);
    }

    public function buildCache()
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_REQUEST['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }
        $cacheHelper = new CacheHelper($this->nacho);
        $cacheHelper->build();
        return $this->json(['success' => true]);
    }

    public function publishStatus($request)
    {
        if (strtoupper($request->requestMethod) !== 'POST') {
            return $this->json(['post requests only'], 405);
        }
        $contentDir = $_SERVER['DOCUMENT_ROOT'] . '/content';
        $fileName = $this->getCurrentFile();

        $content = file_get_contents("${contentDir}/${fileName}");

        $content .= $_REQUEST['status'] . "\n\n";
        file_put_contents("${contentDir}/${fileName}", $content);

        return $this->json(['message' => 'Successfully added status']);
    }

    public function generateBackup()
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_REQUEST['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }

        $backupHelper = new BackupHelper();
        $zip = $backupHelper->generateBackup();

        return $this->json(['file' => $zip]);
    }

    public function restoreFromBackup(Request $request)
    {
        if (!key_exists('token', $request->getBody())) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $request->getBody()['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }

        $zipPath = $_FILES['backup']['tmp_name'];
        $backupHelper = new BackupHelper();
        $success = $backupHelper->restoreFromBackup($zipPath);
        $cacheHelper = new CacheHelper($this->nacho);
        $cacheHelper->build();

        return $this->json(['success' => $success]);
    }
}
