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
        <ul id="nav"></ul>
      </nav>

      <article>
        <div>
          <h1 class="js-article-title"></h1>
          <div
            id="article-content"
            data-spy="scroll"
            data-target="#page-menu"
            data-offset="0"
            class="loading"
          ></div>
        </div>
        <footer>
          <!-- Add a footer -->
          <a id="edit-link" href="javascript:void(0)">Edit Page</a>
        </footer>
      </article>
      <nav id="page-menu" class="navbar"><ul></ul></nav>
    </main>
    <script src="/dist/app.js"></script>
  </body>
</html>
