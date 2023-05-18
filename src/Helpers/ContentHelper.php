<?php

namespace App\Helpers;

use Exception;
use Nacho\Helpers\MarkdownHelper;
use Nacho\Models\PicoMeta;
use Nacho\Models\PicoPage;

class ContentHelper
{
    private MarkdownHelper $markdownHelper;

    public function __construct(MarkdownHelper $markdownHelper)
    {
        $this->markdownHelper = $markdownHelper;
    }

    public function create(string $parentFolder, string $title, bool $isFolder = false): bool
    {
        $page = $this->markdownHelper->getPage($parentFolder);

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

        $parentDir = preg_replace('/index.md$/', '', $parentFolder);
        if ($isFolder) {
            // TODO: Folder names that contain a space don't work
            $directory = $contentDir . $parentDir . DIRECTORY_SEPARATOR . $title;
            mkdir($directory);
            $file = $directory . DIRECTORY_SEPARATOR . 'index.md';
            $newPage->id = $parentDir . $title;
        } else {
            $fileName = FileNameHelper::generateFileNameFromTitle($meta->title);
            $file = $contentDir . $parentDir . DIRECTORY_SEPARATOR . $fileName;
            $newPage->id = $parentDir . $fileName;
        }

        $newPage->file = $file;

        return $this->markdownHelper->storePage($newPage);
    }

    public function update()
    {
        // TODO
    }

    public function delete(string $entry): bool
    {
        $file = WikiConfiguration::contentDir() . $entry . '.md';
        if (is_file($file)) {
            unlink($file);
        }
        $page = $this->markdownHelper->getPage($entry);
        $filename = $page->file;
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