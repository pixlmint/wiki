<?php

namespace App\Actions;

use Nacho\Helpers\MarkdownHelper;
use Nacho\Models\PicoPage;
use App\Contracts\ActionInterface;

class RenameAction implements ActionInterface
{
    private static MarkdownHelper $markdownHelper;

    public static function setMarkdownHelper(MarkdownHelper $markdownHelper): void
    {
        self::$markdownHelper = $markdownHelper;
    }

    public static function run(array $arguments): bool
    {
        $newName = $arguments['new-name'];
        $entry = $arguments['entry'];

        self::$markdownHelper->editPage($entry, '', ['title' => $newName]);
        $page = self::$markdownHelper->getPage($entry);
        $splPath = explode(DIRECTORY_SEPARATOR, $page->file);
        $filename = array_pop($splPath);

        if ($filename === 'index.md') {
            return true;
        }

        return true;
    }
}