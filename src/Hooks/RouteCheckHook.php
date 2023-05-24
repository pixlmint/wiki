<?php

namespace App\Hooks;

use App\Controllers\FrontendController;
use Nacho\Contracts\Hooks\PostFindRoute;
use Nacho\Hooks\AbstractHook;
use Nacho\Models\Route;

/**
 * This hook checks if the user is trying to access a /api route. If not it changes the Controller to FrontendController
 */
class RouteCheckHook extends AbstractHook implements PostFindRoute
{
    public function call(Route $route): Route
    {
        if (!str_starts_with($route->getPath(), 'api')) {
            $newRoute = [
                'route' => $route->getPath(),
                'controller' => FrontendController::class,
                'function' => 'index',
            ];

            $route = new Route($newRoute);
        }

        return $route;
    }
}