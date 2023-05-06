<?php

namespace App\Controllers;

use App\Contracts\MediaProcessor;
use App\Helpers\WikiConfiguration;
use App\Helpers\Media\EntryMediaLoader;
use App\Helpers\Media\ImageMediaType;
use App\Helpers\Media\MediaFactory;
use App\Helpers\Media\MimeHelper;
use App\Helpers\Media\VideoMediaType;
use App\Models\MediaDirectory;
use App\Models\Mime;
use Nacho\Controllers\AbstractController;
use App\Helpers\TokenHelper;
use Nacho\Models\Request;
use Nacho\Nacho;

class MediaController extends AbstractController
{
    /** @var array|MediaProcessor[] $mediaHelpers */
    private array $mediaHelpers = [];

    public function __construct(Nacho $nacho)
    {
        parent::__construct($nacho);
        $this->mediaHelpers['img'] = new ImageMediaType();
        $this->mediaHelpers['vid'] = new VideoMediaType();
    }

    /**
     * GET: /api/entry/gallery/upload
     */
    public function uploadMedia(Request $request)
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_REQUEST['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }
        if (!key_exists('entry', $_REQUEST)) {
            return $this->json(['message' => 'Please define the Entry'], 400);
        }

        $mediaDir = WikiConfiguration::mediaDir();
        $entry = $_REQUEST['entry'];
        $month = explode('/', $entry)[1];
        $day = explode('/', $entry)[2];
        $mediaDirectory = new MediaDirectory($month, $day);

        if (!is_dir("${mediaDir}/${entry}")) {
            mkdir("${mediaDir}${entry}", 0777, true);
        }

        $uploadedFiles = [];

        foreach ($_FILES as $file) {
            $helper = $this->getMediaHelper(Mime::init($file['type']));
            $media = $helper->storeMedia($file, $mediaDirectory);
            $tmpArr = $media->toFrontendArray();
            $tmpArr['scaled']['default'] = $media->getMediaPath($helper->getDefaultScaled());
            $uploadedFiles[] = $tmpArr;
        }

        return $this->json(['message' => 'uploaded files', 'files' => $uploadedFiles]);
    }

    // /api/admin/entry/media/load
    public function loadMediaForEntry(Request $request): string
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $user = $tokenHelper->isTokenValid($_REQUEST['token'], $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }

        $media = [];
        foreach ($this->mediaHelpers as $slug => $helper) {
            $media[] = [
                'name' => $helper::getName(),
                'slug' => $slug,
                'media' => EntryMediaLoader::run($_REQUEST['entry'], $helper),
            ];
        }

        return $this->json(["media" => $media]);
    }

    // /api/admin/entry/media/delete
    public function deleteMedia()
    {
        if (!key_exists('token', $_REQUEST)) {
            return $this->json(['message' => 'You need to be authenticated'], 401);
        }
        $tokenHelper = new TokenHelper();
        $token = $_REQUEST['token'];
        $user = $tokenHelper->isTokenValid($token, $this->nacho->getUserHandler()->getUsers());
        if (!$user) {
            return $this->json(['message' => 'The provided Token is invalid'], 401);
        }

        $img = $_GET['media'];

        $media = MediaFactory::run($img, $this->mediaHelpers);
        $delete = [];
        foreach ($this->mediaHelpers as $helper) {
            $delete[] = $helper->deleteMedia($media);
        }

        return $this->json($delete);
    }

    private function getMediaHelper(Mime $mime): MediaProcessor
    {
        foreach ($this->mediaHelpers as $mediaHelper) {
            $testMime = Mime::init($mediaHelper::getMimeType());
            if (MimeHelper::compareMimeTypes($testMime, $mime)) {
                return $mediaHelper;
            }
        }

        throw new \Exception('The Mime Type ' . $mime->printMime() . ' is not supported');
    }
}
