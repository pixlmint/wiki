<form method="POST" name="register" action="/register">            
<h1>Register</h1>
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