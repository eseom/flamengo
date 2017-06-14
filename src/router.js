import Vue from 'vue'
import VueRouter from 'vue-router'
import request from 'superagent'

import store from 'store'
import { QUERY, SHOW_LOADING, HIDE_LOADING } from 'store/types'

const { SET_CONN } = QUERY

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  linkActiveClass: 'open active',
  scrollBehavior: (to, from, savedPosition) => (savedPosition || { x: 0, y: 0 }),
  routes: [{
    name: 'container',
    path: '/',
    component: require('./containers/Container/Container.vue'),
    children: [{
      path: 'query',
      name: 'query',
      component: require('./containers/Container/Query/Query.vue'),
    }],
  }, {
    name: 'any',
    path: '/',
    component: require('./containers/Any/Any.vue'),
    children: [{
      path: 'login',
      name: 'login',
      component: require('./containers/Any/Login/Login.vue'),
    }],
  }, {
    path: '*',
    redirect: '/query',
  }],
})

router.beforeResolve(async (to, from, next) => {
  store.commit(HIDE_LOADING)
  next()
})

router.beforeEach(async (to, from, next) => {
  store.commit(SHOW_LOADING)
  let pass = false
  try {
    const loadedConnection = await request.get('/api/db/load-connection').then(response => response.body.dsn)
    pass = true
    store.commit(SET_CONN, loadedConnection)
  } catch (e) { // eslint-disable-line empty-block
    console.log(e)
  }
  if (to.name === 'login') {
    if (pass) {
      router.replace({ name: 'query' })
    }
    next()
  } else {
    if (!pass) {
      router.replace({ name: 'login' })
      return
    }
    next()
  }
})

export default router
