import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'loading',
            component: require('@/components/LoadingPage').default
        },
        {
            path: '/home',
            name: 'home',
            component: require('@/components/HomePage').default
        },
        {
            path: '/login',
            name: 'login',
            component: require('@/components/Auth/Login/LoginPage').default
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
