<template>
  <div class="nav-menu clear-float">
    <div id="logo" @click="$router.push('/')">
      <img src="@/assets/bos-logo.png" id="logo-img" />
    </div>
    <div class="mobile-nav" @click="showMenu = !showMenu">
      <i class="el-icon-menu mobile-nav-icon"></i>
    </div>
    <div class="search-mask" v-if="showMenu" @click="showMenu=false"></div>
    <div class="el-menu-main">
    <el-menu :class="[{'hidden-menu': !showMenu}]" style="float:right" :default-active="activeIndex" mode="horizontal">
      <el-menu-item index="referendum" @click="$router.push('/referendum')">{{$t('common.referendum')}}</el-menu-item>
      <el-menu-item index="auditor" @click="$router.push('/auditor')">{{$t('common.auditor')}}</el-menu-item>
      <el-submenu index="help">
        <template slot="title">{{$t('help.FAQ')}}</template>
        <router-link to="/help/process">
          <el-menu-item index="help-1" style="text-align:center">{{$t('help.propProcess')}}</el-menu-item>
        </router-link>
        <el-menu-item index="help-2" @click="$router.push('/help/tutorial')" style="text-align:center">{{$t('help.howToVote')}}</el-menu-item>
      </el-submenu>
      <el-submenu index="languages">
        <template slot="title">{{language}}</template>
        <el-menu-item index="languages-1" @click="changeLang('en')" style="text-align:center">English</el-menu-item>
        <el-menu-item index="languages-2" @click="changeLang('cn')" style="text-align:center">中文</el-menu-item>
      </el-submenu>
      <el-submenu index="logout" v-if="account">
        <template slot="title">{{account}}</template>
        <el-menu-item index="logout-1" @click.native="forgetIdentity" style="text-align:center">{{$t('common.removeId')}}</el-menu-item>
      </el-submenu>
      <el-menu-item index="login"  v-else @click.native="getIdentity">{{$t('common.login')}}</el-menu-item>
    </el-menu>
    </div>
  </div>
</template>

<script>
import ScatterJS from '@scatterjs/core'
import ScatterEOS from '@scatterjs/eosjs'
import { NETWORK } from '@/assets/constants.js'
ScatterJS.plugins(new ScatterEOS())
export default {
  name: 'NavMenu',
  data () {
    return {
      showMenu: false
    }
  },
  computed: {
    activeIndex () {
      return this.$route.path.split('/')[1]
    },
    account () {
      if (this.$store.state.scatter && this.$store.state.scatter.identity) {
        return this.$store.state.scatter.identity.accounts.find(x => x.blockchain === 'eos').name
      }
      return null
    },
    language () {
      let languages = {
        en: 'English',
        cn: '中文'
      }
      console.log(this.$i18n)
      return languages[this.$i18n.locale]
    },
    scatter () {
      return this.$store.state.scatter
    }
  },
  methods: {
    changeLang (lang) {
      this.$util.changeLanguage.call(this, lang)
      // this.$store.commit('setPropLang', { propLang: lang })
    },
    getIdentity () { // scatter认证
      if (this.scatter) {
        const requiredFields = {
          accounts: [ NETWORK ]
        }
        this.scatter.login(requiredFields).then(() => {
          // console.log(this.scatter.identity)
          this.$util.setCookie('logined', true, 30 * 60 * 1000)
          this.$store.commit('setScatter', { scatter: this.scatter })
        })
      } else {
        ScatterJS.scatter.connect('BOSCore-Referendum', { NETWORK }).then(connected => {
          // 有scatter
          if (connected) {
            const requiredFields = {
              accounts: [ NETWORK ]
            }
            this.$store.dispatch('setScatter', { scatter: ScatterJS.scatter })
            ScatterJS.scatter.login(requiredFields).then(() => {
            // console.log(this.scatter.identity)
              this.$store.dispatch('setScatter', { scatter: ScatterJS.scatter })
              this.$util.setCookie('logined', true, 30 * 60 * 1000)
            }).catch(e => {
              console.log('scatter login error:', e)
            })
          } else {
            console.error('scatter connect failed')
          }
        }).catch(e => {
          console.log(e, 'scatter connect error')
          this.$util.alert('', this.$t('warning.needScatter'), this.$t('common.OK'), this.$t('warning.getScatter'), (action) => {
            if (action === 'cancel') {
              window.open('https://get-scatter.com/', '_blank')
            }
          })
        })
      }
    },
    forgetIdentity () {
      this.scatter.forgetIdentity()
      this.$util.setCookie('logined', false)
    }
  }
}
</script>

<style lang="stylus">
@media only screen and (max-width 780px)
  .nav-menu
    .el-menu-item, .el-submenu
      width 150px
    .el-menu
      position absolute
      right 0
      top 60px
      z-index 1000
      width 150px

</style>

<style lang="stylus" scope>
.nav-menu
  background-color #fff
  position relative
.search-mask
  width 100%
  height 100%
  position fixed
  top 0
  left 0
  z-index 999
  overflow hidden
.mobile-nav
  display none
  height 60px
  width 60px
  float right
  .mobile-nav-icon
    color #507dfe
    line-height 60px
    font-size 24px
    margin auto
    cursor pointer
@media only screen and (max-width 780px)
  .hidden-menu
    display none
  .mobile-nav
    display block
#logo
  height 60px
  float left
  #logo-img
    width: 160px;
    margin 13px
</style>
