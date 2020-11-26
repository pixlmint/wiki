<?php

require $_SERVER['DOCUMENT_ROOT'] . '/pico/vendor/picocms/pico/lib/Pico.php';
require $_SERVER['DOCUMENT_ROOT'] . '/src/Helpers/CustomYamlParser.php';

class CustomPico extends Pico
{
    public function setRequestUrl(string $requestUrl)
    {
        $this->requestUrl = $requestUrl;

        return $this;
    }

    protected function loadConfig()
    {
        $this->config = [
            'site_title' => 'Pico',
            'base_url' => '/pico',
            'rewrite_url' => true,
            'debug' => false,
            'timezone' => null,
            'locale' => 'en',
            'theme' => 'api',
            'theme_config' => null,
            'theme_meta' => null,
            'themes_url' => 'themes/',
            'twig_config' => null,
            'date_format' => '%D %T',
            'pages_order_by_meta' => 'author',
            'pages_order_by' => 'alpha',
            'pages_order' => 'asc',
            'content_dir' => $_SERVER['DOCUMENT_ROOT'] . '/pico/content/',
            'content_ext' => '.md',
            'content_config' => [
                'extra' => true,
                'escape' => false,
                'breaks' => false,
                'auto_urls' => true,
            ],
            'assets_dir' => 'assets/',
            'assets_url' => null,
            'plugins_url' => null,
        ];
    }

    public function getConfig($configName = null, $default = null)
    {
        return $this->config[$configName];
    }

    public function getYamlParser()
    {
        if (!$this->yamlParser) {
            $this->yamlParser = new CustomYamlParser();
        }

        return $this->yamlParser;
    }

    protected function readPages()
    {
        $contentDir = $this->getConfig('content_dir');
        $contentExt = $this->getConfig('content_ext');

        $this->pages = array();
        $files = $this->getFiles($contentDir, $contentExt, self::SORT_NONE);
        foreach ($files as $i => $file) {
            // skip 404 page
            if (basename($file) === '404' . $contentExt) {
                unset($files[$i]);
                continue;
            }

            $id = substr($file, strlen($contentDir), -strlen($contentExt));

            // trigger onSinglePageLoading event
            // skip inaccessible pages (e.g. drop "sub.md" if "sub/index.md" exists) by default
            $conflictFile = $contentDir . $id . '/index' . $contentExt;
            $skipFile = in_array($conflictFile, $files, true) ?: null;

            if ($skipFile) {
                echo("Skipping file ${conflictFile}<br>");
                continue;
            }

            $url = $this->getPageUrl($id);
            if ($file !== $this->requestFile) {
                $rawContent = $this->loadFileContent($file);

                $headers = $this->getMetaHeaders();
                try {
                    $meta = $this->parseFileMeta($rawContent, $headers);
                } catch (\Symfony\Component\Yaml\Exception\ParseException $e) {
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

            if ($page !== null) {
                $this->pages[$id] = $page;
            }
        }
    }

    public function search()
    {
        $this->loadConfig();
        // check content dir
        if (!is_dir($this->config['content_dir'])) {
            throw new RuntimeException(
                'Invalid content directory "' .
                    $this->config['content_dir'] .
                    '"'
            );
        }
        $this->readPages();

        return $this->getPages();
    }
}
