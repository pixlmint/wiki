<?php

include $_SERVER['DOCUMENT_ROOT'] . '/UserHandler.php';

class Rights extends AbstractPicoPlugin
{
    public function onMetaParsed(array &$meta)
    {
        if (!key_exists('min_role', $meta)) {
            $canView = true;
        } else {
            $canView = isGranted($meta['min_role']);
        }

        if (!$canView) {
            header('HTTP/1.0 401');
        }
        $meta['canView'] = $canView;
    }
}
