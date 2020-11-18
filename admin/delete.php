<?php

function returnHome()
{
    header('Location: /admin');
    die();
}

if (key_exists('file', $_REQUEST)) {
    $file = $_REQUEST['file'];
} elseif (key_exists('dir', $_REQUEST)) {
    $file = $_REQUEST['dir'];
} else {
    returnHome();
}
if (
    substr($file, 0, strlen($_SERVER['DOCUMENT_ROOT'])) !==
    $_SERVER['DOCUMENT_ROOT']
) {
    returnHome();
}

function rmdirRecursive($dir)
{
    foreach (scandir($dir) as $sub) {
        echo $sub;
        if ($sub !== '.' && $sub !== '..') {
            $newDir = $dir . '/' . $sub;
            if (is_file($newDir)) {
                unlink($newDir);
            } elseif (is_dir($newDir)) {
                rmdirRecursive($newDir);
            }
        }
    }
    rmdir($dir);
}

if (is_file($file)) {
    unlink($file);
} elseif (is_dir($file)) {
    echo $file;
    rmdirRecursive($file);
}

returnHome();
