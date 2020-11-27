<?php

include $_SERVER['DOCUMENT_ROOT'] . '/src/Security/JsonUserHandler.php';

class Rights extends AbstractPicoPlugin
{
    private $userHandler;
    public function __construct(Pico $pico)
    {
        parent::__construct($pico);
        $this->userHandler = new JsonUserHandler();
    }

    public function onMetaParsed(array &$meta)
    {
        if (!key_exists('min_role', $meta)) {
            $canView = true;
        } else {
            $canView = $this->userHandler->isGranted($meta['min_role']);
        }

        if (!$canView) {
            header('HTTP/1.0 401');
        }
        $meta['canView'] = $canView;
    }
}
