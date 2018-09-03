<template>
    <div>
        <div v-for="module in modules">
            <div v-html="module"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Home from './Home'

    export default Home
</script>

<style scoped>

</style>
