<?php


namespace Wiki\Security;


interface UserHandlerInterface
{
    public function getCurrentUser();

    public function getUsers();

    public function findUser(string $username);

    public function logout();

    public function isGranted(string $minRight = 'Guest', ?array $user = null);
}