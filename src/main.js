import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import '@/assets/common.styl'
import 'mint-ui/lib/style.css'
import axios from 'axios'
import util from '@/util.js'
import { DatetimePicker } from 'mint-ui'
import i18n from './i18n'

Vue.component(DatetimePicker.name, DatetimePicker)

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$util = util

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

// Vue.config.lang = 'zh-cn'

// locale('en', en)
