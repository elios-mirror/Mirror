<template>
  <dnd-grid-container
    :layout.sync="layout"
    :cellSize="cellSize"
    :maxColumnCount="maxColumnCount"
    :maxRowCount="maxRowCount"
    :margin="margin"
    :bubbleUp="bubbleUp"
  >
    <dnd-grid-box
      v-for="module in modules"
      class="module"
      :key="module.installId"
      :boxId="module.installId"
      v-bind:data-module="module.installId"
    >
      <div v-html="module.html"></div>
    </dnd-grid-box>
  </dnd-grid-container>
</template>

<script lang="ts">
import Home from "./Home";

export default Home;
</script>

<style scoped>
.modules {
  padding: 10px;
}
.demo-box {
  width: 100%;
  height: 100%;
}
</style>
