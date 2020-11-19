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
        header('Location: /');
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
    
<form name="login" method="POST" action="/auth.php">
    <?php echo $message; ?>
    <div>
        <input type="text" autofocus name="username" placeholder="Username">
    </div>
    <div>
        <input type="password" name="password" placeholder="Password">
    </div>
    <input type="hidden" name="required_page" value="<?php echo $_REQUEST[
        'page'
    ]; ?>">
    <button type="submit">Submit</button>
</form>
</body>
</html>