<template>
    <section class="hero is-fullheight">
        <div class="box" v-show="wave">
            <div class="title has-text-centered has-text-light">
                Bienvenue, seigneur Tyranus
            </div>

            <div class="subtitle has-text-centered has-text-light">
                "Fais le ou ne le fais pas. Il n'y a pas d'essai." - <font style="font-weight: bold">Yoda</font>
            </div>
            <form v-on:submit.prevent="submit()">
                <b-field
                        custom-class="has-text-light"
                        v-bind:message="errors.login"
                        v-bind:type="errors.login ? 'is-danger' : ''"
                        label="Email">
                    <b-input type="email"
                             v-model="login"
                             required>
                    </b-input>
                </b-field>
                <b-field
                        custom-class="has-text-light"
                        v-bind:message="errors.password"
                        v-bind:type="errors.password ? 'is-danger' : ''"
                        label="Password">
                    <b-input type="password"
                             v-model="password"
                             message=""
                             password-reveal
                             required>
                    </b-input>
                </b-field>
                <b-field>
                    <button class="button is-primary is-fullwidth" v-bind:class="{'is-loading': isLoading}">Sign In
                    </button>
                </b-field>
            </form>
        </div>
        <div class="wave -one" v-bind:class="{'-paused': !wave}"></div>
        <div class="wave -two"></div>
        <div class="wave -three"></div>
    </section>
</template>

<script lang="ts">
    import Login from './Login'

    export default Login
</script>

<style scoped>

    .hero {
        background: url('~@/assets/background.jpg') no-repeat center center fixed;
    }

    .title {
        font-size: 25px;
        margin-bottom: 40px;
        font-weight: lighter;
    }

    .subtitle {
        font-size: 15px;
        margin-bottom: 30px;
        font-weight: lighter;
    }

    .box {
        z-index: 2;
        top: 50%;
        left: 50%;
        width: 400px;
        height: 400px;
        border-radius: 5px;
        box-shadow: 0 2px 30px rgba(black, .2);
        background: #36393f;
        position: absolute;
        overflow: hidden;
        transform: translateY(-50%) translateX(-50%);
    }

    .wave {
        opacity: 1;
        position: absolute;
        top: 3%;
        left: 50%;
        background: #2c2f33;
        width: 500px;
        height: 500px;
        margin-left: -70%;
        margin-top: -20%;
        transform-origin: 50% 48%;
        border-radius: 40%;
        animation: drift 3000ms infinite linear;
        transition: 1s ease;
    }

    .wave.-paused {
        top: 0 !important;
        left: 0 !important;
        background: #2c2f33 !important;
        width: 100% !important;
        height: 100% !important;
        margin-left: 0 !important;
        margin-top: 0 !important;
        transform-origin: 0 0 !important;
        border-radius: 0px !important;
        animation: none;
    }

    .wave.-three {
        animation: drift 5000ms infinite linear;
        opacity: .7;
    }

    .wave.-two {
        animation: drift 7000ms infinite linear;
        opacity: .4;
    }

    ::-webkit-scrollbar {
        display: none;
    }

    @keyframes drift {
        from {
            transform: rotate(0deg);
        }
        from {
            transform: rotate(360deg);
        }
    }
</style>
