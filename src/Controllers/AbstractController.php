<?php

abstract class AbstractController
{
    protected function render(string $file, array $args = [])
    {
        if (!is_file($file)) {
            echo("${file} is not a file<br>");
        }
        $args['user'] = $_SESSION['user'];
        ob_start();
        include $file;
        $var = ob_get_contents();
        ob_end_clean();
        return $var;
    }

    protected function isGranted($role)
    {
        return isGranted($role);
    }
}
