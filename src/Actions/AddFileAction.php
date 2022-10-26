<?php

namespace Wiki\Actions;

use Exception;
use Nacho\Helpers\MarkdownHelper;
use Nacho\Models\PicoMeta;
use Nacho\Models\PicoPage;
use Wiki\Contracts\ActionInterface;
use Wiki\Helpers\FileNameHelper;

class AddFileAction implements ActionInterface
{
    private static MarkdownHelper $markdownHelper;

    public static function setMarkdownHelper(MarkdownHelper $markdownHelper): void
    {
        self::$markdownHelper = $markdownHelper;
    }

    public static function run(array $arguments): bool
    {
        $page = self::$markdownHelper->getPage($arguments['parent-folder']);
        if (!$page) {
            throw new Exception('Unable to find this page');
        }
        $newPage = new PicoPage();
        $newPage->raw_content = 'Write Some Content';
        $meta = new PicoMeta();
        $meta->title = 'New Entry';
        $meta->date = date('Y-m-d');
        $meta->time = date('h:i:s');
        $newPage->meta = $meta;
        
        $parentDir = preg_replace('/index.md$/', '', $arguments['parent-folder']);
        $fileName = FileNameHelper::generateFileNameFromTitle($meta->title);
        $file = CONTENT_DIR . $parentDir . $fileName;

        $newPage->id = $parentDir . FileNameHelper::slugify($meta->title);
        $newPage->file = $file;

        // print_r($newPage);

        return self::$markdownHelper->storePage($newPage);
    }
}