<template>
  <div class="home">
    <el-container>
      <el-main>
        <div v-if="this.scatter && this.scatter.identity">
          <div class="clear-float">
            <h1 class="title" style="float:left">{{$t('referendum.opinionMatter')}}</h1>
          </div>
          <el-tabs @tab-click="tabClick" v-model="activeTab">
            <!-- 我的提案 -->
            <el-tab-pane :label="$t('referendum.myProps')" name="proposals">
              <div v-loading="actionLoading" class="card" style="margin: 10px 0px">
                <div v-if="scatter">
                  <div v-if="!scatter.identity">
                    <p>{{$t('warning.needScatter')}}</p>
                    <div class="button" @click="getIdentity">{{$t('warning.pairScatter')}}</div>
                  </div>
                  <div class="proposal-table" v-else>
                    <p class="account-name">{{$t('common.account')}}: {{scatter.identity.accounts[0].name}}
                      <span v-if="$store.state.isPC" class="button" @click="forgetIdentity">{{$t('common.removeId')}}</span>
                      <router-link v-if="$store.state.isPC" :to="{path: '/create_proposal'}">
                        <span class="button">{{$t('common.createProp')}}</span>
                      </router-link>
                    </p>
                    <div style="overflow: auto">
                    <el-table style="min-width: 600px"  :data="myProposals" :empty-text="$t('warning.noRecord')" :default-sort="{prop:'proposal_name', order:'ascending'}">
                      <el-table-column sortable :label="$t('common.proposal')" prop="proposal_name"></el-table-column>
                      <el-table-column sortable :label="$t('common.createdTime')" >
                        <template slot-scope="scope">
                          <span>{{$util.dateConvert(scope.row.created_at)}}</span>
                        </template>
                      </el-table-column>
                      <el-table-column>
                        <template slot-scope="scope">
                          <el-dropdown trigger="click">
                            <span>
                              <i style="font-size: 20px" class="el-icon-setting"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                              <el-dropdown-item type="primary" >
                                <p @click="cancelProp(scope.row.proposal_name)">{{$t('common.cancel')}} </p>
                              </el-dropdown-item>
                              <el-dropdown-item v-if="scope.row.shouldReview" type="primary" @click.native="applyReview(scope.row.proposal_name)">
                                {{$t('referendum.applyReview')}}
                              </el-dropdown-item>
                              <el-dropdown-item v-if="scope.row.approved_by_BET" type="primary" @click.native="claimRewards()">{{$t('referendum.claimRewards')}}</el-dropdown-item>
                            </el-dropdown-menu>
                          </el-dropdown>
                        </template>
                      </el-table-column>
                    </el-table>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <p>{{$t('warning.needScatter')}}</p>
                  <a target="blank" href="https://get-scatter.com/">
                  <div class="button">{{$t('getScatter')}}</div>
                  </a>
                </div>
              </div>
            </el-tab-pane>
            <!-- 我的投票 -->
            <el-tab-pane :label="$t('referendum.myVotes')" name="votes">
              <div class="card" style="margin: 10px 0px">
                <div v-if="scatter">
                  <div v-if="!scatter.identity">
                    <p>{{$t('warning.needScatter')}}</p>
                    <div class="button" @click="getIdentity">{{$t('warning.pairScatter')}}</div>
                  </div>
                  <div class="proposal-table" v-else>
                    <p class="account-name">{{$t('common.account')}}: {{scatter.identity.accounts[0].name}}
                      <span v-if="$store.state.isPC" style="margin: 0 10px" class="button" @click="forgetIdentity">{{$t('common.removeId')}}</span></p>
                    <el-table :data="myVotes" :empty-text="$t('warning.noRecord')" :default-sort="{prop:'proposal_name', order:'ascending'}">
                      <el-table-column sortable :label="$t('common.proposal')" prop="proposal_name"></el-table-column>
                      <el-table-column sortable :label="$t('common.result')" prop="result"></el-table-column>
                      <el-table-column sortable :label="$t('common.votedTime')">
                        <template slot-scope="scope">
                          <span>{{$util.dateConvert(scope.row.updated_at)}}</span>
                        </template>
                      </el-table-column>
                      <el-table-column>
                        <template slot-scope="scope">
                          <el-button type="danger" @click="unvote(scope.row.proposal_name)">{{$t('common.unvote')}}</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
                <div v-else>
                  <p>{{$t('warning.needScatter')}}</p>
                  <a target="blank" href="https://get-scatter.com/">
                  <div class="button">{{$t('getScatter')}}</div>
                  </a>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="clear-float" style="margin: 10px 0">
           <div id="search-bar">
            <el-input
              clearable
              v-model="searchText"
              @blur="searchBy = searchText"
              @clear="searchBy = searchText"
              class="search-input">
              <i @click="searchBy = searchText" slot="suffix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <el-select class="select-button" :value="propLang" @input="setPropLang">
                <el-option
                  v-for="item in propLangOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
          </div>
        </div>
        <div class="clear-float">
            <h1 class="title" style="float:left">{{$t('referendum.discoverProps')}}</h1>
            <div style="float:right">
              <el-select class="select-button" v-model="sortBy">
                <el-option
                  v-for="item in sortOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <el-select class="select-button" v-model="filterBy" multiple collapse-tags placeholder="Filter">
              <el-option
                v-for="item in filterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            </div>
          </div>
        <p v-if="propList.length === 0">{{$t('warning.noResult')}}</p>
        <div class="prop-list" v-loading="!proposals">
          <div
            class="prop-item"
            v-for="(prop, index) in propList.slice(((currentPage - 1) * 12), (currentPage * 12))"
            :class="{'prop-item-middle': $store.state.screenWidth < 1040 ? (index % 2) === 1 : (index % 3) === 1}"
            :key="index"
          >
          <router-link tag="a" :to="`/poll_detail?proposal=${prop.proposal.proposal_name}`">
            <PropCard
              @click.native="turnDetail(prop)"
              :type="prop.proposal.proposal_json.type || $t('common.unknown')"
              :title="prop.proposal.title"
              :budget="prop.proposal.proposal_json.budget"
              :desc="prop.proposal.proposal_json.content || ''"
              :votes="prop.stats.staked"
              :staked="prop.stats.staked.total"
              :expired="false"
              :percent="prop.meet_conditions_days"
              ></PropCard>
          </router-link>
          </div>
        </div>
        <el-pagination
          background
          layout="prev, pager, next"
          :page-count="Math.ceil(propList.length / 12)"
          :current-page.sync = "currentPage"
        >
        </el-pagination>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// @ is an alias to /src
