<?php

namespace Wiki\Controllers;

use Nacho\Nacho;
use Nacho\Controllers\AbstractController;

class UsersController extends AbstractController
{
    public function list()
    {
        $usersList = $this->nacho->userHandler->getUsers();

        return $this->render('admin/users/list.twig', [
            'users' => $usersList,
        ]);
    }

    public function add($request)
    {
        if (strtolower($request->requestMethod) === 'post') {
            $existingUsers = $this->nacho->userHandler->getUsers();
            $userExists = false;
            foreach ($existingUsers as $user) {
                if ($user['username'] === $_REQUEST['username']) {
                    header('HTTP/1.0 409');
                    $message = 'This username is already taken';
                    $userExists = true;
                    break;
                }
            }
            if (!$userExists) {
                array_push($existingUsers, [
                    'username' => $_REQUEST['username'],
                    'password' => password_hash(
                        $_REQUEST['password'],
                        PASSWORD_DEFAULT
                    ),
                    'role' => $_REQUEST['role'],
                ]);
                file_put_contents(
                    $request->documentRoot . '/users.json',
                    json_encode($existingUsers)
                );

                header('HTTP/1.1 302');
                header('Location: /admin/users/list');
                return '';
            }
        }
        return $this->render('admin/users/add.twig');
    }
}
