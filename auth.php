<?php
session_start();
session_regenerate_id();
$message = '';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    print_r($_REQUEST);
    $allUsers = json_decode(file_get_contents('users.json'), true);
    $isValid = false;
    $foundUser = null;
    foreach ($allUsers as $user) {
        print_r($user);
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
        $_SESSION['user'] = json_encode($foundUser);
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
    <?php
        echo($message);
    ?>
    <div>
        <input type="text" name="username" placeholder="Username">
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