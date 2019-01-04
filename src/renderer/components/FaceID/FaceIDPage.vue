<template>
  <div>
    <div class="faceid" v-html="htmlFaceId"></div>
  </div>
</template>

<script lang="ts">
import FaceID from "./faceID";
export default FaceID;
</script>

<style  scoped>
.faceid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
