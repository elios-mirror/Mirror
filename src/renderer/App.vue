<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default Vue.extend({
        name: "electron-vue-typescript-starter",
        mounted() {

        }
    });
</script>

<style>
    @import "//cdn.materialdesignicons.com/2.0.46/css/materialdesignicons.min.css";
    @import url('https://fonts.googleapis.com/css?family=Roboto');

    #app {
        font-family: 'Roboto', sans-serif;
    }

    html {
        background: #36393e !important;
    }
</style>
