<link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
<script>
    const referer = '<?php echo $_SERVER['HTTP_REFERER']; ?>';
</script>
<script src="/dist/admin.bundle.js"></script>
<script>
    $(function() {
    window.mde.value(window.decode("<?php if (is_file($args['url'])) {
        echo base64_encode(file_get_contents($args['url']));
    } else {
        echo 'nofile';
    } ?>"));
    });
</script>