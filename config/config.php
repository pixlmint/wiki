<?php

return [
    'routes' => require_once('routes.php'),
    'wiki' => require_once('wiki.php'),
    'hooks' => [
        [
            'anchor' => 'post_find_route',
            'hook' => App\Hooks\RouteCheckHook::class,
        ],
    ],
    'security' => [
        'user_model' => App\Models\TokenUser::class,
        'userHandler' => App\Helpers\CustomUserHelper::class,
    ],
];