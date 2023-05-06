<?php

namespace App\Helpers;

use App\Models\TokenUser;
use Nacho\ORM\RepositoryManager;
use Nacho\Security\JsonUserHandler;
use Nacho\Contracts\UserHandlerInterface;
use Nacho\Security\UserInterface;
use Nacho\Security\UserRepository;

class CustomUserHelper extends JsonUserHandler implements UserHandlerInterface
{
    public function setPassword(string $username, string $newPassword)
    {
        /** @var TokenUser $user */
        $user = $this->findUser($username);
        $this->setPasswordForUser($user, $newPassword);

        return $user;
    }

    public function setPasswordForUser(TokenUser $user, string $newPassword): TokenUser
    {
        $passwordHash = password_hash(SecretHelper::getSecret() . $newPassword, PASSWORD_DEFAULT);
        $user->setPassword($passwordHash);
        RepositoryManager::getInstance()->getRepository(UserRepository::class)->set($user);

        return $user;
    }

    public function passwordVerify(UserInterface $user, string $password): bool
    {
        $secret = SecretHelper::getSecret();

        return password_verify($secret . $password, $user->getPassword());
    }
}
