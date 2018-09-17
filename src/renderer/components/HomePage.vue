<template>
    <div class="modules">
        <div v-for="module in modules" class="module" :key="module.id">
            <div v-html="module"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Home from './Home'

    export default Home
</script>

<style scoped>
    .modules {
        padding: 10px;
        display: block;
        overflow: auto;
    }
    .module {
        display: block;
    }
</style>
