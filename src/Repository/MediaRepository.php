<?php

namespace App\Repository;

use App\Models\Media;
use Nacho\ORM\AbstractRepository;
use Nacho\ORM\ModelInterface;
use Nacho\ORM\RepositoryInterface;

/**
 * @deprecated Do not use MediaRepository as the file system is the DB in this case
 */
class MediaRepository extends AbstractRepository implements RepositoryInterface
{
    public static function getDataName(): string
    {
        return 'media';
    }

    public function getByDay(string $day): Media|ModelInterface
    {
        foreach ($this->getData() as $id => $data) {
            if ($data['day'] === $day) {
                return $this->getById($id);
            }
        }

        throw new \Exception("Unable to find media from day ${day}");
    }

    protected static function getModel(): string
    {
        return Media::class;
    }
}