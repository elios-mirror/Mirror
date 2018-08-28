<template>
    <section class="has-text-white">
        {{ server.name }}

        <button class="button is-primary" @click="progress = 100">
            More
        </button>
        <progress class="progress is-primary" :value="progress" max="100">{{ progress }}%</progress>
    </section>
</template>

<script type="text/tsx">

    export default {
        name: "Module",
        props: ['server'],
        data() {
            return {
                progress: 0
            }
        }
    }
</script>

<style scoped>

    progress::-webkit-progress-value {
        -webkit-transition : width .5s ease;
        -moz-transition : width .5s ease;
        -o-transition : width .5s ease;
        transition : width .5s ease;
    }

</style>