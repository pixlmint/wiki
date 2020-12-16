<?php

namespace Wiki\Helpers;

use Wiki\Wiki;

class NavRenderer
{
    protected $items;
    private $wiki;
    private $pages;

    /**
     * NavRenderer constructor.
     *
     * @param Wiki $wiki
     */
    public function __construct(Wiki $wiki)
    {
        $this->wiki = $wiki;
        $this->pages = [];
    }

    /**
     * Construct the nested pages array.
     *
     * @param array[] &$pages data of all known pages
     *
     * @return void
     */
    public function onPagesLoaded(array &$pages)
    {
        $tmp = [];
        foreach ($pages as $key => $value) {
            $url = $value['url'];
            if ($url !== '/nav') {
                $url = substr($url, 5);
                $value['url'] = $url;
                $tmp[$key] = $value;
            }
        }
        $this->items = $this->nestedPages($tmp);
    }

    /*
     * Create the nested pages array according to the pages paths.
     *
     * @see    nested_path
     * @param  array $pages Pico pages flat array
     */
    public function nestedPages($pages)
    {
        $this->items = array();
        foreach ($pages as $page) {
            $nested_path = $this->nested_path($page);
            $this->items = array_replace_recursive($this->items, $nested_path);
        }
        return $this->items['_childs'];
    }

    public function getItems()
    {
        return $this->items;
    }

    /**
     * Create a nested array of a given path, with the page at the end.
     * Each path fragment is in "_childs" of the parent.
     *
     * @param array $page the page array
     *
     * @return array  the nested path
     */
    public function nested_path($page)
    {
        $path = self::rtrim($page['id'], '/index');
        $parts = explode('/', $path);
        $count = count($parts);

        $arr = array();
        $parent = &$arr;
        foreach ($parts as $id => $part) {
            $value = [];
            if (!$part || $id == $count - 1) {
                $value = $page;
            } else {
                $currpath = implode('/', array_slice($parts, 0, $id + 1));
                $value['id'] = $currpath;
            }
            if ($path && !$part) {
                $parent = $value;
                break;
            }

            $parent['_childs'][$part] = $value;
            $parent = &$parent['_childs'][$part];
        }
        return $arr;
    }

    /**
     * Strip a substring from the end of a string
     *
     * @param string $str The input string.
     * @param string $substr The substring to remove.
     *
     * @return string  The modified string.
     */
    public static function rtrim(string $str, string $substr)
    {
        $length = strlen($substr);
        return (substr($str, -$length) === $substr) ? substr($str, 0, -$length) : $str;
    }

    /**
     * Filter the pages array according to given paths, as exclusive or inclusive.
     *
     * @param array   $pages         The flat or nested pages array.
     * @param array   $filteredPaths The paths to filter.
     * @param boolean $isInclusive   If `true` only corresponding paths are kept.
     *
     * @param array   $inclusiveOutput
     *
     * @return void|array The filtered array of pages.
     */
    public static function filterPages(array $pages, array $filteredPaths, $isInclusive = false, $inclusiveOutput = [])
    {
        foreach ($pages as $i => $page) {
            if (!isset($page['id'])) return;

            $path = self::rtrim($page['id'], '/index');
            $isSubPath = self::isSubPath($path, $filteredPaths);
            if ($isSubPath) {
                if ($isInclusive) $inclusiveOutput[$i] = $page;
                else unset($pages[$i]);
                continue;
            }
            if (isset($page['_childs'])) {
                $children = self::filterPages($page['_childs'], $filteredPaths, $isInclusive, $inclusiveOutput);
                if ($isInclusive) {
                    $inclusiveOutput = $children;
                } else {
                    $pages[$i]['_childs'] = $children;
                }
            }
        }

        return $isInclusive ? $inclusiveOutput : $pages;
    }

    /**
     * Return if the given path is a subpath of the given parent path(s)
     *
     * @param string $path
     * @param array  $parentPaths array of paths
     *
     * @return boolean
     */
    public static function isSubPath($path, $parentPaths)
    {
        foreach ($parentPaths as $p) {
            if (!is_string($p)) continue;
            if ($path == $p) return true;
            if (strncmp($path, $p, strlen($p)) === 0)
                return true;
        }
        return false;
    }

    /**
     * Return an html nested list based on a nested pages array.
     *
     * @param array $pages a nested pages array
     *
     * @return string the html list
     */
    public function output(array $pages)
    {
        $html = '<ul id="nav">';
        foreach ($pages as $pageID => $page) {
            if (!empty($page['hidden'])) continue;

            $childrenOutput = '';
            if (isset($page['_childs'])) {
                $childrenOutput = $this->output($page['_childs']);
            }

            $url = isset($page['url']) ? $page['url'] : false;

            // use title if the page has one and make a link if the page exists.
            echo($url);
            if ($url) {
                $name = !empty($page['title']) ? $page['title'] : $pageID;
                $item = "<a href=\"$url\">$name</a>";
            } else {
                $item = "<span>$pageID</span>";
            }

            // add the pageID in class and indicate if it is the current or parent of the current page.
            $class = $pageID;
            $class .= $url ? ' is-page' : ' is-directory';
            if ($childrenOutput) $class .= ' has-childs';

            $html .= "<li class=\"$class\">$item$childrenOutput</li>";
        }
        $html .= '</ul>';
        return $html;
    }
}
