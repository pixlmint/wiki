<?php
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $existingUsers = json_decode(file_get_contents('users.json'), true);
    $userExists = false;
    foreach ($existingUsers as $user) {
        if ($user['username'] === $_REQUEST['username']) {
            header('HTTP/1.0 409');
            $message = 'This username is already taken';
            $userExists = true;
            break;
        }
    }
    if (!$userExists) {
        array_push($existingUsers, [
            'username' => $_REQUEST['username'],
            'password' => password_hash($_REQUEST['password']),
            'role' => 'Reader',
        ]);
        file_put_contents('users.json', json_encode($existingUsers));

        // header('Location: /');
    }
}
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
</head>
<body>
    <form method="POST" name="register" action="/register.php">            
            <?php if ($message) {
                echo $message;
            } ?>
        <div>
            <input type="text" name="username" placeholder="Username" value="<?php $_REQUEST[
                'username'
            ]; ?>">
        </div>
        <div>
            <input type="password" name="password" placeholder="Password" value="<?php $_REQUEST[
                'password'
            ]; ?>">
        </div>
        <button type="submit" action="/register.php">Register</button>
    </form>
</body>
</html>