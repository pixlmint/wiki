<?php

namespace App\Helpers;

use App\Models\TokenUser;
use Nacho\ORM\RepositoryManager;
use Nacho\Security\JsonUserHandler;
use Nacho\Contracts\UserHandlerInterface;
use Nacho\Security\UserInterface;
use Nacho\Security\UserRepository;

final class CustomUserHelper extends JsonUserHandler implements UserHandlerInterface
{
    const ROLE_SUPER_ADMIN = 'Super Admin';
    const ROLE_EDITOR = 'Editor';
    const ROLE_READER = 'Reader';
    const ROLE_GUEST = 'Guest';

    public function getCurrentUser()
    {
        $token = $_REQUEST['token'];
        if (!$token) {

        }
    }

    public function isGranted(string $minRight = self::ROLE_GUEST, ?UserInterface $user = null): bool
    {
        $users = $this->getUsers();
        return parent::isGranted($minRight, $user);
    }

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
