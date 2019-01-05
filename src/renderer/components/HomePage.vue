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
      v-for="widget in widgets"
      class="module"
      :key="widget.id"
      :boxId="widget.id"
      v-bind:data-module="widget.id"
    >
      <div v-html="widget.html"></div>
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
