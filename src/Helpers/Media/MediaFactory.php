<?php

namespace App\Helpers\Media;

use App\Contracts\MediaProcessor;
use App\Models\Media;
use App\Models\MediaDirectory;
use App\Models\ScaledMedia;

class MediaFactory
{
    private string $mediaPath;
    /** @var array|MediaProcessor[]  */
    private array $mediaHelpers;

    public function __construct(string $mediaPath, array $mediaHelpers = [])
    {
        $this->mediaPath = $mediaPath;
        $this->mediaHelpers = $mediaHelpers;
    }

    public static function run(string $mediaPath, array $mediaHelpers = []): Media
    {
        $indexer = new MediaFactory($mediaPath, $mediaHelpers);
        return $indexer->findMedia();
    }

    public function findMedia(): Media
    {
        $this->cleanupMediaPath();

        $mediaName = $this->getMediaName();
        $mediaMonth = $this->getMediaMonth();
        $mediaDay = $this->getMediaDay();

        $mediaDirectory = new MediaDirectory($mediaMonth, $mediaDay);

        $processor = $this->getMediaHelper();

        $scaled = $this->getScaled($processor);

        return new Media($mediaName, $mediaDirectory, $scaled);
    }

    private function getScaled(MediaProcessor $processor): array
    {
        $scaled = [];
        foreach($processor::getDefaultSizes() as $size) {
            $scaled[] = new ScaledMedia($size, $processor::getScaledExtension());
        }

        return $scaled;
    }

    private function getMediaHelper(): MediaProcessor
    {
        foreach ($this->mediaHelpers as $processor) {
            if (FileNameHelper::extensionMatches($this->mediaPath, $processor::getApplicableExtensions())) {
                return $processor;
            }
        }

        throw new \Exception('Unable to find an applicable Media Processor for ' . $this->mediaPath);
    }

    private function getMediaName(): string
    {
        $splMedia = explode(DIRECTORY_SEPARATOR, $this->mediaPath);

        return $splMedia[array_key_last($splMedia)];
    }

    private function getMediaMonth(): string
    {
        $splMedia = explode(DIRECTORY_SEPARATOR, $this->mediaPath);

        return $splMedia[2];
    }

    private function getMediaDay(): string
    {
        $splMedia = explode(DIRECTORY_SEPARATOR, $this->mediaPath);

        return $splMedia[3];
    }

    private function cleanupMediaPath(): void
    {
        $this->leadingSlashFix();
        $this->transformIntoRelativePath();
    }

    private function leadingSlashFix(): void
    {
        if (!str_starts_with($this->mediaPath, DIRECTORY_SEPARATOR)) {
            $this->mediaPath = DIRECTORY_SEPARATOR . $this->mediaPath;
        }
    }

    private function transformIntoRelativePath(): void
    {
        if (!$this->isAbsoluteMediaPath()) {
            return;
        }

        $this->mediaPath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $this->mediaPath);
    }

    private function isAbsoluteMediaPath(): bool
    {
        return str_starts_with($this->mediaPath, $_SERVER['DOCUMENT_ROOT']);
    }
}