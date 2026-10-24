<?php

namespace PixlMint\WikiPlugin\Controllers;

use Nacho\Contracts\RequestInterface;
use Nacho\Controllers\AbstractController;
use Nacho\Exceptions\UnauthorizedHttpException;
use PixlMint\CMS\Helpers\CustomUserHelper;

class CheckboxController extends AbstractController
{
    public function check(RequestInterface $request)
    {
        if (!$this->isGranted(CustomUserHelper::ROLE_EDITOR)) {
            throw new UnauthorizedHttpException();
        }
    }

    public function uncheck(RequestInterface $request)
    {
        if (!$this->isGranted(CustomUserHelper::ROLE_EDITOR)) {
            throw new UnauthorizedHttpException();
        }
    }

    private function toggleChecked(string $entry, bool $checked)
    {

    }
}

