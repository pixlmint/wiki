<?php

namespace App\Actions;

use App\Helpers\WikiConfiguration;
use Exception;
use Nacho\Helpers\MarkdownHelper;
use Nacho\Models\PicoMeta;
use Nacho\Models\PicoPage;
use App\Contracts\ActionInterface;
use App\Helpers\FileNameHelper;

class AddFileAction implements ActionInterface
{
    private static MarkdownHelper $markdownHelper;

    public static function setMarkdownHelper(MarkdownHelper $markdownHelper): void
    {
        self::$markdownHelper = $markdownHelper;
    }

    /**
     * $arguments: title, parent-folder
     */
    public static function run(array $arguments): bool
    {
        $page = self::$markdownHelper->getPage($arguments['parent-folder']);
        $title = $arguments['title'];
        if (!$page) {
            throw new Exception('Unable to find this page');
        }
        $newPage = new PicoPage();
        $newPage->raw_content = 'Write Some Content';
        $meta = new PicoMeta();
        $meta->title = $title;
        $meta->date = date('Y-m-d');
        $meta->time = date('h:i:s');
        $newPage->meta = $meta;

        $contentDir = WikiConfiguration::contentDir();
        
        $parentDir = preg_replace('/index.md$/', '', $arguments['parent-folder']);
        $fileName = FileNameHelper::generateFileNameFromTitle($meta->title);
        $file = $contentDir . $parentDir . DIRECTORY_SEPARATOR . $fileName;

        $newPage->id = $parentDir . FileNameHelper::slugify($meta->title);
        $newPage->file = $file;

        return self::$markdownHelper->storePage($newPage);
    }
}