<template>
    <div class="modules columns is-multiline is-desktop">
        <div v-for="module in modules" class="module column" :key="module.name" v-bind:data-module="module.name">
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
    }
</style>
