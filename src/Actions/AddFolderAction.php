<?php

namespace Wiki\Actions;

use Wiki\Contracts\ActionInterface;

class AddFolderAction implements ActionInterface
{
    public static function run(array $arguments): bool
    {
        $parentDir = [];
        $createdDirs = '';
        foreach ($parentDir as $newDir) {
            if (!is_dir(CONTENT_DIR . '/' . $createdDirs . '/' . $newDir)) {
                mkdir(CONTENT_DIR . '/' . $createdDirs . '/' . $newDir);
            }
            if ($createdDirs) {
                $createdDirs .= '/';
            }
            $createdDirs .= $newDir;
        }
    }
}