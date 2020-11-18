<?php

foreach ($_REQUEST as $key => $value) {
    echo("${key}: ${value}<br>");
}

if (!is_file($_REQUEST['file'])) {
    throw new NotFoundException();
}

file_put_contents($_REQUEST['file'], $_REQUEST['content']);

header('Location: /');
die();