<?php

namespace App\Repository;

use App\Models\EncodingJob;
use Nacho\ORM\AbstractRepository;
use Nacho\ORM\RepositoryInterface;

class EncodingJobRepository extends AbstractRepository implements RepositoryInterface
{
    public static function getDataName(): string
    {
        return 'encoding-job';
    }

    protected static function getModel(): string
    {
        return EncodingJob::class;
    }
}