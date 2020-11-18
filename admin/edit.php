<?php
$arr = $_REQUEST;
if (key_exists('file', $arr)) {
    $url = $_SERVER['DOCUMENT_ROOT'] . '/' . urldecode($arr['file']);
} elseif (key_exists('fulldir', $arr)) {
    $url = urldecode($arr['fulldir']);
}
if (strtolower($_SERVER['REQUEST_METHOD']) === 'post') {
    // print_r($arr);
    // $meta = $arr['meta'];

    // $date = new DateTime();
    // $meta['date_updated'] = $date->format('Y-m-d H:i:s');

    // $metaStr = "---\r\n";

    // foreach ($arr['meta'] as $key => $value) {
    //     $metaStr .= "${key}: ${value}\r\n";
    // }
    // $metaStr .= '---';

    // $arr['content'] = $metaStr . $arr['content'];
    echo $arr['content'];

    file_put_contents($url, $arr['content']);
} else {
     ?>
    <form method="POST" action="/admin">
        <?php foreach (
            getPageContent(file_get_contents($url))['meta']
            as $metaRow
        ) {
            // echo '<div class="row" id="' . $metaRow[0] . '"><label onclick="deleteMetaTag(\'' . $metaRow[0] . '\')">' .
            //     $metaRow[0] .
            //     '</label>: <input type="text" name="meta[' .
            //     $metaRow[0] .
            //     ']" value="' .
            //     $metaRow[1] .
            //     '"></div>';
        } ?>
        <!-- <div id="meta-tags"></div>
        <div id="new-meta-tag"><label>New Tag: <input type="text"></label><button type="button" onclick="addMeta($('#new-meta-tag input').val())">Save</button></div> -->
        <textarea name="content" id="content"></textarea>
        <input type="hidden" name="fulldir" value="<?php echo $url; ?>">
        <input type="hidden" name="location" value="<?php echo $arr[
            'location'
        ]; ?>">
        <button type="button" onclick="save()">Save</button>
    </form>
    <style>
        #last-saved {
            display: block;
            position: fixed;
            bottom: 0;
            right: 0;
            color: green;
        }
    </style>


    <div id="last-saved"></div>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js"></script>
    <script type="module">
        // note jsdelivr.net does not automatically minify .mjs
        import { encode, decode } from 'https://cdn.jsdelivr.net/npm/js-base64@3.6.0/base64.mjs';
        window.decode = decode;
    </script> 
    <script>
        let mde = new SimpleMDE({
            autofocus: true,
            forceSync: true
        });
        $(function() {
        mde.value(window.decode("<?php if (is_file($url)) {
            echo base64_encode(file_get_contents($url));
        } else {
            echo 'nofile';
        } ?>"));
        });
        let lastChange = new Date();
        let saver = null;

        mde.codemirror.on('change', function() {
            let changeDiff = new Date() - lastChange;
            window.clearInterval(saver);
            saver = window.setTimeout(save, 5000);
            lastChange = new Date();
        });

        document.querySelector('.CodeMirror').addEventListener('keydown', function(event) {
            if (event.code === 'KeyS' && event.ctrlKey) {
                event.preventDefault();
                save();
            };
        })

        function addMeta(name) {
            $('#meta-tags').append('<div class="row"><label>' + name + ': <input type="text" name="meta[' + name + ']"></div>')
            $('#new-meta-tag input').val('');
        }

        function deleteMetaTag(name) {
            if (!confirm('Are you sure you want to delete the tag ' + name + '?')) {
                return null;
            }
            $('#' + name).remove();
            save();
        }

        function save() {
            window.clearInterval(saver);
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/admin/edit.php');
            let form = new FormData(document.forms[0]);
            xhr.send(form);
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) {
                    return;
                }
                document.getElementById('last-saved').innerText = new Date().toLocaleTimeString();
            }
        }


        window.setTimeout(function() {
            Object.keys(mde.options.shortcuts).forEach(function(key) {
                const navEle = document.querySelector('#page-menu ul');
                navEle.innerHTML += '<li><b>' + key + ':</b> ' + mde.options.shortcuts[key] + '</li>';
            })
        }, 2);
    </script>
<?php
}

function getPageContent(string $fileContent)
{
    $meta = [];
    $pageContent = '';

    $split = array_reverse(explode('---', $fileContent));
    array_pop($split);
    $split = array_reverse($split);

    $pageContent = $split[1];

    foreach (explode("\r\n", $split[0]) as $metaRow) {
        $metaCells = explode(': ', $metaRow);
        if (count($metaCells) === 2) {
            array_push($meta, explode(': ', $metaRow));
        }
    }

    return ['meta' => $meta, 'content' => $pageContent];
}

?>
