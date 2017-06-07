import agt from 'superagent'
import sqlFormatter from 'sql-formatter'
import { QUERY } from '../types'

const { SET_CONN, DEL_QUERY, ADD_QUERY, ADD_QUERY_RESULT } = QUERY
const uniques = {}

export default {
  state: {
    resultSet: [],
    affected: null,
    loadedConnection: {},
  },
  mutations: {
    [ADD_QUERY](state, { query, uniqKey }) {
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const obj = {
        query,
        keys: [],
        data: [],
        count: 0,
        pending: true,
        error: null,
      }
      uniques[uniqKey] = obj
      state.resultSet.push(obj)
    },
    [ADD_QUERY_RESULT](state, { query, result, error, uniqKey }) {
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const obj = {
        query,
        keys: result[0] ? Object.keys(result[0]) : [],
        data: result.map(r => Object.values(r)),
        count: result.length,
        pending: false,
        error,
      }
      const index = state.resultSet.indexOf(uniques[uniqKey])
      delete uniques[uniqKey]
      state.affected = index
      state.resultSet.splice(index, 1, obj)
    },
    [DEL_QUERY](state, { result }) {
      state.resultSet.splice(state.resultSet.indexOf(result), 1)
    },
    [SET_CONN](state, connection) {
      state.loadedConnection = connection
    },
  },
  actions: {
    async [ADD_QUERY]({ commit }, query) {
      const uniqKey = new Date().getTime()
      commit(ADD_QUERY, { query, uniqKey })
      try {
        const result = await agt.post('/api/db/query', { query }).then(response => response.body.result)
        commit(ADD_QUERY_RESULT, { query, result, error: null, uniqKey })
      } catch (error) {
        commit(ADD_QUERY_RESULT, { query, result: [], error: error.response.body.message, uniqKey })
      }
    },
  },
}
