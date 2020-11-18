<?php
if (key_exists('action', $_REQUEST)) {
    $action = $_REQUEST['action'];
} else {
    $action = null;
} ?>


<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wiki Admin</title>
    <link rel="stylesheet" href="/dist/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
    <script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
    <style>
        .CodeMirror {
            height: 70vh;
        }

        #toggle-nav-button {
            display: block;
            position: fixed;
            top: 0;
            right: 0;
            z-index: 5;
        }

        @media screen and (max-width: 500px) {
            article {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <main>
      <div id="nav-toggler" onclick="toggleMainNav()">
        <input type="checkbox" id="hamburg" />
        <label for="hamburg" class="hamburg">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </label>
      </div>
    <button id="toggle-nav-button" type="button" onclick="toggleNav()">^</button>
    <nav id="site-nav"><?php include 'nav.php'; ?></nav>
    <article><?php if ($action) {
        include $action;
    } else {
        echo '<p>Welcome to the admin panel. Please select a file to edit</p>';
    } ?>
    <div><a id="referer" href="javascrtip:void(0)">Return</a></div>
    </article>
    <nav id="page-menu"><ul></ul></nav>
    </main>
    <script src="/pico/themes/simple/assets/js/jquery.js"></script>
    <script>
        const referer = '<?php echo $_SERVER['HTTP_REFERER']; ?>';
    </script>
    <script src="/admin/admin.js"></script>
</body>
</html>