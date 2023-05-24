<?php

namespace App\Helpers;

use ZipArchive;

class BackupHelper
{
    private array $toBackup;

    public function __construct()
    {
        $this->toBackup = [
            'content' => $_SERVER['DOCUMENT_ROOT'] . '/content',
            'media' => $_SERVER['DOCUMENT_ROOT'] . '/media',
            'data' => $_SERVER['DOCUMENT_ROOT'] . '/data',
        ];
    }

    public function generateBackup(): string
    {
        $zip = new ZipArchive();
        $archiveName = $_SERVER['DOCUMENT_ROOT'] . '/backup/' . time() . '.zip';
        if ($zip->open($archiveName, ZipArchive::CREATE)) {
            foreach ($this->toBackup as $dir) {
                $this->addToZipRecursive($zip, $dir);
            }
        }
        return substr($archiveName, strlen($_SERVER['DOCUMENT_ROOT']));
    }

    public function restoreFromBackup(string $backupPath): bool
    {
        $outDir = '/tmp/' . md5(time());
        $zip = new ZipArchive();
        $zip->open($backupPath);
        $zip->extractTo($outDir);
        $zip->close();

        $success = true;
        foreach ($this->toBackup as $name => $dir) {
            self::clearDirectory($dir);
            if (!self::xcopy($outDir . DIRECTORY_SEPARATOR . $name, $dir)) {
                $success = false;
            }
        }

        return $success;
    }

    private static function clearDirectory(string $dir)
    {
        foreach (scandir($dir) as $path) {
            if ($path !== '.' && $path !== '..') {
                self::rmdir_recursive($path);
            }
        }
    }

    private static function rmdir_recursive(string $dir)
    {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . DIRECTORY_SEPARATOR . $object) && !is_link($dir . "/" . $object)) {
                        self::rmdir_recursive($dir . DIRECTORY_SEPARATOR . $object);
                    } else {
                        unlink($dir . DIRECTORY_SEPARATOR . $object);
                    }
                }
            }
            rmdir($dir);
        } elseif (is_file($dir)) {
            unlink($dir);
        }
    }

    private function addToZipRecursive(ZipArchive $zip, string $toBackup): ZipArchive
    {
        if (is_dir($toBackup)) {
            foreach (scandir($toBackup) as $newToBackup) {
                if ($newToBackup !== '.' && $newToBackup !== '..') {
                    $zip = $this->addToZipRecursive($zip, $toBackup . '/' . $newToBackup);
                }
            }
        } else {
            $prefix = $_SERVER['DOCUMENT_ROOT'];
            if (substr($toBackup, 0, strlen($prefix)) == $prefix) {
                $str = substr($toBackup, strlen($prefix));
            }
            $zip->addFile($toBackup, $str);
        }

        return $zip;
    }

    /**
     * Copy a file, or recursively copy a folder and its contents
     *
     * @return      bool     Returns true on success, false on failure
     * @link        http://aidanlister.com/2004/04/recursively-copying-directories-in-php/
     * @author      Aidan Lister <aidan@php.net>
     */
    private static function xcopy(string $source, string $dest, int $permissions = 0755): bool
    {
        $sourceHash = self::hashDirectory($source);
        // Check for symlinks
        if (is_link($source)) {
            return symlink(readlink($source), $dest);
        }

        // Simple copy for a file
        if (is_file($source)) {
            return copy($source, $dest);
        }

        // Make destination directory
        if (!is_dir($dest)) {
            mkdir($dest, $permissions);
        }

        // Loop through the folder
        $dir = dir($source);
        while (false !== $entry = $dir->read()) {
            // Skip pointers
            if ($entry == '.' || $entry == '..') {
                continue;
            }

            // Deep copy directories
            if ($sourceHash != self::hashDirectory($source . "/" . $entry)) {
                self::xcopy("$source/$entry", "$dest/$entry", $permissions);
            }
        }

        // Clean up
        $dir->close();
        return true;
    }

    // In case of coping a directory inside itself, there is a need to hash check the directory otherwise and infinite loop of coping is generated
    private static function hashDirectory($directory)
    {
        if (!is_dir($directory)) {
            return false;
        }

        $files = array();
        $dir = dir($directory);

        while (false !== ($file = $dir->read())) {
            if ($file != '.' and $file != '..') {
                if (is_dir($directory . '/' . $file)) {
                    $files[] = self::hashDirectory($directory . '/' . $file);
                } else {
                    $files[] = md5_file($directory . '/' . $file);
                }
            }
        }

        $dir->close();

        return md5(implode('', $files));
    }
}
