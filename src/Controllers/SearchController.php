<?php

namespace App\Controllers;

use App\Helpers\CustomPico;
use Nacho\Controllers\AbstractController;

class SearchController extends AbstractController
{
    public function search($request)
    {
        $start = microtime(true) * 1000;
        $pico = new CustomPico(
            $_SERVER['DOCUMENT_ROOT'] . '/pico', // root dir
            'config/', // config dir
            'plugins/', // plugins dir
            'themes/' // themes dir
        );
        $pico->search();

        if (!is_file($_SERVER['DOCUMENT_ROOT'] . '/config/search/excluded.txt')) {
            echo('there is no blacklist');
        }
        $blacklist = explode('|', file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/config/search/excluded.txt'));
        $wordList = [];

        foreach ($pico->getPages() as $key => $page) {
            $filePath = $pico->resolveFilePath($key);
            $raw = $pico->loadFileContent($filePath);
            $meta = $pico->parseFileMeta($raw, $pico->getMetaHeaders());
            $content = $pico->prepareFileContent($raw, $meta);
            foreach ($this->getWords($content, $blacklist) as $word => $count) {
                if (!isset($wordList[$word])) {
                    $wordList[$word] = [];
                }
                $wordList[$word][$key] = $count;
            }
        }

        $saveFile = $_SERVER['DOCUMENT_ROOT'] . '/index.json';
        file_put_contents($saveFile, json_encode($wordList));
        $end = microtime(true) * 1000;
        header('Content-type: application/json');

        return json_encode(['message' => "Successfully indexed content in " . ($end - $start) . " microseconds", "start" => $start, "end" => $end]);
    }

    private function getWords(string $wordList, array $blacklist = [])
    {
        $found = [];
        $wordList = strtolower($wordList);
        foreach (preg_split("/\n|\s/", $wordList) as $word) {
            if (in_array($word, $blacklist)) {
                continue;
            }
            if (!isset($found[$word])) {
                $found[$word] = 0;
            }
            $found[$word]++;
        }

        return $found;
    }
}
