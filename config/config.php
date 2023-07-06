<?php

use App\Controllers\FrontendController;

return [
    "plugins" => [
        [
            'name' => 'pixlcms-wiki-plugin',
            'install_method' => 'composer',
            'enabled' => true,
            'config' => require_once('vendor/pixlmint/pixlcms-wiki-plugin/config/config.php'),
        ],
    ],
    'base' => [
        'frontendController' => FrontendController::class,
    ]
];