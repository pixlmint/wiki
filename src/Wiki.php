<?php

namespace Wiki;

use InvalidArgumentException;
use Symfony\Component\Yaml\Exception\ParseException;
use Wiki\Helpers\Request;
use Wiki\Helpers\RequestInterface;
use Wiki\Security\JsonUserHandler;
use Wiki\Security\UserHandlerInterface;

class Wiki
{
    protected $request;
    public $userHandler;
    private $pages;

    public function __construct(RequestInterface $request, UserHandlerInterface $userHandler)
    {
        $this->request = $request;
        $this->userHandler = $userHandler;
        $this->pages = [];
    }

    public function getRequest()
    {
        return $this->request;
    }

    public function getUserHandler()
    {
        return $this->userHandler;
    }

    public function isGranted(string $minRight = 'Guest', ?array $user = null)
    {
        return $this->userHandler->isGranted($minRight, $user);
    }

    public function getFiles($directory)
    {
        $directory = rtrim($directory, '/');
        $fileExtensionLength = strlen('.md');
        $result = array();

        $files = scandir($directory);
        if ($files !== false) {
            foreach ($files as $file) {
                // exclude hidden files/dirs starting with a .; this also excludes the special dirs . and ..
                // exclude files ending with a ~ (vim/nano backup) or # (emacs backup)
                if (($file[0] === '.') || in_array(substr($file, -1), array('~', '#'), true)) {
                    continue;
                }

                if (is_dir($directory . '/' . $file)) {
                    // get files recursively
                    $result = array_merge($result, $this->getFiles($directory . '/' . $file . '.md'));
                } elseif (substr($file, -$fileExtensionLength) === '.md') {
                    $result[] = $directory . '/' . $file;
                }
            }
        }

        return $result;
    }

    public function getPageUrl($page, $queryData = null, $dropIndex = true)
    {
        if (is_array($queryData)) {
            $queryData = http_build_query($queryData, '', '&');
        } elseif (($queryData !== null) && !is_string($queryData)) {
            throw new InvalidArgumentException(
                'Argument 2 passed to ' . __METHOD__ . ' must be of the type array or string, '
                . (is_object($queryData) ? get_class($queryData) : gettype($queryData)) . ' given'
            );
        }

        // drop "index"
        if ($dropIndex) {
            if ($page === 'index') {
                $page = '';
            } elseif (($pagePathLength = strrpos($page, '/')) !== false) {
                if (substr($page, $pagePathLength + 1) === 'index') {
                    $page = substr($page, 0, $pagePathLength);
                }
            }
        }

        if (!$queryData) {
            $queryData = '';
        }

        if (!$page) {
            return $this->getBaseUrl() . $queryData;
        } else {
            return $this->getBaseUrl() . implode('/', array_map('rawurlencode', explode('/', $page))) . $queryData;
        }
    }

    public function getBaseUrl()
    {
        $host = 'localhost';
        if (!empty($_SERVER['HTTP_X_FORWARDED_HOST'])) {
            $host = $_SERVER['HTTP_X_FORWARDED_HOST'];
        } elseif (!empty($_SERVER['HTTP_HOST'])) {
            $host = $_SERVER['HTTP_HOST'];
        } elseif (!empty($_SERVER['SERVER_NAME'])) {
            $host = $_SERVER['SERVER_NAME'];
        }

        $port = 80;
        if (!empty($_SERVER['HTTP_X_FORWARDED_PORT'])) {
            $port = (int) $_SERVER['HTTP_X_FORWARDED_PORT'];
        } elseif (!empty($_SERVER['SERVER_PORT'])) {
            $port = (int) $_SERVER['SERVER_PORT'];
        }

        $hostPortPosition = ($host[0] === '[') ? strpos($host, ':', strrpos($host, ']') ?: 0) : strrpos($host, ':');
        if ($hostPortPosition !== false) {
            $port = (int) substr($host, $hostPortPosition + 1);
            $host = substr($host, 0, $hostPortPosition);
        }

        $protocol = 'http';
        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $secureProxyHeader = strtolower(current(explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'])));
            $protocol = in_array($secureProxyHeader, array('https', 'on', 'ssl', '1'), true) ? 'https' : 'http';
        } elseif (!empty($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] !== 'off')) {
            $protocol = 'https';
        } elseif ($port === 443) {
            $protocol = 'https';
        }

        $basePath = isset($_SERVER['SCRIPT_NAME']) ? dirname($_SERVER['SCRIPT_NAME']) : '/';
        $basePath = !in_array($basePath, array('.', '/', '\\'), true) ? $basePath . '/' : '/';

        if ((($protocol === 'http') && ($port !== 80)) || (($protocol === 'https') && ($port !== 443))) {
            $host = $host . ':' . $port;
        }

        $this->config['base_url'] = $protocol . "://" . $host . $basePath;
        return $this->config['base_url'];
    }

    protected function readPages()
    {
        $contentDir = $_SERVER['DOCUMENT_ROOT'] . '/content';

        $this->pages = array();
        $files = $this->getFiles($contentDir);
        foreach ($files as $i => $file) {
            $id = substr($file, strlen($contentDir), -3);

            // trigger onSinglePageLoading event
            // skip inaccessible pages (e.g. drop "sub.md" if "sub/index.md" exists) by default
            $conflictFile = $contentDir . $id . '/index.md';
            $skipFile = in_array($conflictFile, $files, true) ?: null;

            if ($skipFile) {
                continue;
            }

            $url = $this->getPageUrl($id);
            if ($file !== $this->requestFile) {
                $rawContent = $this->loadFileContent($file);

                $headers = $this->getMetaHeaders();
                try {
                    $meta = $this->parseFileMeta($rawContent, $headers);
                } catch (ParseException $e) {
                    $meta = $this->parseFileMeta('', $headers);
                    $meta['YAML_ParseError'] = $e->getMessage();
                }
            } else {
                $rawContent = &$this->rawContent;
                $meta = &$this->meta;
            }

            // build page data
            // title, description, author and date are assumed to be pretty basic data
            // everything else is accessible through $page['meta']
            $page = array(
                'id' => $id,
                'url' => $url,
                'title' => &$meta['title'],
                'description' => &$meta['description'],
                'author' => &$meta['author'],
                'time' => &$meta['time'],
                'date' => &$meta['date'],
                'date_formatted' => &$meta['date_formatted'],
                'hidden' => ($meta['hidden'] || preg_match('/(?:^|\/)_/', $id)),
                'raw_content' => &$rawContent,
                'meta' => &$meta
            );

            if ($file === $this->requestFile) {
                $page['content'] = &$this->content;
            }

            unset($rawContent, $meta);

            // trigger onSinglePageLoaded event
            $this->triggerEvent('onSinglePageLoaded', array(&$page));

            if ($page !== null) {
                $this->pages[$id] = $page;
            }
        }
    }
}