import { MessageBox as MbMessageBox } from 'mint-ui'
import { MessageBox } from 'element-ui'
import Eos from 'eosjs'
import { NETWORK, API_URL, EOSFORUM } from '@/assets/constants.js'
import PropCard from '@/components/PropCard.vue'
export default {
  name: 'Referendum',
  components: {
    PropCard
  },
  data () {
    return {
      actionLoading: false,
      activeTab: 'proposals',
      currentPage: 1,
      extendTime: null,
      extendPropName: '',
      extendVisible: false,
      filterBy: ['unpassed'],
      sortBy: 'MostVoted',
      searchText: '',
      searchBy: ''
    }
  },
  created () {
    document.onkeydown = (e) => {
      let key = window.event.keyCode
      if (key === 13) {
        this.searchBy = this.searchText
      }
    }
  },
  async mounted () {
    await this.$store.dispatch('getProposals')
    if (this.$route.name === 'process') {
      this.activeTab = 'process'
    } else if (this.$route.name === 'tutorial') {
      this.activeTab = 'tutorial'
    }
  },
  computed: {
    scatter () {
      return this.$store.state.scatter
    },
    eos () {
      if (this.scatter && this.scatter.identity) {
        const eosOptions = { expireInSeconds: 60 }
        const eos = this.scatter.eos(NETWORK, Eos, eosOptions)
        return eos
      }
      return null
    },
    filterOptions () {
      return [
        // {
        //   value: 'referendum',
        //   label: this.$t('common.referendum')
        // },
        // {
        //   value: 'poll',
        //   label: this.$t('common.poll')
        // },
        {
          value: 'passed',
          label: this.$t('common.passed')
        },
        {
          value: 'unpassed',
          label: this.$t('common.unpassed')
        }
      ]
    },
    propLangOptions () {
      return [
        {
          value: '',
          label: this.$t('common.original')
        }, {
          value: 'en',
          label: 'English'
        }, {
          value: 'cn',
          label: '简体中文'
        }, {
          value: 'tw',
          label: '繁体中文'
        }, {
          value: 'ja',
          label: '日本語'
        }, {
          value: 'ko',
          label: '한국어'
        }, {
          value: 'ru',
          label: 'русский'
        }
      ]
    },
    proposals () {
      return this.$store.state.proposals
    },
    propLang () {
      return this.$store.state.propLang
    },
    propList () {
      // filter approved proposals WIP
      let propList = []
      if (this.proposals) {
        Object.keys(this.proposals).forEach(key => {
          let flags = { // types of proposal
            // poll: true,
            // referendum: true,
            passed: false,
            unpassed: false
          }
          this.filterBy.forEach(filter => {
            // if (filter === 'poll') { // 暂时把不是referendum的认为是poll
            //   if (this.proposals[key].proposal.proposal_json.type && this.proposals[key].proposal.proposal_json.type.search('referendum') === -1) {
            //     flags.poll = true
            //   }
            // }
            // if (filter === 'referendum') {
            //   if (this.proposals[key].proposal.proposal_json.type && this.proposals[key].proposal.proposal_json.type.search('referendum') !== -1) {
            //     flags.referendum = true
            //   }
            // }
            if (filter === 'passed') {
              if (this.proposals[key].approved_by_vote) {
                flags.passed = true
              }
            }
            if (filter === 'unpassed') {
              if (!this.proposals[key].approved_by_vote) {
                flags.unpassed = true
              }
            }
          })
          let flag = (flags.passed || flags.unpassed)
          if (!this.filterBy.length) {
            flag = true
          }
          if (flag) {
            if (this.searchBy === '') {
              propList.push(this.proposals[key])
            } else { // 根据关键字搜索
              let regexp = new RegExp(this.searchBy, 'i')
              if (regexp.test(this.proposals[key].id) ||
                  regexp.test(this.proposals[key].proposal.title) ||
                  (this.proposals[key].proposal.proposal_json.content && regexp.test(this.proposals[key].proposal.proposal_json.content))) {
                propList.push(this.proposals[key])
              }
            }
          }
        })
      }
      if (this.sortBy === 'MostVoted') {
        propList.sort((a, b) => {
          return b.stats.staked.total - a.stats.staked.total
        })
      } else if (this.sortBy === 'NewestFirst') {
        propList.sort((a, b) => {
          let aDate = new Date(a.proposal.created_at).getTime()
          let bDate = new Date(b.proposal.created_at).getTime()
          return bDate - aDate
        })
      } else if (this.sortBy === 'OldestFirst') {
        propList.sort((a, b) => {
          let aDate = new Date(a.proposal.created_at).getTime()
          let bDate = new Date(b.proposal.created_at).getTime()
          return aDate - bDate
        })
      } else if (this.sortBy === 'ExpiresFirst') {
        propList.sort((a, b) => {
          let aDate = new Date(a.proposal.expires_at).getTime()
          let bDate = new Date(b.proposal.expires_at).getTime()
          return aDate - bDate
        })
      } else if (this.sortBy === 'ExpiresLast') {
        propList.sort((a, b) => {
          let aDate = new Date(a.proposal.expires_at).getTime()
          let bDate = new Date(b.proposal.expires_at).getTime()
          return bDate - aDate
        })
      }
      return propList
    },
    myVotes () {
      let myVotes = null
      if (this.$store.state.accounts && this.scatter && this.scatter.identity) {
        myVotes = this.$store.state.accounts[this.scatter.identity.accounts[0].name]
        if (myVotes) {
          let list = []
          Object.keys(myVotes.votes).forEach(key => {
            let vote = { ...myVotes.votes[key] }
            if (vote.vote === 1) {
              vote.result = this.$t('common.yes')
            } else if (vote.vote === 0) {
              vote.result = this.$t('common.no')
            } else {
              vote.result = this.$t('common.abstain')
            }
            list.push(vote)
          })
          return list
        }
      }
      return []
    },
    myProposals () {
      let myProposals = []
      if (this.proposals && this.scatter && this.scatter.identity) {
        Object.keys(this.proposals).forEach(key => {
          if (this.proposals[key].proposal.proposer === this.scatter.identity.accounts[0].name) {
            let proposal = { ...this.proposals[key].proposal }
            proposal.approved_by_BET = this.proposals[key].approved_by_BET
            proposal.shouldReview = this.proposals[key].approved_by_vote && !this.proposals[key].review
            myProposals.push(proposal)
          }
        })
      }
      return myProposals
    },
    sortOptions () {
      return [
        {
          value: 'MostVoted',
          label: this.$t('referendum.sortType.most')
        },
        {
          value: 'NewestFirst',
          label: this.$t('referendum.sortType.newest')
        },
        {
          value: 'OldestFirst',
          label: this.$t('referendum.sortType.oldest')
        }
      ]
    }
  },
  methods: {
    alert (title, msg) {
      if (this.$store.state.isPC) {
        MessageBox.alert(msg, title, {
          confirmButtonText: 'OK'
        })
      } else {
        MbMessageBox.alert(msg, title, {
          confirmButtonText: 'OK'
        })
      }
    },
    applyReview (proposal) {
      this.actionLoading = true
      fetch(API_URL.API_APPLY_REVIEW + '/' + proposal)
        .then(res => res.json())
        .then(res => {
          this.actionLoading = false
          this.alert(this.$t('alert.success'), this.$t('alert.reviewTip'))
        })
        .catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.alert('Error', 'Error: ' + error.message)
          console.log(e)
        })
    },
    claimRewards () {
      this.actionLoading = true
      const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      const transactionOptions = {
        actions: [{
          account: 'escrow.bos',
          name: 'claim',
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: { escrow_name: account.name }
        }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(res => {
          this.actionLoading = false
          this.alert(this.$t('alert.success'), this.$t('alert.proposal.claimRewardsSUC'))
        })
        .catch(e => {
          this.actionLoading = false
          this.$util.eosErrorAlert(e)
          console.log(e)
        })
    },
    cancelProp (proposal) {
      this.actionLoading = true
      const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      const transactionOptions = {
        actions: [{
          account: EOSFORUM,
          name: 'cancel',
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: {
            proposer: account.name,
            proposal_name: proposal
          }
        }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(res => {
          this.actionLoading = false
          this.alert(this.$t('alert.success'), this.$t('alert.proposal.cancelPropSUC', [proposal]))
        }).catch(e => {
          this.actionLoading = false
          this.$util.eosErrorAlert(e)
          console.log(e)
        })
    },
    unvote (proposal) {
      this.actionLoading = true
      const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      const transactionOptions = {
        actions: [{
          account: EOSFORUM,
          name: 'unvote',
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: {
            voter: account.name,
            proposal_name: proposal
          }
        }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(res => {
          this.actionLoading = false
          this.alert(this.$t('alert.success'), this.$t('alert.proposal.unvoteSUC', [proposal]))
        }).catch(e => {
          this.actionLoading = false
          this.$util.eosErrorAlert(e)
          console.log(e)
        })
    },
    setPropLang (e) {
      this.$store.commit('setPropLang', { propLang: e })
    },
    openPicker (proposal) {
      this.extendPropName = proposal
      if (this.$store.state.isPC) {
        this.extendVisible = true
      } else {
        this.$refs['picker'].open()
      }
    },
    setExtendTime (time) {
      function formatNumber (n) {
        if (n < 10) {
          return '0' + n
        }
        return n
      }
      this.extendTime = `${time.getFullYear()}-${formatNumber(time.getMonth() + 1)}-${formatNumber(time.getDate())}T${formatNumber(time.getHours())}:${formatNumber(time.getMinutes())}:${formatNumber(time.getSeconds())}`
      this.extendProp()
    },
    isExpired (exporiesAt) {
      let now = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
      let expiry = new Date(exporiesAt).getTime()
      if (expiry < now) {
        return true
      }
      return false
    },
    getIdentity () { // scatter认证
      const requiredFields = {
        accounts: [ NETWORK ]
      }
      this.scatter.getIdentity(requiredFields).then(() => {
        // console.log(this.scatter.identity)
        this.$store.dispatch('setScatter', { scatter: this.scatter })
      })
    },
    turnDetail (prop) {
      if (window.localStorage) {
        localStorage.setItem('proposalName', prop.proposal.proposal_name)
      }
      this.$store.dispatch('setCurrentProposal', { proposal: prop })
    },
    forgetIdentity () {
      this.scatter.forgetIdentity()
      this.$util.setCookie('logined', false)
    },
    tabClick (tab) {
      switch (tab.name) {
        case 'process':
          this.$router.push('/process')
          break
        case 'tutorial':
          this.$router.push('/tutorial')
          break
        case 'proposals':
          this.$router.push('/referendum')
          break
        case 'votes':
          this.$router.push('/referendum')
          break
      }
    }
  },
  watch: {
    $route () {
      this.$store.dispatch('getProposals')
    },
    propLang () {
      this.$store.dispatch('getProposals')
    }
  }
}
</script>

<style lang="stylus">
.home
  .el-select__tags-text
    color #000
  .el-input__inner
    color #000
.el-select-dropdown__item
  color #000
</style>

<style lang="stylus" scoped>
.title
  font-family PingFangSC-Semibold
  font-size 20px
  color #507DFE
  letter-spacing 0
  text-align center
  margin-top 0
  margin-bottom 22px
  text-align left
.prop-list
  min-height 100px
  display flex
  flex-wrap wrap
  justify-content flex-start
.prop-item
  padding 25px 0
  width 32%
  min-width 280px
  box-sizing border-box
.prop-item-middle
  margin 0 2%
.card
  font-size 18px
  color #606266
.button
  margin 5px
  display inline-block
  background: #527FFF
  cursor pointer
  height 32px
  padding 5px 10px
  box-sizing border-box
  border-radius 32px
  font-family: Roboto-Bold;
  font-size: 16px;
  line-height 22px
  color: #FFFFFF;
  letter-spacing: 0;
  text-align: center;
.account-name
    font-family Roboto-Bold
    text-align left
    font-size 20px
    color #8290aa
#search-bar
  float right
  display flex
  flex-wrap wrap
  justify-content flex-end
.search-input
  width 200px
.select-button
  margin 0 5px
@media only screen and (max-width 1040px)
  .prop-item
    width 49%
  .prop-item-middle
    margin-right 0
@media only screen and (max-width 715px)
  .prop-item
    width 100%
  .prop-item-middle
    margin 0
  .card
    padding 10px
  .tutorial
    img
      width 100%
  #search-bar
    width 100%
  .search-input
    width 100%
    margin-bottom 10px
  .select-button
    width 50%
    margin 0 0 5px 0
@media only screen and (max-width 450px)
  .prop-list
    justify-content center
</style>
