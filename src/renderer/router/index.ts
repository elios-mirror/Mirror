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
            path: '/auth',
            name: 'auth',
            component: require('@/components/Auth/AuthPage').default
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
