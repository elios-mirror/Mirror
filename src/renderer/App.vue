<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default class App extends Vue {
  name: string = "electron-vue-typescript-starter";
  created() {
      console.log('cccc');
      console.log(this.$container)
  }
};
</script>

<style>
  @import "//cdn.materialdesignicons.com/2.0.46/css/materialdesignicons.min.css";
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  #app { font-family: 'Roboto', sans-serif; }
</style>
