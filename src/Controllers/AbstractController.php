<?php

namespace Wiki\Controllers;

use Wiki\Security\JsonUserHandler;
use Wiki\Security\UserHandlerInterface;
use Wiki\Wiki;

abstract class AbstractController
{
    protected $wiki;

    public function __construct(Wiki $wiki)
    {
        $this->wiki = $wiki;
    }

    protected function render(string $file, array $args = [])
    {
        if (!is_file($file)) {
            echo("${file} is not a file<br>");
        }
        $args['user'] = $_SESSION['user'];
        $args['wiki'] = $this->wiki;
        ob_start();
        include $file;
        $var = ob_get_contents();
        ob_end_clean();
        return $var;
    }

    protected function isGranted($role)
    {
        return $this->wiki->isGranted($role);
    }
}
