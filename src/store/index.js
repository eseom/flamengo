import Vue from 'vue'
import Vuex from 'vuex'
import { vuexModule as socketVuexModule } from 'vue-nes'

import actions from './actions'
import getters from './getters'

import core from './modules/core'
import query from './modules/query'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  actions,
  getters,
  modules: {
    core,
    query,
    user,
    nes: socketVuexModule,
  },
  strict: process.env.NODE_ENV !== 'production',
})

if (module.hot) {
  module.hot.accept([
    './getters', './actions',
    './modules/core',
    './modules/query',
    './modules/user',
  ], () => {
    const newGetters = require('./getters').default
    const newActions = require('./actions').default

    const newCore = require('./modules/core').default
    const newQuery = require('./modules/query').default
    const newUser = require('./modules/user').default

    // 새로운 액션과 변이로 바꿉니다.
    store.hotUpdate({
      getters: newGetters,
      actions: newActions,
      modules: {
        core: newCore,
        query: newQuery,
        user: newUser,
        nes: socketVuexModule,
      },
      strict: process.env.NODE_ENV !== 'production',
    })
  })
}

export default store
