import agt from 'superagent'
import sqlFormatter from 'sql-formatter'
import _ from 'lodash'
import { QUERY } from '../types'

const {
  SET_CONN, DEL_QUERY, EDIT_QUERY, EDIT_QUERY_RESULT,
  ADD_QUERY, ADD_QUERY_RESULT,
} = QUERY
const uniques = {}

export default {
  state: {
    resultSet: [],
    affected: { index: null, time: null },
    loadedConnection: {},
  },
  mutations: {
    [ADD_QUERY](state, { query, uniqKey }) {
      const rawQuery = query
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const obj = {
        uniqKey,
        rawQuery,
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
      const rawQuery = query
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const obj = {
        uniqKey,
        rawQuery,
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
    [EDIT_QUERY](state, { result }) {
      const { uniqKey, newQuery } = result
      let query = newQuery
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const index = _.findIndex(state.resultSet, { uniqKey })
      const obj = {
        uniqKey,
        rawQuery: newQuery,
        query,
        keys: [],
        data: [],
        count: 0,
        pending: true,
        error: null,
      }
      state.resultSet.splice(index, 1, obj)
    },
    [EDIT_QUERY_RESULT](state, { query, rows, error, uniqKey }) {
      const index = _.findIndex(state.resultSet, { uniqKey })
      const rawQuery = query
      if (query.substring(0, 1) !== '\\') query = sqlFormatter.format(query)
      const obj = {
        uniqKey,
        rawQuery,
        query,
        keys: rows[0] ? Object.keys(rows[0]) : [],
        data: rows.map(r => Object.values(r)),
        count: rows.length,
        pending: false,
        error,
      }
      state.affected = index
      state.resultSet.splice(index, 1, obj)
    },
    [DEL_QUERY](state, { result }) {
      const index = _.findIndex(state.resultSet, { uniqKey: result.uniqKey })
      state.resultSet.splice(index, 1)
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
    async [EDIT_QUERY]({ commit }, { oldResult }) {
      commit(EDIT_QUERY, { result: oldResult })
      try {
        const rows = await agt.post('/api/db/query', { query: oldResult.newQuery }).then(response => response.body.result)
        commit(EDIT_QUERY_RESULT, {
          query: oldResult.newQuery,
          rows,
          error: null,
          uniqKey: oldResult.uniqKey,
        })
      } catch (error) {
        commit(EDIT_QUERY_RESULT, {
          query: oldResult.newQuery,
          rows: [],
          error: error.response.body.message,
          uniqKey: oldResult.uniqKey,
        })
      }
    },
  },
}
