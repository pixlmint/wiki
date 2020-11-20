<?php
$message = '';

include $_SERVER['DOCUMENT_ROOT'] . '/UserHandler.php';

session_start();
session_regenerate_id();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $isValid = false;
    $foundUser = null;
    foreach (getUsers() as $user) {
        if (
            $user['username'] === $_REQUEST['username'] &&
            password_verify($_REQUEST['password'], $user['password'])
        ) {
            $isValid = true;
            $foundUser = $user;
            break;
        }
    }

    if (!$isValid) {
        $message = 'This password/ username is not valid';
        header('HTTP/1.0 400');
    } else {
        session_start();
        $_SESSION['user'] = $foundUser;
        if (!isset($_REQUEST['required_page'])) {
            $_REQUEST['required_page'] = '/';
        }
        header('Location: ' . $_REQUEST['required_page']);
    }
}
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authenticate</title>
    <link rel="stylesheet" href="/dist/style.css">
</head>
<body>
    <main>
        <article>
            <form name="login" method="POST" action="/auth.php">
                <h1>Login</h1>
                <?php echo $message; ?>
                <div>
                    <input type="text" autofocus name="username" placeholder="Username">
                </div>
                <div>
                    <input type="password" name="password" placeholder="Password">
                </div>
                <?php if (isset($_REQUEST['page'])) {?>
                <input type="hidden" name="required_page" value="<?php echo $_REQUEST[
                    'page'
                ]; ?>"><?php } ?>
                <button type="submit">Submit</button>
            </form>
        </article>
    </main>
</body>
</html>