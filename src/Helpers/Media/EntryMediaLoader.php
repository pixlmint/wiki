<?php

namespace App\Helpers\Media;

use App\Contracts\MediaProcessor;
use App\Models\Media;
use App\Models\MediaDirectory;

/**
 * A Class for loading media that belongs to a specific entry
 */
class EntryMediaLoader
{
    private string $entry;
    private MediaProcessor $processor;

    public function __construct(string $entry, MediaProcessor $processor)
    {
        $this->entry = $entry;
        $this->processor = $processor;
    }

    /**
     * @return array|Media[]
     */
    public static function run(string $entry, MediaProcessor $processor): array
    {
        $loader = new EntryMediaLoader($entry, $processor);
        return $loader->loadMedia();
    }

    /**
     * @return array|Media[]
     */
    public function loadMedia(): array
    {
        $this->cleanupEntryString();

        $month = $this->getMediaMonth();
        $day = $this->getMediaDay();

        $directory = new MediaDirectory($month, $day);

        $processorMedia = $this->processor->loadMedia($directory);
        return array_map(function (Media $media) {
            return $this->mediaToArray($media);
        }, $processorMedia);
    }

    private function mediaToArray(Media $media): array
    {
        return [
            'source' => $media->getMediaPath(),
            'default' => $media->getMediaPath($this->processor->getDefaultScaled()),
        ];
    }

    private function cleanupEntryString(): void
    {
        if (str_starts_with($this->entry, DIRECTORY_SEPARATOR)) {
            $this->entry = ltrim($this->entry, DIRECTORY_SEPARATOR);
        }
    }

    private function getMediaMonth(): string
    {
        $splEntry = explode(DIRECTORY_SEPARATOR, $this->entry);

        return $splEntry[0];
    }

    private function getMediaDay(): string
    {
        $splEntry = explode(DIRECTORY_SEPARATOR, $this->entry);

        return $splEntry[1];
    }
}