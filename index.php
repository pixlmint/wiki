<?php

require __DIR__ . '/vendor/autoload.php';

use Wiki\Helpers\Request;
use Wiki\Security\JsonUserHandler;
use Wiki\Wiki;

session_start();
session_regenerate_id();

define('VIEWS_DIR', $_SERVER['DOCUMENT_ROOT'] . '/src/Views');
define('FILE_PATH', $_SERVER['DOCUMENT_ROOT'] . '/users.json');

if (isset($_SERVER['REDIRECT_URL'])) {
    $path = $_SERVER['REDIRECT_URL'];
} else {
    $path = $_SERVER['REQUEST_URI'];
}

function endswith($string, $test)
{
    return substr($string, strlen($string) - strlen($test), strlen($string)) ===
        $test;
}

if (endswith($path, '/') && $path !== '/') {
    $path = substr($path, 0, strlen($path) - 1);
}

function getRoute($path)
{
    $routes = json_decode(
        file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/config/routes.json'),
        true
    );
    foreach ($routes as $route) {
        if ($route['route'] === $path) {
            return $route;
        }
    }
}

function getContent($route)
{
    $request = new Request();
    $userHandler = new JsonUserHandler();
    $wiki = new Wiki($request, $userHandler);
    if (isset($route['min_role']) && !isGranted($route['min_role'])) {
        header('Http/1.1 401');
        return 'You are not allowed to view this page';
    }
    $controllerDir = $route['controller'];
    $cnt = new $controllerDir($wiki);
    $function = $route['function'];
    if (!method_exists($cnt, $function)) {
        header('Http/1.1 404');
        echo "${function} does not exist in ${className}";
    }
    $request = new Request();
    return $cnt->$function($request);
}

$route = getRoute($path);
$content = getContent($route);
if ($content) {
    echo $content;
} else {
    $route = getRoute('/');
    $content = getContent($route);
    echo $content;
}
