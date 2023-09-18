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
    ],
    'hooks' => [
        [
            'anchor' => 'init',
            'hook' => InitHook::class,
        ],
    ],
    'wikiFrontend' => [
        'version' => '1.8',
    ],
    'base' => [
        'frontendController' => FrontendController::class,
    ]
];
