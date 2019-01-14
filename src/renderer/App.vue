<template>
  <div id="app">
    <transition name="fade" :duration="1000">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "electron-vue-typescript-starter",
  mounted() {}
});
</script>

<style>
#app {
  font-family: "Roboto", sans-serif;
  color: white;
}

html {
  background: #000000 !important;
}
</style>
