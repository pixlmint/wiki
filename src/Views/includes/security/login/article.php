<form name="login" method="POST" action="/login">
    <h1>Login</h1>
    <?php echo $args['message']; ?>
    <div>
        <input type="text" autofocus name="username" placeholder="Username">
    </div>
    <div>
        <input type="password" name="password" placeholder="Password">
    </div>
    <?php if (isset($_REQUEST['page'])) { ?>
    <input type="hidden" name="required_page" value="<?php echo $_REQUEST[
        'page'
    ]; ?>"><?php } ?>
    <button type="submit">Submit</button>
</form>