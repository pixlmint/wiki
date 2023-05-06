<?php

namespace App\Helpers;

use App\Models\Cache;
use App\Repository\CacheRepository;
use Nacho\Models\PicoPage;
use Nacho\Nacho;
use Nacho\ORM\RepositoryInterface;
use Nacho\ORM\RepositoryManager;

class CacheHelper
{
    private Nacho $nacho;
    private CacheRepository|RepositoryInterface $repository;
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    public function __construct($nacho) {
        $this->nacho = $nacho;
        $this->repository = RepositoryManager::getInstance()->getRepository(CacheRepository::class);
    }

    public function build(): void
    {
        $content = $this->renderContent();
        $renderDate = date('Y-m-d H:i:s', time());
        $cache = new Cache($renderDate, $content);

        $this->repository->set($cache);
    }

    public function read(): ?Cache
    {
        return $this->repository->getById(1);
    }

    private function renderContent(): array
    {
        $this->nacho->getMarkdownHelper()->readPages();
        $pages = $this->nacho->getMarkdownHelper()->getPages();
        usort($pages, [$this, 'sortByDate']);
        $months = [];
        foreach ($pages as $page) {
            $month = explode('/', $page->id)[1];
            if (!key_exists($month, $months)) {
                $months[$month] = [
                    'name' => $month,
                    'days' => [],
                ];
            }
            if ($this->isEmptyContent($page)) {
                continue;
            }
            $page->content = $this->nacho->getMarkdownHelper()->renderPage($page);
            $months[$month]['days'][] = $page;
        }

        return $months;
    }

    private function sortByDate(PicoPage $a, PicoPage $b): int
    {
        if (is_int(array_search($a->meta->title, self::MONTHS))) {
            return -1;
        }
        if (is_int(array_search($b->meta->title, self::MONTHS))) {
            return 1;
        }
        $t1 = strtotime($a->meta->title);
        $t2 = strtotime($b->meta->title);

        return $t2 - $t1;
    }

    private function isEmptyContent(PicoPage $page): bool
    {
        return !$page->raw_content && !key_exists('raceReport', (array) $page->meta);
    }
}
