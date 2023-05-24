<?php

namespace App\Controllers;

use App\Helpers\AdminHelper;
use App\Helpers\WikiConfiguration;
use App\Helpers\TokenHelper;
use Nacho\Controllers\AbstractController;

class InitController extends AbstractController
{
    const NO_TOKEN_SET = 'no_token_set';
    const TOKEN_VALID = 'token_valid';
    const TOKEN_INVALID = 'token_invalid';

    public function init(): string
    {
        $isTokenValid = $this->isTokenValid();

        $year = WikiConfiguration::title();

        $isAdminCreated = $this->isAdminCreated();

        $version = WikiConfiguration::version();

        return $this->json(['is_token_valid' => $isTokenValid, 'title' => $year, 'version' => $version, 'adminCreated' => $isAdminCreated]);
    }

    public function isAdminCreated(): bool
    {
        $users = $this->nacho->getUserHandler()->getUsers();
        foreach ($users as $user) {
            if ($user['role'] === 'Editor') {
                return true;
            }
        }

        return false;
    }

    private function isTokenValid(): string
    {
        if (!key_exists('token', $_REQUEST) || $this->isTokenNull()) {
            return self::NO_TOKEN_SET;
        }

        $tokenHelper = new TokenHelper();

        $users = $this->nacho->userHandler->getUsers();

        if ($tokenHelper->isTokenValid($_REQUEST['token'], $users)) {
            return self::TOKEN_VALID;
        }

        return self::TOKEN_INVALID;
    }

    private function isTokenNull(): bool
    {
        $token = $_REQUEST['token'];

        return $token === null || $token === 'null' || $token === 'undefined';
    }
}