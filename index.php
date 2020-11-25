<?php

session_start();
session_regenerate_id();
include $_SERVER['DOCUMENT_ROOT'] . '/src/Security/UserHandler.php';

require_once $_SERVER['DOCUMENT_ROOT'] . '/src/Helpers/Request.php';
// require_once $_SERVER['DOCUMENT_ROOT'] . '/src/Helpers/Router.php';

define('VIEWS_DIR', $_SERVER['DOCUMENT_ROOT'] . '/src/Views');

// header('content-type: application/json');
// echo(json_encode($_SERVER));
// die();

$request = new Request();

// echo json_encode($routes);
// die();

function loadClass($file)
{
    $fp = fopen($file, 'r');
    $class = $buffer = '';
    $i = 0;
    while (!$class) {
        if (feof($fp)) {
            break;
        }

        $buffer .= fread($fp, 512);
        $tokens = token_get_all($buffer);

        if (strpos($buffer, '{') === false) {
            continue;
        }

        for (; $i < count($tokens); $i++) {
            if ($tokens[$i][0] === T_CLASS) {
                for ($j = $i + 1; $j < count($tokens); $j++) {
                    if ($tokens[$j] === '{') {
                        $class = $tokens[$i + 2][1];
                    }
                }
            }
        }
    }

    return $class;
}

if (isset($_SERVER['REDIRECT_URL'])) {
    $path = $_SERVER['REDIRECT_URL'];
} else {
    $path = $_SERVER['REQUEST_URI'];
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
    $controllerDir = $_SERVER['DOCUMENT_ROOT'] . $route['controller'];
    if (!is_file($controllerDir)) {
        return false;
    }
    include_once $controllerDir;
    $className = loadClass($controllerDir);
    $cnt = new $className();
    $function = $route['function'];
    if (!method_exists($cnt, $function)) {
        header('Http/1.1 404');
        echo "${function} does not exist in ${className}";
    }
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
