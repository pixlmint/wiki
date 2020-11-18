<?php

class CustomPicoOutput extends AbstractPicoPlugin
{
    private $mdFile;

    public function onRequestFile($file)
    {
        $picoFound = false;
        foreach (explode('/', $file) as $sub) {
            if ($sub === 'pico') {
                $picoFound = true;
            }
            if ($picoFound) {
                $this->mdFile .= '/' . $sub;
            }
        }
    }

    public function onPageRendering(&$templateName, array &$twigVariables)
    {
        $twigVariables['mdfile'] = $this->mdFile;
    }

    public function onPageRendered(&$output)
    {
        if ($_SERVER['REQUEST_URI'] !== '/pico/nav') {
            header('Content-Type: application/json');
        }
        $output = preg_replace("/\r|\n/", "", $output);
        $output = str_replace('&lt;', '<', $output);
        $output = str_replace('&gt;', '>', $output);
    }
}
