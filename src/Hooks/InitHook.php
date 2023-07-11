<?php

namespace App\Hooks;

use Nacho\Helpers\ConfigurationHelper;
use Nacho\Hooks\AbstractHook;
use PixlMint\CMS\Contracts\InitFunction;

class InitHook extends AbstractHook implements InitFunction
{
    public function call(array $init): array
    {
        $frontendVersion = ConfigurationHelper::getInstance()->getCustomConfig('wikiFrontend')['version'];

        $init['frontendVersion'] = $frontendVersion;

        return $init;
    }
}