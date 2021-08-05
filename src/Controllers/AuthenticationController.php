<?php

namespace Wiki\Controllers;

use Nacho\Controllers\AbstractController;

class AuthenticationController extends AbstractController
{
    public function login($request)
    {
        if (strtolower($request->requestMethod) === 'post') {
            $isValid = false;
            $foundUser = null;
            foreach ($this->nacho->userHandler->getUsers() as $user) {
                if (
                    $user['username'] === $_REQUEST['username'] &&
                    password_verify($_REQUEST['password'], $user['password'])
                ) {
                    $isValid = true;
                    $foundUser = $user;
                    break;
                }
            }

            if (!$isValid) {
                $message = 'This password/ username is not valid';
                header('HTTP/1.0 400');
            } else {
                session_start();
                $_SESSION['user'] = $foundUser;
                if (!isset($_REQUEST['required_page'])) {
                    $_REQUEST['required_page'] = '/';
                }
                header('HTTP/1.1 302');
                header('Location: ' . $_REQUEST['required_page']);
            }
        }

        return $this->render('security/login.twig', [
            'page' => $_REQUEST['page'],
            'message' => $message,
        ]);
    }

    public function logout($request)
    {
        session_destroy();
        header('HTTP/1.1 302');
        header('Location: /');
    }
}
