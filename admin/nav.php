<style>
    nav summary::marker {
        display: none;
        color: transparent;
    }

    nav details ul {
        display: block;
        position: absolute;
        background-color: white;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 5px;
    }

    summary:hover {
        cursor: pointer;
    }
</style>
<ul>
<?php
$contentDir = $_SERVER['DOCUMENT_ROOT'] . '/pico';

function actions($actions) {
    echo('<details><summary>···</summary><ul>');

    foreach ($actions as $key => $value) {
        echo('<li><a href="' . $value . '">' . $key . '</a></li>');
    }

    echo('</ul></details>');
}

$ignoreFiles = ['.', '..', 'nav.md'];

function getDirectoryRecursive($dir, $parentDir)
{
    echo('<li style="display: flex"><b style="display: block">' . $dir . '</b>');
    $newParent = $parentDir . '/' . $dir;
    actions(['Delete' => '/admin/delete.php?dir=' . $newParent, 'Add' => '/admin?parent=' . $newParent . '&action=add.php']);
    echo('</li>');
    $ret = [];
    foreach (array_reverse(scandir($newParent)) as $sub) {
        $filedir = $newParent . '/' . $sub;
        if ($sub !== '.' && $sub !== '..' && $sub !== 'nav.md') {
            echo '<li style="display: flex">';
            if (is_file($newParent . '/' . $sub)) {
                echo '<a href="/admin?fulldir=' .
                    $filedir .
                    '&action=edit.php' .
                    '&location=/admin">' .
                    $sub .
                    '</a>';
                actions(['Delete' => '/admin/delete.php?file=' . $filedir]);
                array_push($ret, $filedir);
            } else {
                echo '<ul>';
                array_push($ret, getDirectoryRecursive($sub, $newParent));
                echo '</ul>';
            }
            echo '</li>';
        }
    }

    return $ret;
}

getDirectoryRecursive('content', $contentDir);
?>
</ul>