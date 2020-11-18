<div>
<h1>Add a new file</h1>
<form method="POST" action="/admin/add.php">
<input type="text" autofocus name="filename">
<input type="hidden" name="parent" value="<?php echo $_REQUEST['parent']; ?>">
<button type="submit">Submit</button>
</form>
</div>

<?php if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    print_r($_REQUEST);
    $date = new DateTime();
    $content =
        '---\ntitle: ' .
        $_REQUEST['filename'] .
        '\ndate: ' .
        $date->format('Y-m-d H:i') .
        '\n---';
    $file = $_REQUEST['parent'] . '/' . $_REQUEST['filename'];
    $parentDir = explode('/', $_REQUEST['filename']);
    array_pop($parentDir);
    $createDirs = '';
    foreach ($parentDir as $newDir) {
        if (!is_dir($_REQUEST['parent'] . '/' . $createDirs . '/' . $newDir)) {
            mkdir($_REQUEST['parent'] . '/' . $createdDirs . '/' . $newDir);
        }
        if ($createdDirs) {
            $createdDirs .= '/';
        }
        $createdDirs .= $newDir;
    }
    file_put_contents($file, $content);
    header('Location: /admin?action=edit.php&fulldir=' . $file);
    die();
}
