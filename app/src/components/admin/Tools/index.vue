<template>
    <div class="main-content">
        <div class="d-flex gap-1">
            <vk-button class="btn btn-icon btn-primary" @click="goHome"><fa icon="arrow-left"></fa></vk-button>
            <vk-button class="btn btn-primary" @click="generateBackup">Generate Backup</vk-button>
            <vk-button class="btn btn-primary" @click="rebuildCache">Rebuild Cache</vk-button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    methods: {
        generateBackup: function () {
            axios
                .get("/api/admin/generate-backup?token=" + this.$store.getters.token)
                .then((response) => {
                    location.href = response.data.file;
                });
        },
        rebuildCache() {
            this.$store.dispatch('buildCache', this.$store.getters.token);
        },
        goHome() {
            this.$router.push('/');
        },
    }
}
</script>