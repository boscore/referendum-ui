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

ScatterJS.plugins(new ScatterEOS())
export default {
  name: 'app',
  components: {
    Footer,
    NavMenu
  },
  data () {
    return {
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
    let init = () => {
      this.$store.dispatch('getAccounts')
      this.$store.dispatch('getVotes')
      this.$store.dispatch('getProxies')
      this.$store.dispatch('getSummaries')
      console.log('getinfo')
      return init
    }
    this.interval = setInterval(init(), 30000)
    this.$store.dispatch('getProposals')
    ScatterJS.scatter.connect('BOSCore-Referendum').then(connected => {
      if (!connected) return false
      // 有scatter
      this.$store.dispatch('setScatter', { scatter: ScatterJS.scatter })
    })
  },
  mounted () {
    this.$store.dispatch('setScreenWidth', { screenWidth: document.body.clientWidth })
    window.onresize = () => {
      this.$store.dispatch('setScreenWidth', { screenWidth: document.body.clientWidth })
    }
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
