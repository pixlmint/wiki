<?php

namespace Wiki\Controllers;

use Nacho\Models\HttpMethod;
use Nacho\Models\HttpResponseCode;
use Nacho\Controllers\AbstractController;
use Nacho\Models\Request;
use Wiki\Actions\AddFileAction;
use Wiki\Actions\DeleteAction;
use Wiki\Helpers\TokenHelper;

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
        $this->verifyToken();

        // TODO: check token

        AddFileAction::setMarkdownHelper($this->nacho->getMarkdownHelper());
        AddFileAction::run($_REQUEST);


        return $this->json([], HttpResponseCode::CREATED);
    }

    function edit(Request $request)
    {
        if (!key_exists('entry', $request->getBody()) || !key_exists('content', $request->getBody()) || !key_exists('meta', $request->getBody())) {
            return $this->json(['message' => 'Please define entry and content'], HttpResponseCode::BAD_REQUEST);
        }
        if (strtoupper($request->requestMethod) !== HttpMethod::PUT) {
            return $this->json(['message' => 'Only PUT allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }
        $success = $this->nacho->getMarkdownHelper()->editPage($request->getBody()['entry'], $request->getBody()['content'], $request->getBody()['meta']);

        if (!$success) {
            return $this->json(['message' => 'Error Saving Content'], HttpResponseCode::INTERNAL_SERVER_ERROR);
        }
        return $this->json(['message' => 'successfully saved content']);
    }

    public function delete(Request $request)
    {
        if (HttpMethod::DELETE !== strtoupper($request->requestMethod)) {
            return $this->json(['message' => 'Only DELETE allowed'], HttpResponseCode::METHOD_NOT_ALLOWED);
        }

        // TODO: Check Token

        DeleteAction::$mdHelper = $this->nacho->getMarkdownHelper();
        $success = DeleteAction::run(['page' => $request->getBody()['entry']]);

        if (!$success) {
            return $this->json(['message' => 'Error Deleting File'], HttpResponseCode::INTERNAL_SERVER_ERROR);
        }

        return $this->json(['message' => 'Successfully Deleted File']);
    }

    private function verifyToken()
    {
        $tokenHelper = new TokenHelper();
        $req = $this->nacho->getRequest();
        $user = $tokenHelper->isTokenValid($req->getBody()['token'], $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            header('Content-Type: application/json');
            echo(json_encode(['message' => 'You need to be authenticated']));
            die();
        }
    }
}
