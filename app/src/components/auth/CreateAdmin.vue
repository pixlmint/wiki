<template>
    <div class="main-content">
        <form>
            <input class="uk-input" type="text" v-model="username" placeholder="Admin Username">
            <input class="uk-input" type="text" v-model="password" placeholder="Admin Password">
            <vk-button class="btn btn-primary" @click="submit">Submit</vk-button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import { queryFormatter } from '../../helpers/queryFormatter';

export default {
    data: function () {
        return {
            username: '',
            password: '',
        }
    },
    methods: {
        submit() {
            const data = {
                username: this.username,
                password: this.password,
            }
            axios({
                method: "POST",
                url: '/api/auth/create-admin',
                data: queryFormatter(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => {
                if (response.data.adminCreated) {
                    this.$router.push('/auth/login');
                }
            })
        }
    }
}
</script>