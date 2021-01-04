<?php

namespace Wiki\Helpers;

use Wiki\Wiki;

class NavRenderer
{
    private $wiki;

    /**
     * NavRenderer constructor.
     *
     * @param Wiki $wiki
     */
    public function __construct(Wiki $wiki)
    {
        $this->wiki = $wiki;
    }

    /**
     * Return if the given path is a subpath of the given parent path(s)
     *
     * @param string $path
     * @param string $parentPath array of paths
     *
     * @return boolean
     */
    public static function isSubPath(string $path, string $parentPath)
    {
        return startsWith($path, $parentPath) && $path !== $parentPath;
    }

    /**
     * Return an html nested list based on a nested pages array.
     *
     * @param array|null $pages a nested pages array
     *
     * @return string the html list
     */
    public function output(?array $pages = null)
    {
        if (!$pages) {
            $tmp = $this->wiki->getPages();
            $page = $this->wiki->getPage('/');
            $pages = ['/' => $this->findChildPages('/', $page, $tmp)];
        }
        $html = '<ul id="nav">';
        foreach ($pages as $pageID => $page) {
            if (!empty($page['hidden'])) continue;

            $childrenOutput = '';
            if (isset($page['children'])) {
                $childrenOutput = $this->output($page['children']);
            }

            $url = isset($page['url']) ? $page['url'] : false;

            // use title if the page has one and make a link if the page exists.
//            echo($url);
            if ($url) {
                $name = !empty($page['title']) ? $page['title'] : $pageID;
                $item = "<a page='${pageID}' href=\"$url\">$name</a>";
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

    private static function isDirectChild(string $path, string $parentPath)
    {
        if (!self::isSubPath($path, $parentPath)) {
            return false;
        }

        if ($parentPath === '/') {
           if (count(explode('/', $path)) === 2) {
               return true;
           }
           return false;
        }

        return count(explode('/', $path)) - 1 === count(explode('/', $parentPath));
    }

    private function findChildPages(string $id, array &$parentPage, array $pages)
    {
        foreach ($pages as $childId => $page) {
            if (isset($page['meta']['min_role'])) {
                if (!$this->wiki->getUserHandler()->isGranted($page['meta']['min_role'])) {
                    continue;
                }
            }
            if (self::isDirectChild($childId, $id)) {
                $page = $this->findChildPages($childId, $page, $pages);
                $parentPage['children'][$childId] = $page;
            }
        }

        return $parentPage;
    }
}
