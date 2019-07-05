<template>
  <div id="app">
    <NavMenu></NavMenu>
    <div class="app-main">
      <router-view></router-view>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import Footer from '@/components/Footer.vue'
import NavMenu from '@/components/NavMenu.vue'
import ScatterJS from 'scatterjs-core'
import ScatterEOS from 'scatterjs-plugin-eosjs'
import { NETWORK } from '@/assets/constants.js'
ScatterJS.plugins(new ScatterEOS())
export default {
  name: 'app',
  components: {
    Footer,
    NavMenu
  },
  data () {
    return {
      connectCount: 0,
      connectInterval: null,
      interval: null
    }
  },
  created () {
    if (localStorage.getItem('language')) {
      this.$i18n.locale = localStorage.getItem('language')
    }
    this.$util.changeLanguage = this.$util.changeLanguage.bind(this)
    this.$util.alert = this.$util.alert.bind(this)

    this.$store.commit('setIsPC', { isPC: this.$util.isPC() })

    let init = () => { // get all data
      if (this.interval != null) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.$store.dispatch('getAccounts')
      this.$store.dispatch('getVotes')
      this.$store.dispatch('getProxies')
      this.$store.dispatch('getSummaries')
      this.$store.dispatch('getProposals')
      return init
    }
    this.interval = setInterval(init(), 30000) // keep data real-time

    setTimeout(() => {
      if (this.$store.state.accounts === null ||
      this.$store.state.proxies === null ||
      this.$store.state.proposals === null ||
      this.$store.state.votes.length === 0 ||
      this.$store.state.summaries.hasOwnProperty('bp_votes') === false) {
        // this.$util.alert(this.$t('common.tip'), this.$t('alert.networkSlow'))
      }
    }, 30000)
  },
  mounted () {
    this.$store.dispatch('setScreenWidth', { screenWidth: document.body.clientWidth })
    window.onresize = () => {
      this.$store.dispatch('setScreenWidth', { screenWidth: document.body.clientWidth })
    }
    this.connectInterval = setInterval(() => {
      ScatterJS.scatter.connect('BOSCore-Referendum').then(connected => {
        if (this.connectInterval != null) {
          clearInterval(this.connectInterval)
          this.connectInterval = null
        }
        if (!connected) {
          this.connectCount++
          if (this.connectCount >= 3) {
            clearInterval(this.connectInterval)
          }
          return false
        }
        // 有scatter
        if (!this.$store.state.isPC) {
          const requiredFields = {
            accounts: [ NETWORK ]
          }
          ScatterJS.scatter.getIdentity(requiredFields).then(() => {
            // console.log(this.scatter.identity)
            this.$store.dispatch('setScatter', { scatter: ScatterJS.scatter })
          })
        }
        clearInterval(this.connectInterval)
        console.log(ScatterJS.scatter)
        this.$store.dispatch('setScatter', { scatter: ScatterJS.scatter })
      })
    }, 500)
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  methods: {
  }
}
</script>

<style lang="stylus" scope>
body {
  margin: 0;
  background-color: rgb(232,236,255);
}

.app-main {
  min-height: calc(100vh - 160px - 60px);
  background-color: rgb(232,236,255);
  max-width: 1420px;
  margin: auto;
}
@media only screen and (min-width 450px)
  .app-main
    padding-left: 50px;
    padding-right: 50px;
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
