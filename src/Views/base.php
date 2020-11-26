<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
      rel="stylesheet"
      href="/dist/style.css"
      type="text/css"
    />
    <?php if (isset($args['css'])) {
        echo $args['css'];
    } ?>
    <meta name="description" content="Welcome to my personal Wiki" />
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
      <nav id="site-nav" class="collapsed">
        <ul id="nav"><?php if (isset($args['nav'])) {
            echo $args['nav'];
        } ?></ul>
        <details>
          <summary><?php echo $args['user']['username']; ?></summary>
          <ul>
            <li><?php if ($args['user']['username'] !== 'Guest') {
                echo '<a href="/logout">Logout</a>';
            } else {
                echo '<a href="/login">Login</a>';
            } ?>
            </li><?php if (
                isGranted('Editor')
            ) { ?><li><a href="/admin">Admin</a></li><?php } ?>
          </ul>
        </details>
      </nav>

      <article>
      <?php if (isset($args['article'])) {
          echo $args['article'];
      } ?>
        <footer>
            <?php if (isset($args['footer'])) {
                echo $args['footer'];
            } ?>
        </footer>
      </article>
      <nav id="page-menu" class="navbar"><ul></ul></nav>
    </main>
    <?php if (isset($args['js'])) {
        echo $args['js'];
    } ?>
  </body>
</html>
