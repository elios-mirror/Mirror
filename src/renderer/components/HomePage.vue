<template>
    <div>
        <div v-for="module in modules">
            <component :name="module.name" v-bind:is="module"></component>
        </div>
    </div>
</template>

<script lang="ts">
    import Home from './Home'

    export default Home
</script>

<style scoped>

</style>
