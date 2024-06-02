<template>
    <div>
        <el-select-v2 
            v-model='selected'
            :options='initialLanguages'
            placeholder='Enter a language'
            allow-create
            filterable
            clearable 
            @change='handleChange'
        />
    </div>
</template>

<script lang='ts' setup>
import {ref, onMounted} from 'vue';

const initialLanguages = ['en', 'de', 'fr', 'it', 'ru', 'cn', 'nl', 'es', 'la'];

const emits = defineEmits(['change']);
const props = defineProps({
    value: {
        type: String,
        default: 'en',
    }
});

const selected = ref('');

onMounted(() => {
    selected.value = props.value;
});

const handleChange = function () {
    emits('change', selected.value);
}
</script>

