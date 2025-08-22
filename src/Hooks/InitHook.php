<?php

namespace App\Hooks;

use Nacho\Helpers\ConfigurationContainer;
use PixlMint\CMS\Contracts\InitFunction;

class InitHook implements InitFunction
{
    private ConfigurationContainer $config;

    public function __construct(ConfigurationContainer $config)
    {
        $this->config = $config;
    }

    public function call(array $init): array
    {
        $frontendVersion = $this->config->getCustomConfig('wikiFrontend')['version'];

        $init['frontendVersion'] = $frontendVersion;

        return $init;
    }
}
