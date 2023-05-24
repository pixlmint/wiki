<?php

namespace App\Helpers;

use App\Models\TokenUser;
use Nacho\Exceptions\UserDoesNotExistException;
use Nacho\ORM\ModelInterface;
use Nacho\ORM\TemporaryModel;
use Nacho\Security\UserInterface;

class TokenHelper
{
    public function getToken($user): string
    {
        if ($user instanceof TokenUser) {
            $user = $user->toArray();
        }
        $secret = SecretHelper::getSecret();
        $tokenStamp = $user['tokenStamp'];

        return md5($tokenStamp . $secret);
    }

    public function isTokenValid($token, $users): bool
    {
        try {
            $this->getUserByToken($token, $users);
            return true;
        } catch (UserDoesNotExistException $e) {
        }
        return false;
    }

    public function getUserByToken(string $token, array $users): UserInterface|ModelInterface
    {
        foreach ($users as $user) {
            if ($token === $this->getToken($user)) {
                return TokenUser::init(new TemporaryModel($user), 0);
            }
        }

        throw new UserDoesNotExistException('This User does not exist or the provided token is invalid');
    }

    public function generateNewTokenStamp(TokenUser &$user): void
    {
        $strTokenStamp = random_bytes(100) . time();

        $user->setTokenStamp(sha1($strTokenStamp));
    }
}