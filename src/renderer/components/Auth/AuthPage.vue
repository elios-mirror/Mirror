<template>
    <section class="hero is-fullheight">
        <button @click="login">LOGIN</button>

        <qrcode value="Hello, World!" :options="{ size: 200 }"></qrcode>
    </section>
</template>

<script lang="ts">
    import Auth from './Auth'

    export default Auth
</script>

<style scoped>

</style>
