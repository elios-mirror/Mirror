<template>
    <section class="hero is-dark is-fullheight has-text-centered">
        <div class="hero-body">
            <div class="container has-text-centered">
                <div class="loading-image">
                    <img draggable="false" src="https://images.sex.com/images/pinporn/2018/03/06/300/19205803.gif" width="200px">
                </div>
                <div class="title">
                    <span class="has-text-light" v-html="title"></span>
                </div>
                <div class="subtitle">
                    <span class="has-text-light" v-html="message"></span>
                </div>
            </div>
        </div>
    </section>
</template>

<script type="ts">
    import Loading from './Loading'

    export default Loading
</script>

<style scoped>
    .title {
        margin-top: 50px;
        font-size: 25px;
    }

    .subtitle {
        margin-top: 20px;
        font-size: 20px;
    }
</style>
