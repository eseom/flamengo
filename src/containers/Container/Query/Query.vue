<template>
  <section class="slideIn">
    <div v-bind:class="queryModal ? 'query-show' : 'query-hide'" style="box-shadow: -0px -0px 5px #888888; ; border: 1px solid #adadad; position: fixed; bottom: 10px; width: 600px; height: 400px; background: #EFEFEF">
      <h4 style="padding: 10px">
        Query
      </h4>
      <textarea @keyup.alt.backspace="alert(1)" id="code" cols="120" rows="50"></textarea>
      <div style="font-size: 13px">Key buffer:
        <span id="command-display" style=""></span>
      </div>
    </div>
  
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
          Queries and Results
          <span class="subheader">group #default</span>
        </h4>
  
        <div v-if="resultSet.length === 0">
          no executed query
        </div>
  
        <div :id="'section' + index" class="section" :class="{ active: traversal === index }" v-for="result, index in resultSet">
          <div>
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
            <div style="margin-top: 17px; margin-bottom: 10px;">
              <!--<div v-if="editable === result">
                      <form v-on:submit.prevent="editQuery(result)">
                        <input @keyup.esc="esc" autocomplete="off" type="text" class="monospace form-control input-block editable" v-model="result.newQuery">
                      </form>
                    </div>-->
  
              <div @click="setEditable(result)" style="cursor: pointer; background: #f8f8f6; padding: 10px; color: purple; margin-left: 0px;">
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
              <div style="margin-bottom: 6px; margin-top: 3px">
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
                      <div v-if="c === ''">&nbsp;</div>
                      <div v-else-if="c === null" class="badge badge-default nullvalue"></div>
                      <span v-else-if="c === true" class="badge badge-success">{{c}}</span>
                      <span v-else-if="c === false" class="badge badge-danger">{{c}}</span>
                      <span v-else-if="c.substring && c.substring(0, 2) === '\x20\x10'" class="datetime">{{new Date(c.substring(2)).toLocaleString()}}</span>
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
import CodeMirror from 'codemirror'
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'
import Mousetrap from 'mousetrap'
import store from 'store'
import 'codemirror/mode/sql/sql'
import 'codemirror/keymap/vim'
import 'codemirror/lib/codemirror.css'

import { QUERY } from 'store/types'
import _ from 'lodash'

const { DEL_QUERY, EDIT_QUERY, ADD_QUERY } = QUERY
const shortcuts = ['i', 'h', 'j', 'k', 'l', 'left', 'right', 'command+v', 'ctrl+v', 'enter']
const shortcutsMap = {
  left: 'h',
  right: 'l',
  'ctrl+v': 'command+v',
}

export default {
  name: 'query',
  async beforeRouteEnter(to, from, next) {
    next()
  },
  components: {
    SyncLoader,
  },
  created() {
    Mousetrap.bind(shortcuts, this.shortcut)
    window.onload = () => {
      this.editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        keyMap: 'vim',
        mode: 'sql',
        lineNumbers: true,
        matchBrackets: true,
        textWrapping: false
      })
      const commandDisplay = document.getElementById('command-display')
      let keys = ''
      CodeMirror.on(this.editor, 'vim-keypress', (key) => {
        keys = keys + key
        commandDisplay.innerHTML = keys
      })
      CodeMirror.on(this.editor, 'vim-command-done', (e) => {
        keys = ''
        commandDisplay.innerHTML = keys
      })
      CodeMirror.commands.save = (editor) => {
        const query = editor.getValue().trim()
        // const query = this.query.trim()
        if (query === '') return

        if (this.editable) {
          this.editQuery(this.editable, query)
        } else {
          this.$store.dispatch(ADD_QUERY, query)
        }
        editor.setValue('')
        this.editor.getInputField().blur()
        this.queryModal = false
        // this.__blurAll()
      }
      CodeMirror.Vim.defineMotion('quit', (cm, head, motionArgs) => {
        this.editor.setValue('')
        this.editor.getInputField().blur()
        this.queryModal = false
      })
      CodeMirror.Vim.mapCommand('ZQ', 'motion', 'quit')
    }

  },
  destroyed() {
    Mousetrap.unbind(shortcuts, this.shortcut)
  },
  watch: {
    affected(index) {
      this.$nextTick(() => {
        this.traversal = index
        this.scroll(index)
      })
    },
  },
  computed: {
    resultSet() {
      this.query = ''
      return _.cloneDeep(this.$store.state.query.resultSet)
    },
    loadedConnection() {
      return this.$store.state.query.loadedConnection
    },
    affected() {
      return this.$store.state.query.affected
    },
  },
  methods: {
    scroll(index) {
      this.$el.querySelector(`#section${index}`).scrollIntoView()
    },
    __blurAll() {
      this.$el.querySelector('#query').blur()
      try {
        this.$el.querySelectorAll('.section input')[this.traversal].blur()
      } catch (e) { }
    },
    setEditable(result) {
      // result.newQuery = result.rawQuery
      this.queryModal = true
      this.editor.setValue(result.rawQuery)
      this.editor.focus()
      this.editable = result
      // const index = _.findIndex(this.resultSet, result)
      // this.$nextTick(() => {
      //   this.$el.querySelectorAll('.section input')[index].focus()
      // })
    },
    editQuery(result, query) {
      this.editable = null
      this.$store.dispatch(EDIT_QUERY, { uniqKey: result.uniqKey, query })
    },
    esc() {
      this.__blurAll()
      this.editable = null
    },
    shortcut(key, keyString) {
      keyString = shortcutsMap[keyString] || keyString
      if (this.shortcutHandlers[keyString]) return this.shortcutHandlers[keyString]()
      return false
    },
    onQuery() {
      const query = this.query.trim()
      if (query === '') return
      this.$store.dispatch(ADD_QUERY, query)
      this.__blurAll()
    },
    del(result) {
      this.$store.commit(DEL_QUERY, { result })
      this.traversal -= 1
    },
    refresh() {
      console.log('refresh')
    },
  },
  data() {
    return {
      editor: null,
      lastQuery: '',
      query: '',
      askToDelete: null,
      editable: null,
      traversal: -1,
      DEVELOPMENT,
      queryModal: false,
      shortcutHandlers: {
        i: () => {
          this.queryModal = true
          this.editor.focus()
          return false
          // document.getElementById('query').focus()
          // return false
        },
        h() {
          // console.log('left')
        },
        j: () => {
          if (this.resultSet.length === 0) return
          if (this.traversal == this.resultSet.length - 1) this.traversal = 0
          else this.traversal += 1
          this.scroll(this.traversal)
        },
        k: () => {
          if (this.resultSet.length === 0) return
          if (this.traversal <= 0) this.traversal = this.resultSet.length - 1
          else this.traversal -= 1
          this.scroll(this.traversal)
        },
        l() {
          // console.log('right')
        },
        enter: () => {
          if (this.traversal === -1) return
          this.scroll(this.traversal)
          this.setEditable(this.resultSet[this.traversal])
          return false
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

.section {
  padding-top: 1rem;
  background: #fefefe;
  &>div {
    padding: 10px;
    padding-top: 20px;
    border: 1px solid #EFEfEf;
  }
  &.active {
    &>div {
      border: 1px solid #adadad;
      border-radius: 0px;
    }
  }
}

.query-show {
  right: 10px
}

.query-hide {
  right: -4000px
}

.nullvalue {
  margin-top: 3px;
  background-color: transparent;
  border-bottom: 3px solid #cdcdcd;
  width: 50%;
  display: block !important;
}

.datetime {
  opacity: .8;
  background-color: #d0dee5;
}
</style>
