<template>
    <div>
        Redirecting...
    </div>
</template>

<script>
export default {
    created() {
        const token = this.$store.getters.token;
        if (token === null) {
            this.$router.push('/auth/login');
        } else {
            this.$router.push('/');
        }
    }
}
</script>