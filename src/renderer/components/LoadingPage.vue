<template>
    <section class="hero is-fullheight">
        <div class="pulse-loading"></div>
        <div class="text-loading">
           {{ message }}
        </div>

    </section>
</template>

<script type="ts">
    import Loading from './Loading'

    export default Loading
</script>

<style type="scss" scoped>

    .hero {
        background-color: #000000;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .text-loading {
        padding-top: 50px;
        color: white;
        font-weight: bold;
        text-transform: uppercase;
    }

    .pulse-loading {
        width: 4em;
        height: 4em;
        border-radius: 4em;
        background-color: white;
        outline: 1px solid transparent;
        animation: pulseanim 1.2s ease-in-out infinite;
    }

    @keyframes pulseanim {
        0% { transform: scale(0);}
        100% { transform: scale(1); opacity: 0;}
    }
</style>
