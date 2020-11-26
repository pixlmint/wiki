<?php

class CustomYamlParser
{
    public function parse($string)
    {
        $data = explode("\n", $string);
        $ret = [];
        foreach ($data as $row) {
            $cells = explode(':', $row);
            $ret[$cells[0]] = trim($cells[1]);
        }
        return $ret;
    }
}
