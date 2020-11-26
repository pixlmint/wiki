<form method="POST" action="/admin">
    <?php
//foreach (getPageContent(file_get_contents($url))['meta'] as $metaRow) {
// echo '<div class="row" id="' . $metaRow[0] . '"><label onclick="deleteMetaTag(\'' . $metaRow[0] . '\')">' .
//     $metaRow[0] .
//     '</label>: <input type="text" name="meta[' .
//     $metaRow[0] .
//     ']" value="' .
//     $metaRow[1] .
//     '"></div>';
//}
?>
    <!-- <div id="meta-tags"></div>
    <div id="new-meta-tag"><label>New Tag: <input type="text"></label><button type="button" onclick="addMeta($('#new-meta-tag input').val())">Save</button></div> -->
    <textarea name="content" id="content"></textarea>
    <input type="hidden" name="fulldir" value="<?php echo $args['url']; ?>">
    <input type="hidden" name="location" value="<?php echo $arr[
        'location'
    ]; ?>">
<button type="button" onclick="save()">Save</button>
</form>
<button id="toggle-nav-button" type="button" onclick="toggleNav()">^</button>
<div><a id="referer" href="javascrtip:void(0)">Return</a></div>
<div id="last-saved"></div>