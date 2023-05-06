<?php

namespace App\Controllers;

use App\Helpers\CacheHelper;
use App\Helpers\JournalConfiguration;
use Nacho\Controllers\AbstractController;

/**
 * Class PageController
 */
class PageController extends AbstractController
{
    public function index()
    {
        $cacheHelper = new CacheHelper($this->nacho);
        $cache = $cacheHelper->read();
        if (!$cache) {
            $cacheHelper->build();
            $cache = $cacheHelper->read();
        }
        $content = $cache->getContent();

        if (!$this->journalIsCurrentYear()) {
            $content = $this->reverseEntries($content);
        }

        return $this->json($content);
    }

    private function reverseEntries(array $content): array
    {
        return array_reverse(array_map(function(array $month) {
            $month['days'] = array_reverse($month['days']);
            return $month;
        }, $content));
    }

    private function journalIsCurrentYear(): bool
    {
        $journalYear = JournalConfiguration::year();
        $now = new \DateTime();
        $currentYear = intval($now->format('Y'));

        return $journalYear === $currentYear;
    }
}
