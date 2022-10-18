<?php

namespace Wiki\Helpers;

use Nacho\Security\JsonUserHandler;
use Nacho\Contracts\UserHandlerInterface;

class TokenHelper
{
    private UserHandlerInterface $userHandler;

    public function __construct()
    {
        $this->userHandler = new JsonUserHandler();
    }

    function getToken($username): string
    {
        $secret = self::getSecret();

        return md5($username . $this->userHandler->findUser($username)['tokenStamp'] . $secret);
    }

    function isTokenValid($token, $users)
    {
        foreach ($users as $user) {
            if ($token === $this->getToken($user['username'])) {
                return $user;
            }
        }

        return false;
    }

    // Generate a fresh token
    public function generateToken($username): string
    {
        $tokenStamp = md5(random_bytes(100));
        $this->userHandler->modifyUser($username, 'tokenStamp', $tokenStamp);

        return $this->getToken($username);
    }

    public function getSecret()
    {
        if (is_file('.secret')) {
            return file_get_contents('.secret');
        }

        $secretVar = getenv('SECRET');

        if (!$secretVar) {
            throw new \Exception('SECRET is not defined');
        }

        return $secretVar;
    }
}