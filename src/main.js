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
import VueAnalytics from 'vue-analytics'

// GA初始化
if (process.env.GA) {
  Vue.use(VueAnalytics, {
    id: process.env.VUE_APP_GA, // 从配置中读取
    checkDuplicatedScript: true, // 必须在html中完成初始化，这里显式禁止去下载ga脚本
    router, // 确保路由切换时可以自动统计
    autoTracking: {
      pageviewOnLoad: false // 当通过网址进来时已经GA在初始化时就发起一次pageview的统计，这里不要重复统计
    }
  })
}

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
