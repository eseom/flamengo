import superagent from 'superagent'
import { CORE_HOME, SHOW_LOADING, HIDE_LOADING } from '../types'

export default {
  state: {
    loading: false,
    home: '',
  },
  mutations: {
    [SHOW_LOADING](state) {
      state.loading = true
    },
    [HIDE_LOADING](state) {
      state.loading = false
    },
    [CORE_HOME](state, home) {
      state.home = home
    },
  },
  actions: {
    [CORE_HOME](state) {
      return superagent.get('/api/home').then(response => (state.commit(CORE_HOME, response.text)))
    },
  },
}
