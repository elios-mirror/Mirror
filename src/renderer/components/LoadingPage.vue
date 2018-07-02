<template>
    <section class="hero is-fullheight has-text-centered">
        <div class="hero-body">
            <div class="container has-text-centered">
                <div class="loading-image">
                    <img draggable="false" v-bind:src="loadingImg" width="200px">
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

<script>
    const {ipcRenderer} = require('electron');
    const fs = require('fs');
    const path = require('path');

    const loadingsImgs = [];

    // List all loadingImg in /static/loadings
    fs.readdirSync(path.join(__static, '/loadings')).forEach(file => {
        loadingsImgs.push(file)
    })

    export default {
        name: 'loading-page',
        data() {
            return {
                loadingImg: 'static/default.gif',
                title: 'DEPLACEMENT DES SATELLITES',
                message: 'Chargement..'
            }
        },
        created() {

            // Set loadingImg randomly
            if (process.env.NODE_ENV === 'development') {
                this.loadingImg = 'static/loadings/' + loadingsImgs[Math.floor(Math.random() * loadingsImgs.length)]
            } else {
                this.loadingImg = path.join(__static, '/loadings/' + loadingsImgs[Math.floor(Math.random() * loadingsImgs.length)])
            }

            ipcRenderer.on('init_module', (event, data) => {
                this.message = 'Chargement du module <b>' + data.module + '</b>...';
            });

            ipcRenderer.on('loading_message', (event, data) => {
                this.message = data.message;
            });

            ipcRenderer.on('loading_finished', (event, data) => {
                this.$router.push('/login');
            });
        }
    }
</script>

<style scoped>
    .hero {
        background: #2C2F33;
    }

    .title {
        margin-top: 50px;
        font-size: 25px;
    }

    .subtitle {
        margin-top: 20px;
        font-size: 20px;
    }
</style>
