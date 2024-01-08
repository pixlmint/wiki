<?php

use App\Controllers\FrontendController;
use App\Hooks\InitHook;

return [
    "plugins" => [
        [
            'name' => 'pixlcms-wiki-plugin',
            'install_method' => 'composer',
            'enabled' => true,
            'config' => require_once('vendor/pixlmint/pixlcms-wiki-plugin/config/config.php'),
        ],
        [
            'name' => 'pixlcms-media-plugin',
            'install_method' => 'composer',
            'enabled' => true,
            'config' => require_once('vendor/pixlmint/pixlcms-media-plugin/config/config.php'),
        ],
    ],
    'routes' => [
        [
            'route' => '/',
            'controller' => FrontendController::class,
            'function' => 'index',
        ],
    ],
    'hooks' => [
        [
            'anchor' => 'init',
            'hook' => InitHook::class,
        ],
    ],
    'wikiFrontend' => [
        'version' => '1.15.2',
    ],
    'base' => [
        'debugEnabled' => false,
        'frontendController' => FrontendController::class,
    ]
];
