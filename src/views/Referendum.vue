<template>
  <div class="home">
    <el-container>
      <el-main>
        <div class="clear-float">
          <h1 class="title" style="float:left">{{$t('referendum.opinionMatter')}}</h1>
          <div id="search-bar">
            <el-input
              clearable
              v-model="searchText"
              @blur="searchBy = searchText"
              class="search-input"
            >
              <i @click="searchBy = searchText" slot="suffix" class="el-input__icon el-icon-search"></i>
            </el-input>

          </div>
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
                            <el-dropdown-item v-if="scope.row.shouldReview" type="primary" @click="applyReview(scope.row.proposal_name)">
                              Apply for Review
                            </el-dropdown-item>
                            <el-dropdown-item v-if="scope.row.approved_by_BET" type="primary" @click="claimRewards()">Claim Rewards</el-dropdown-item>
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
          <!-- 提案流程 -->
          <el-tab-pane :label="$t('referendum.propProcess')" name="process">
            <router-view></router-view>
          </el-tab-pane>
          <el-tab-pane v-if="$store.state.isPC" :label="$t('referendum.howToVote')" name="tutorial">
            <router-view></router-view>
          </el-tab-pane>
        </el-tabs>
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
            <PropCard
              @click.native="turnDetail(prop)"
              :type="prop.proposal.proposal_json.type || 'unknown'"
              :title="prop.proposal.title"
              :desc="prop.proposal.proposal_json.content || ''"
              :votes="prop.stats.staked"
              :staked="prop.stats.staked.total"
              :expired="false"
              :percent="prop.meet_conditions_days"
              ></PropCard>
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
      filterBy: ['referendum', 'poll'],
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
        {
          value: 'referendum',
          label: this.$t('common.referendum')
        },
        {
          value: 'poll',
          label: this.$t('common.poll')
        }
      ]
    },
    proposals () {
      return this.$store.state.proposals
    },
    propList () {
      // filter approved proposals WIP
      let propList = []
      if (this.proposals) {
        Object.keys(this.proposals).forEach(key => {
          let flags = { // types of proposal
            poll: false,
            referendum: false,
            approved: false,
            expired: false,
            ongoing: true
          }
          this.filterBy.forEach(filter => {
            if (filter === 'poll') { // 暂时把不是referendum的认为是poll
              if (this.proposals[key].proposal.proposal_json.type && this.proposals[key].proposal.proposal_json.type.search('referendum') === -1) {
                flags.poll = true
              }
            }
            if (filter === 'referendum') {
              if (this.proposals[key].proposal.proposal_json.type && this.proposals[key].proposal.proposal_json.type.search('referendum') !== -1) {
                flags.referendum = true
              }
            }
            if (filter === 'expired') {
              if (this.isExpired(this.proposals[key].proposal.expires_at)) {
                flags.expired = true
              }
            }
            if (filter === 'ongoing') {
              if (!this.isExpired(this.proposals[key].proposal.expires_at)) {
                flags.ongoing = true
              }
            }
          })
          let flag = (flags.poll || flags.referendum) && (flags.expired || flags.ongoing)
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
              vote.result = 'YES'
            } else if (vote.vote === 0) {
              vote.result = 'NO'
            } else {
              vote.result = 'ABSTAIN'
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
      fetch(API_URL.API_APPLY_REVIEW)
        .then(res => res.json())
        .then(res => {
          this.alert('Success', 'Apply for review success')
        })
        .catch(e => {
          let error = this.$util.errorFormat(e)
          this.alert('Error', 'Error: ' + error.message)
          console.log(e)
        })
    },
    claimRewards () {
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
          this.alert('Success', 'Claim success')
        })
        .catch(e => {
          let error = this.$util.errorFormat(e)
          this.alert('Error', 'Claim ERROR:' + error.message)
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
          this.alert('Success', `Canceled ${proposal}`)
        }).catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.alert('Error', 'Cancel ERROR:' + error.message)
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
          this.alert('Success', `Unvote ${proposal}`)
        }).catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.alert('Error', 'Unvote ERROR:' + error.message)
          console.log(e)
        })
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
      let routeUrl = this.$router.resolve({
        path: '/poll_detail',
        query: {
          proposal: prop.proposal.proposal_name
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    forgetIdentity () {
      this.scatter.forgetIdentity()
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
    }
  }
}
</script>

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
