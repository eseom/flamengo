import { USER_SET_AUTH } from '../types'

export default {
  state: {
    loadedAuth: {},
  },
  mutations: {
    [USER_SET_AUTH](state, auth) {
      if (auth === null) state.loadedAuth = null
      else if (typeof state.loadedAuth.username === 'undefined') state.loadedAuth = auth
    },
  },
}
