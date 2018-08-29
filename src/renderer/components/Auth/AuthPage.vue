<template>
    <section class="hero is-fullheight">
        <qrcode :options="{ foreground:'white', backgroundAlpha: 0, value: mirrorId, size:300 }" class="qrcode"></qrcode>
        <button @click="login">LOGIN</button>
    </section>
</template>

<script lang="ts">
    import Auth from './Auth'

    export default Auth
</script>

<style scoped>

.qrcode {
    height: 50%;
    width: 50%;
}

</style>
