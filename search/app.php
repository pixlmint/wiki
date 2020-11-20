<?php

if (is_file($_SERVER['DOCUMENT_ROOT'] . '/pico/vendor/autoload.php')) {
    require_once($_SERVER['DOCUMENT_ROOT'] . '/pico/vendor/autoload.php');
} else {
    die("Cannot find 'vendor/autoload.php'. Run `composer install`.");
}

// instance Pico
$pico = new Pico(
    $_SERVER['DOCUMENT_ROOT'] . '/pico',    // root dir
    'config/',  // config dir
    'plugins/', // plugins dir
    'themes/'   // themes dir
);

$pico->run();

// header('Content-Type: text/html');
echo(json_encode($pico->getPages()));