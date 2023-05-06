<?php

namespace App\Actions;

use Nacho\Helpers\MarkdownHelper;
use App\Contracts\ActionInterface;

class DeleteAction implements ActionInterface
{
    private static MarkdownHelper $mdHelper;

    public static function setMarkdownHelper(MarkdownHelper $markdownHelper)
    {
        self::$mdHelper = $markdownHelper;
    }

    public static function run(array $arguments): bool
    {
        $page = $arguments['page'];

        $filename = self::$mdHelper->getPage($page)->file;
        $split_name = explode(DIRECTORY_SEPARATOR, $filename);
        $success = unlink($filename);
        if ($split_name[-1] !== 'index.md') {
            return $success;
        }

        array_pop($split_name);
        self::rmdir_recursive(implode("/", $split_name));

        return true;
    }

    private static function rmdir_recursive(string $dir): void
    {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . DIRECTORY_SEPARATOR . $object) && !is_link($dir . "/" . $object))
                        self::rmdir_recursive($dir . DIRECTORY_SEPARATOR . $object);
                    else
                        unlink($dir . DIRECTORY_SEPARATOR . $object);
                }
            }
            rmdir($dir);
        }
    }
}