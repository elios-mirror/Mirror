<template>
    <section class="hero is-full-height">
        <section class="sidebar is-more-dark has-text-centered">
            <div class="sidebar-communities">
                <div class="sidebar-top">

                </div>
                <draggable v-model="communities">
                    <transition-group>
                        <div class="sidebar-community"
                             v-for="community of communities"
                             :key="community.id"
                             v-on:dragstart="startDrag(community)"
                             v-on:dragend="stopDrag(community)">
                            <div class="community"
                                 draggable="true"
                                 :id="community.id"
                                 v-on:mouseenter="setCursorCommunity(community)"
                                 v-on:mouseleave="cursorCommunity = null"
                                 v-bind:class="{'community-selected': selectedCommunity === community}"
                                 @click="setSelectedCommunity(community)">
                                <img v-bind:src="community.logo"
                                     draggable="false">
                            </div>
                        </div>
                    </transition-group>
                </draggable>
            </div>

            <b-tooltip
                    v-bind:always="cursorCommunity !== null"
                    v-bind:label="cursorCommunity ? cursorCommunity.name : ''"
                    :style="{top: cursorCommunityPosition}"
                    type="is-black"
                    position="is-right">
            </b-tooltip>
        </section>

        <section class="topbar is-middle-dark">

            <div class="topbar-left">
                <a v-if="selectedServer" class="button" @click="setSelectedServer(null)">
                    <b-icon
                            icon="chevron-left"
                            type="is-dark">
                    </b-icon>
                    &nbsp; Back
                </a>
            </div>

            <div class="topbar-center">

            </div>


            <div class="topbar-right">
                <a class="button is-text" v-on:click="logout()">
                    <b-icon
                            icon="sign-out-alt"
                            type="is-light">
                    </b-icon>
                </a>

                <a class="button is-text" v-on:click="test()">
                    <b-icon
                            icon="sync"
                            type="is-light"
                            v-on:mouseenter="this.style.color = '#ffa'">
                    </b-icon>
                </a>
            </div>
        </section>

        <section class="main is-dark has-text-centered">
            <div class="body">
                <module v-if="selectedServer" v-bind:server="selectedServer"></module>
                <section v-if="selectedCommunity && !selectedServer">
                    <div class="tile is-ancestor">
                        <div class="tile is-vertical is-8">
                            <div class="tile servers-list" v-for="server of selectedCommunity.servers">
                                <div class="tile is-parent">
                                    <article
                                            class="tile is-child notification is-info">
                                        <p class="title">{{ server.name}}</p>
                                        <p class="subtitle">{{ server.module.name}} @ {{ server.module.version }}</p>
                                        <a class="button" @click="setSelectedServer(server)">
                                            <b-icon icon="eye">
                                            </b-icon>
                                        </a>
                                        <a class="button" @click="play(server)">
                                            <b-icon icon="play">
                                            </b-icon>
                                        </a>
                                    </article>
                                </div>
                            </div>
                        </div>
                        <div class="tile is-parent"
                             style="position: fixed; right: 0; bottom: 0; top: 0; padding-top: 50px">
                            <article class="tile is-child notification is-success">
                                <div class="content">
                                    <p class="title">{{ selectedCommunity.name }}</p>
                                    <p class="subtitle">With even more content</p>
                                    <div class="content">
                                        This community have: {{ selectedCommunity.servers.length }} servers
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>
                <section v-if="!selectedCommunity" class="has-text-light">
                    Welcome to the v6 :)

                </section>

            </div>
        </section>
    </section>
</template>

<script lang="ts">
    import Home from './Home'

    export default Home
</script>

<style scoped>

    .main {
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100vw;
        height: 100vh;
        padding-left: 70px;
        padding-top: 40px;
        z-index: 0;
    }

    .servers-list {

    }

    .body {
        padding: 10px;
    }

    .topbar {
        -webkit-app-region: drag;
        padding-left: 70px;
        position: fixed;
        width: 100%;
        height: 40px;
        z-index: 1;
        box-shadow: 0 1px 0 rgba(0, 0, 0, .2), 0 2px 0 rgba(0, 0, 0, .06);
        display: flex;
        justify-content: space-between;
    }

    .topbar-center {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        align-content: center;
    }

    .topbar-left {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        align-content: left;
        float: left;
        padding-left: 10px;
    }

    .topbar-right {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        align-content: right;
        float: right;
        padding-right: 10px;
    }

    .sidebar {
        position: absolute;
        height: 100%;
        max-height: 100%;
        padding: 0;
        margin: 0;
        animation: sidebar-animation 0.5s forwards;
        left: -70px;
        z-index: 2;
    }

    @keyframes sidebar-animation {
        100% {
            left: 0;
        }
    }

    .sidebar-top {
        z-index: 2;
        position: absolute;
        background: red;
        width: 100%;
        max-width: 100%;
        height: 33px;
        top: 0;
        left: 0;
    }

    .sidebar-communities {
        overflow-y: scroll;
        overflow-x: hidden;
        padding: 43px 0 0 0;
        margin-top: 0;
        width: 70px;
        height: 100%;
        z-index: 200;
    }

    .sortable-ghost .community > img {
        display: none;
    }

    .sortable-ghost .community {
        background: none !important;
        border: 2px dashed #36393e !important;
        border-radius: 50% !important;
        transition: none !important;
        animation: none !important;
    }

    .sidebar-community {
        position: relative;
        margin-bottom: 5px;
        transform: translate(0, 0);
    }

    ::-webkit-scrollbar {
        display: none;
    }

    @keyframes shakeit {
        0% {
            border-radius: 50%;
        }
        30% {
            border-radius: 20%;
        }
        60% {
            border-radius: 30%;
        }
        90% {
            border-radius: 33%;
        }
        100% {
            border-radius: 30%;
        }
    }

    .community {
        overflow: hidden;
        cursor: pointer;
        background-color: black !important;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: block;
        margin: auto;
        transition: border-radius 0.5s;
    }

    .community:hover {
        animation-name: shakeit;
        animation-duration: 0.5s;
        animation-timing-function: linear;
        border-radius: 30%;
    }

    .community.community-selected {
        border-radius: 30%;
        animation: none;
    }

    .community.community-selected::before {
        content: '';
        position: absolute;
        left: -15px;
        top: 50%;
        width: 15px;
        height: 40px;
        background: white;
        border-radius: 20px;
        transform: translateY(-50%);
        animation: community-selected-animation 0.3s forwards;
    }

    @keyframes community-selected-animation {
        100% {
            left: -10px;
        }
    }

    .tooltip {
        position: absolute;
        top: 0;
        left: 65px;
    }

</style>
