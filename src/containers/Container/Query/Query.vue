<template>
  <section class="slideIn">
    <div class="container-fluid" @keyup.space="shortcut()">
  
      <!-- db selector -->
      <div>
        <h4>
          Database
        </h4>
        <pre class="info-database">{{loadedConnection}}</pre>
      </div>
  
      <div style="margin-top: 20px;">
        <h4>
          Queries
          <span class="subheader">group #default</span>
        </h4>
  
        <div v-if="resultSet.length === 0">
          no executed query
        </div>
  
        <div :id="'section' + index" class="" v-for="result, index in resultSet" style="padding-top: 1rem; background: #fefefe;">
          <div style="float: right">
            <span v-if="askToDelete !== result">
              <button class="btn btn-outline-primary btn-tools" @click.prevent="askToDelete = result">
                <i class="fa fa-times"></i>
                delete
              </button>
              <button class="btn btn-outline-warning btn-tools" @click.prevent="refresh">
                <i class="fa fa-refresh"></i>
                refresh
              </button>
            </span>
            <span v-else>
              <button class="btn btn-outline-danger btn-tools" @click.prevent="askToDelete = null">
                <i class="fa fa-ban"></i>
                cancel
              </button>
              <button class="btn btn-outline-info btn-tools" @click.prevent="del(result)">
                <i class="fa fa-check"></i>
                confirm
              </button>
            </span>
          </div>
  
          <h5 class="pull-left" style="">#{{index + 1}}</h5>&nbsp;
          <small>{{new Date().toLocaleString()}}</small>
  
          <div class="clear"></div>
          <div style="margin-top: 3px;">
            <div style="background: #f8f8f6; padding: 10px; color: purple; margin-bottom: 10px; margin-top: 14px; margin-left: 0px;">
              <pre style="margin: 0">{{result.query}}</pre>
            </div>
          </div>
          <input type="text" placeholder="description" class="form-control input-sm">
  
          <div class="alert alert-danger" v-if="result.error" style="margin-top: 10px; padding: 10px;">
            <div>
              {{result.error}}
            </div>
          </div>
  
          <div class="result-box" style="margin-top: 10px;" v-if="!result.pending">
            <div>
              <strong>count of result {{result.count}}</strong>
            </div>
            <table class="table table-striped monospace" style="width: auto" v-if="result.data.length > 0">
              <thead>
                <tr class="result-header">
                  <th v-for="c in result.keys">{{c}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in result.data">
                  <td style="white-space: nowrap;" v-for="c in l">
                    <span v-if="c === true" class="badge badge-success">{{c}}</span>
                    <span v-else-if="c === false" class="badge badge-danger">{{c}}</span>
                    <span v-else> {{c}} </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else-if="!result.error">
              no data
            </div>
          </div>
          <div class="result-box" style="margin-top: 10px; height: 40px; color: gray" v-else>
            querying...
          </div>
          <sync-loader :loading="result.pending" :color="'#343434'"></sync-loader>
        </div>
      </div>
  
      <form v-on:submit.prevent="onQuery" style="margin-top: 20px;">
        <h4>
          Query
        </h4>
        <div style="margin-top: 10px;">
          <input @keyup.esc="esc" id="query" autocomplete="off" type="text" placeholder="input a query" class="monospace form-control input-block" v-model="query">
        </div>
      </form>
  
    </div>
  </section>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'
import Mousetrap from 'mousetrap'
import store from 'store'

import { QUERY } from 'store/types'
import _ from 'lodash'

const { DEL_QUERY, ADD_QUERY } = QUERY
const shortcuts = ['i', 'h', 'j', 'k', 'l', 'left', 'up', 'down', 'right', 'command+v', 'ctrl+v']
const shortcutsMap = {
  left: 'h',
  up: 'k',
  down: 'j',
  right: 'l',
  'ctrl+v': 'command+v',
}

export default {
  name: 'query',
  async beforeRouteEnter(to, from, next) {
    // await store.dispatch(GET_SELECTED)
    next()
  },
  components: {
    SyncLoader,
  },
  created() {
    Mousetrap.bind(shortcuts, this.shortcut)
  },
  destroyed() {
    Mousetrap.unbind(shortcuts, this.shortcut)
  },
  watch: {
    affected(index) {
      this.$nextTick(() => {
        const t = this.$el.querySelector(`#section${index}`);
        t.scrollIntoView()
      })
    },
  },
  computed: {
    resultSet() {
      this.query = ''
      return this.$store.state.query.resultSet
    },
    loadedConnection() {
      return this.$store.state.query.loadedConnection
    },
    affected() {
      return this.$store.state.query.affected
    },
  },
  methods: {
    esc() {
      document.getElementById('query').blur()
    },
    shortcut(key, keyString) {
      keyString = shortcutsMap[keyString] || keyString
      if (this.shortcutHandlers[keyString]) return this.shortcutHandlers[keyString]()
      return false
    },
    onQuery() {
      this.$store.dispatch(ADD_QUERY, this.query)
    },
    del(result) {
      this.$store.commit(DEL_QUERY, { result })
    },
    refresh() {
      console.log('refresh')
    },
  },
  data() {
    return {
      lastQuery: '',
      query: '',
      askToDelete: null,
      DEVELOPMENT,
      shortcutHandlers: {
        i() {
          document.getElementById('query').focus()
          return false
        },
        h() {
          console.log('left')
        },
        j() {
          console.log('down')
        },
        k() {
          console.log('up')
        },
        l() {
          console.log('right')
        },
        ['command+v']: () => {
          this.shortcutHandlers['i']()
          return true
        },
      }
    }
  },
}
</script>

<style scoped lang="scss">
.result-box {
  width: 100%;
  overflow: auto;
}

.monospace {
  font-family: 'Ubuntu Mono', monospace;
}

.btn-tools {
  font-size: 11px;
  padding: 3px 10px;
}

.info-database {
  background: #f8f8f6;
  padding: 10px;
  font-weight: bold;
}

h4 {
  .subheader {
    margin-left: 10px;
    font-size: 80%;
    opacity: .6;
  }
}

tr.result-header {
  th {
    font-weight: bold;
  }
}
</style>