import Vue from 'vue'
import Toasted from 'vue-toasted'
import VueSuperagent from 'vue-superagent'
import router from 'router'
import App from 'containers/App/App.vue'
import VueNes from 'vue-nes'

// import Raven from 'raven-js'
// import RavenVue from 'raven-js/plugins/vue'

import store from './store'

// Raven.config('')
//   .addPlugin(RavenVue, Vue)
//   .install()

Vue.use(VueSuperagent)
Vue.use(Toasted, {
  duration: 10000,
  position: 'custom-top-right',
  className: 'toast',
})

const wsUrl = `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}`
Vue.use(VueNes, { wsUrl, store })

const vueApp = new Vue({
  el: '#app',
  router,
  store,
  template: '<App />',
  components: {
    App,
  },
})
