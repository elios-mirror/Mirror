<template>
    <div>
        Hello world ! 
    </div>
</template>


<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    mounted() {
        console.log('yes i\'am here');
    }
});
</script>


<style scoped>
    div {
        color: red;
        background: white;    
    }
</style>

