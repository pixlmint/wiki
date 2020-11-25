<?php

define('FILE_PATH', $_SERVER['DOCUMENT_ROOT'] . '/users.json');

if (!isset($_SESSION['user'])) {
    $_SESSION['user'] = ['username' => 'Guest', 'password' => null, 'role' => 'Guest'];
}

function getCurrentUser()
{
    return findUser($_SESSION['user']['username']);
}

function getUsers()
{
    return json_decode(file_get_contents(FILE_PATH), true);
}

function findUser($username)
{
    foreach (getUsers() as $user) {
        if ($username === $user['username']) {
            return $user;
        }
    }

    return false;
}

function logout()
{
    session_destroy();
}

function getRoles()
{
    return ['Super Admin', 'Editor', 'Reader', 'Guest'];
}

function isGranted(string $minRight = 'Guest', array $user = null)
{
    if (!$user) {
        $user = getCurrentUser();
    }

    return array_search($user['role'], getRoles()) <= array_search($minRight, getRoles());
}
