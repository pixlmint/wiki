<div>
    <h1>Add a new file</h1>
    <form method="POST" action="/admin/add">
        <input type="text" autofocus name="filename">
        <input type="hidden" name="parent" value="<?php echo $_REQUEST['parent']; ?>">
        <button type="submit">Submit</button>
    </form>
</div>