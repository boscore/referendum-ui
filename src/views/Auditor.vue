<template>
  <div ref="auditor" class="auditor">
    <el-container v-loading="actionLoading">
      <el-main style="padding-top:0">
        <div class="main-panel">
          <h1>{{$t('auditor.auditorBoard')}}</h1>
          <div class="card board" v-loading="auditorLoading">
            <div v-for="auditor in auditorsList" :key="auditor.auditor_name" class="board-item">
              <Avatar :url="auditor.bio ? auditor.bio.avatar : ''" star></Avatar>
              <p>{{auditor.candidate.candidate_name}}</p>
            </div>
          </div>
          <div class="candidate-list">
            <h1>{{$t('auditor.candidateList') + ' '}}<span style="color: #91ADFF;">- {{candidatesList.length}}</span></h1>
            <!-- <p>The Custodian Board manages the operations and affairs of the DAC, including but not limited to the governance and administration of the assets and liabilities of the DAC. The following DAC members have vested some of their tokens to submit themselves and candidates for a position on the custodian board which last for 7 days. Every 7 days, your votes are recalculated to select who will be part of the next custodian board. Voting is important! Please vote often and stay engaged within the DAC to know who is providing value</p> -->
            <div style="min-height: 50px" v-loading="candidateLoading">
              <div
                v-for="candidate in candidatesList"
                :key="candidate.id">
                <CandidateCollapse
                  v-if="candidate.candidate.is_active"
                  @select="handleSelect"
                  :id="candidate.id"
                  :votes="candidate.total_votes"
                  :inform="candidate.bio"
                  :isSelected="candidate.isSelected"
                  :staked="candidate.candidate.locked_tokens"
                  :progress="candidate.meet_conditions_days"
                  ></CandidateCollapse>
              </div>
            </div>
          </div>
        </div>
      </el-main>
      <el-aside :width="asideWidth">
        <!-- 投票面板 -->
        <div class="vote-panel">
          <h1>
            {{$t('auditor.myVotes')}} <span style="color: #91ADFF;"> {{selectedCandidates.length}}/{{config ? config.maxvotes : 5}}</span>
          </h1>
          <p>
            {{$t('auditor.voteRule')}}
          </p>
          <div class="selected-candidates card">
            <div v-if="selectedCandidates.length" @click="sendVotes" class="vote-button vote-button-active">
              {{$t('auditor.submitVotes').toLocaleUpperCase()}}
            </div>
            <div v-else-if="myVoted.length" @click="unvote" class="vote-button vote-button-active" style="background: #E74C3C">
              {{$t('common.unvote').toLocaleUpperCase()}}
            </div>
            <div v-else class="vote-button">
              {{$t('auditor.myVotes').toLocaleUpperCase()}}
            </div>
            <div v-if="selectedCandidates.length === 0">
              <div v-for="cand in myVoted" :key="cand" style="justify-content: space-around" class="selected-candidate-card">
                <Avatar size="35px" :url="''"></Avatar>
                <p>{{cand}}</p>
              </div>
            </div>
            <div v-for="candidate in selectedCandidates" :key="candidate.id" class="selected-candidate-card">
              <Avatar size="35px" :url="candidate.bio.avatar"></Avatar>
              <p>{{candidate.id}}</p>
              <div class="remove-button" @click="removeCandidate(candidate.id)">
                <i class="el-icon-close"></i>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-bottom: 20px" v-if="$store.state.isPC">
          <div v-if="myCandidate && !myAuditor" class="card">
            <h1>{{$t('auditor.youAreCand')}}</h1>
            <p>{{$t('common.votes')}}: {{(myCandidate.candidate.total_votes / 10000).toFixed(4)}}</p>
            <p>{{$t('common.staked')}}: {{myCandidate.candidate.locked_tokens}}</p>
            <el-progress
             :text-inside="true"
             :stroke-width="20"
             :format="stakeText"
             class="pass-percent"
             :percentage="stakePercent"></el-progress>
            <div v-if="myCandidate.is_active">
              <p>{{$t('auditor.activeTip')}}</p>
              <div @click="() => {stakeVisible = true}" class="vote-button vote-button-active">{{$t('auditor.stakeMore')}}</div>
              <div @click="inactive" class="vote-button vote-button-active">{{$t('auditor.unregister')}}</div>
            </div>
            <div v-else >
              <p>{{$t('auditor.inactiveTip')}}</p>
              <div v-if="myCandidate.candidate.locked_tokens !== '0.0000 BOS'">
                <div @click="active" class="vote-button vote-button-active">{{$t('common.register')}}</div>
                <div @click="unstake" class="vote-button vote-button-active">{{$t('common.unstake')}}</div>
              </div>
              <div v-else @click="stake(config.lockupasset)" class="vote-button vote-button-active">{{$t('common.stake')}}</div>
            </div>
            <div @click="showUpdate" class="vote-button vote-button-active">{{$t('auditor.updateInfo')}}</div>
          </div>
          <div v-else-if="myAuditor" class="card">
            <h1>{{$t('auditor.youAreAuditor')}}</h1>
            <p>{{$t('common.votes')}}: {{(myAuditor.candidate.total_votes / 10000).toFixed(4)}}</p>
            <p>{{$t('common.staked')}}: {{myAuditor.candidate.locked_tokens}}</p>
            <div @click="showUpdate" class="vote-button vote-button-active">{{$t('auditor.updateInfo')}}</div>
          </div>
          <div v-else-if="scatter">
            <router-link v-if="scatter.identity" :to="{path: '/auditor/register'}">
              <div class="button square-button">
                {{$t('auditor.registerCand')}}
              </div>
            </router-link>
          </div>
        </div>
        <div class="card" >
          <div v-if="$i18n.locale === 'en'">
            <h2>The conditions for the auditor</h2>
            <p>The votes from token holders is not less than 3% of BP votes from token holders when the election was initiated, and lasts for 20 days.</p>
            <!-- <p>2. The ratio of approved votes / disapproved is greater than 1.5.</p> -->
            <!-- <p>2. The above conditions last for 20 days.</p> -->
          </div>
          <div v-if="$i18n.locale === 'cn'">
            <h2>成为评审员的条件</h2>
            <p>参与投票数量不少于提案发起时参与BP投票数量的 3%,并且持续20天成立。</p>
            <!-- <p>2. ⽀持票/反对票的⽐率⼤于 1.5。</p>
            <p>3. 以上条件持续 20 天成⽴。</p> -->
          </div>
          <div v-if="$store.state.summaries.bp_votes">
            <h2 style="font-size:16px; color: #507DFE; padding: 10px 0; margin: 0;border-top:1px solid #eee">BP 3% {{$t('common.votes') + ': '}}{{($store.state.summaries.bp_votes * 0.03 / 10000).toFixed(4)}}</h2>
            <div style="display: none" class="chart-panel" >
              <IEcharts
                ref="chart"
                :option="chartOption"
              ></IEcharts>
            </div>
          </div>
        </div>
      </el-aside>
    </el-container>
  <el-dialog
    :width="dialogWidth"
    title="Update candidate information"
    :visible.sync="updateDialog"
    v-loading="actionLoading"
    >
    <span>
      <el-form ref="updateForm" :model="candInfo" label-width="210px" :label-position="$store.state.screenWidth < 821 ? 'top' : 'left'" :rules="updateRules">
        <el-form-item prop="contact">
            <label slot="label">{{$t('form.email')}}</label>
            <el-input style="max-width: 400px;" v-model="candInfo.contact"></el-input>
          </el-form-item>
          <el-form-item>
            <label slot="label">{{$t('auditor.avatarUrl')}}</label>
            <el-input style="max-width: 400px;" v-model="candInfo.avatar" ></el-input>
          </el-form-item>
          <el-form-item prop="bio">
            <label slot="label">{{$t('auditor.BIO')}}</label>
            <el-input  v-model="candInfo.bio" type="textarea" :rows="10" ></el-input>
          </el-form-item>
      </el-form>
    </span>
    <span slot="footer">
      <el-button @click="updateDialog=false">{{$t('common.cancel')}}</el-button>
      <el-button type="primary" @click="updateBio">{{$t('common.update')}}</el-button>
    </span>
  </el-dialog>
  <el-dialog
    title="Stake more"
    :visible.sync="stakeVisible"
    width="30%">
    <el-input @change="formatStakeAmount" v-model="stakeAmount"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="stakeVisible = false">{{$t('common.cancel')}}</el-button>
      <el-button type="primary" @click="stake(stakeAmount)">{{$t('common.stake')}}</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import Eos from 'eosjs'
import { NETWORK, API_URL } from '@/assets/constants.js'
import Avatar from '@/components/Avatar.vue'
import CandidateCollapse from '@/components/CandidateCollapse.vue'
import IEcharts from 'vue-echarts-v3/src/lite.js'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
export default {
  name: 'Auditor',
  components: {
    Avatar,
    CandidateCollapse,
    IEcharts
  },
  data () {
    return {
      actionLoading: false,
      auditorLoading: true,
      candidateLoading: true,
      accountList: null,
      selectedCandidates: [],
      auditorsList: [],
      allCandList: [],
      candidatesList: [],
      config: null,
      contract: 'auditor.bos',
      myVotes: [],
      updateDialog: false,
      candInfo: {
        avatar: '',
        bio: '',
        contact: ''
      },
      updateRules: {
        bio: [
          { required: true, message: 'Bio can\'t be empty', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: 'Contact way can\'t be empty', trigger: 'blur' }
        ]
      },
      stakeAmount: '0.0000 BOS',
      stakeVisible: false
    }
  },
  mounted () {
    this.getCandidates()
    this.getAccounts()
    this.getConfig()
  },
  computed: {
    asideWidth () {
      if (this.$store.state.screenWidth < 821) {
        return '100%'
      }
      return '320px'
    },
    account () {
      if (this.scatter && this.scatter.identity) {
        return this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      } else {
        return null
      }
    },
    chartOption () {
      let aimVotes = (this.$store.state.summaries.bp_votes / 10000 * 0.03).toFixed(4)
      let data = [
        {
          value: this.$store.state.summaries.bp_votes / 10000 - aimVotes,
          name: '',
          itemStyle: {
            color: 'rgb(97, 169, 19)'
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          }
        },
        {
          value: aimVotes,
          name: 'candition votes',
          itemStyle: {
            color: 'rgb(217, 83, 79)'
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          }
        }
      ]
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{c} BOS ({d}%)',
          position: ['10px', '100px']
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: ['50%', '50%'],
            selectedMode: 'single',
            data: data,
            label: {
              normal: {
                textStyle: {
                  fontSize: 18,
                  color: '#235894'
                }
              }
            },
            itemStyle: {
              normal: {
                borderWidth: 1,
                borderColor: '#fff'
              }
            }
          }
        ]
      }
    },
    dialogWidth () {
      if (this.$store.state.screenWidth < 450) {
        return '90%'
      }
      return '60%'
    },
    myCandidate () {
      if (this.account) {
        return this.allCandList.find(elm => elm.id === this.account.name)
      }
      return null
    },
    myAuditor () {
      if (this.account) {
        return this.auditorsList.find(elm => elm.candidate.candidate_name === this.account.name)
      }
      return null
    },
    myVoted () {
      if (this.account && this.accountList) {
        if (this.accountList[this.account.name]) {
          return Object.keys(this.accountList[this.account.name].votes)
        }
      }
      return []
    },
    scatter () {
      return this.$store.state.scatter
    },
    eos () {
      if (this.scatter) {
        const eosOptions = { expireInSeconds: 60 }
        const eos = this.scatter.eos(NETWORK, Eos, eosOptions)
        return eos
      }
      return null
    },
    stakePercent () {
      let stake = Number(this.myCandidate.candidate.locked_tokens.split(' ')[0])
      return Number((stake * 100 / 100000).toFixed(1))
    }
  },
  methods: {
    getConfig () {
      fetch(API_URL.API_AUDITOR_CONFIG).then(res => res.json())
        .then((res) => {
          this.config = res
        }).catch(e => {
          this.$util.alert('warning', 'Loading system config failed, Please check your network and refresh page')
          console.log(e)
        })
    },
    getCandidates () {
      this.auditorsList = []
      this.allCandList = []
      this.candidatesList = []
      fetch(API_URL.API_GET_ALL_CANDIDATES).then(res => res.json()).then(res => {
        this.candidateLoading = false
        this.auditorLoading = false
        Object.keys(res).forEach(key => {
          let item = {
            total_votes: res[key].stats.staked.total,
            isSelected: false
          }
          item = Object.assign(item, res[key])
          if (item.is_auditor) {
            this.auditorsList.push(item)
          } else {
            this.allCandList.push(item)
            if (item.candidate.is_active) {
              this.candidatesList.push(item)
              this.candidatesList.sort((a, b) => { return b.total_votes - a.total_votes })
            }
          }
        })
      }).catch(e => {
        this.candidateLoading = false
        console.log(e)
      })
    },
    getIdentity () { // scatter认证
      const requiredFields = {
        accounts: [ NETWORK ]
      }
      this.scatter.getIdentity(requiredFields).then(() => {
        this.$store.dispatch('setScatter', { scatter: this.scatter })
      })
    },
    getAccounts () {
      fetch(API_URL.API_AUDITOR_ACCOUNTS).then(res => res.json())
        .then(res => {
          this.accountList = res
        })
    },
    handleSelect (msg, err) {
      if (err) {
        console.log(err)
      } else {
        if (msg.isSelected) {
          this.pushCandidate(msg.id)
        } else {
          this.removeCandidate(msg.id)
        }
      }
    },
    pushCandidate (id) {
      if (this.config) {
        if (this.selectedCandidates.length < this.config.maxvotes) {
          for (let i = 0; i < this.candidatesList.length; i++) {
            if (this.candidatesList[i].id === id) {
              this.candidatesList[i].isSelected = true
              this.selectedCandidates.push(this.candidatesList[i])
              break
            }
          }
        } else {
          //  提示
          this.$util.alert('Warning', `You only can vote to ${this.config.maxvotes} candidates`)
        }
      }
    },
    removeCandidate (id) {
      for (let i = 0; i < this.selectedCandidates.length; i++) {
        if (this.selectedCandidates[i].id === id) {
          this.selectedCandidates.splice(i, 1)
          break
        }
      }
      for (let i = 0; i < this.candidatesList.length; i++) {
        if (this.candidatesList[i].id === id) {
          this.candidatesList[i].isSelected = false
          break
        }
      }
    },
    removeAllCand () {
      this.selectedCandidates = []
      this.candidatesList.map(cand => {
        cand.isSelected = false
        return cand
      })
    },
    sendVotes () {
      if (!this.scatter) {
        this.$util.alert('', this.$t('warning.needScatter'), action => {
          if (action === 'confirm') {
            window.open('https://get-scatter.com/', '_blank')
          }
        })
      } else if (!this.scatter.identity) {
        this.$util.alert('Warning', 'Pair Scatter first')
        this.getIdentity()
      } else {
        this.actionLoading = true
        let newvotes = []
        this.selectedCandidates.forEach(item => {
          newvotes.push(item.id)
        })
        const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
        const transactionOptions = {
          actions: [
            {
              account: 'auditor.bos',
              name: 'vote',
              authorization: [{
                actor: account.name,
                permission: account.authority
              }],
              data: {
                voter: account.name,
                candidates: newvotes,
                vote_json: ''
              }
            }]
        }
        this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
          .then(() => {
            this.actionLoading = false
            this.$util.alert('Success', 'Your vote has been cast on candidates')
            this.getCandidates()
            this.removeAllCand()
          }).catch(e => {
            this.actionLoading = false
            let error = this.$util.errorFormat(e)
            this.$util.alert('Error', 'Vote ERROR:' + error.message)
            console.log(e)
          })
      }
    },
    async stake (amount) {
      this.actionLoading = true
      this.eos.transfer(this.account.name, this.contract, amount, '')
        .then(res => {
          this.getCandidates()
          this.getPendingStake()
          this.actionLoading = false
          this.$util.alert('Success', 'Stake successfully')
        })
        .catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.$util.alert('Error', 'Stake ERROR:' + error.message)
          console.log(e)
        })
    },
    unstake () {
      this.actionLoading = true
      const transactionOptions = {
        actions: [
          {
            account: this.contract,
            name: 'unstake',
            authorization: [{
              actor: this.account.name,
              permission: this.account.authority
            }],
            data: {
              cand: this.account.name
            }
          }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(() => {
          this.actionLoading = false
          this.getCandidates()
          this.getPendingStake()
          this.$util.alert('Success', 'Unstake successfully')
        })
        .catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.$util.alert('Error', 'Unstake ERROR:' + error.message)
          console.log(e)
        })
    },
    active () {
      this.actionLoading = true
      const transactionOptions = {
        actions: [
          {
            account: this.contract,
            name: 'nominatecand',
            authorization: [{
              actor: this.account.name,
              permission: this.account.authority
            }],
            data: {
              cand: this.account.name
            }
          }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(() => {
          this.actionLoading = false
          this.getCandidates()
          this.$util.alert('Success', 'You are active for auditor elections')
        })
        .catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.$util.alert('Error', 'Be active ERROR:' + error.message)
          console.log(e)
        })
    },
    inactive () {
      this.actionLoading = true
      const transactionOptions = {
        actions: [
          {
            account: this.contract,
            name: 'withdrawcand',
            authorization: [{
              actor: this.account.name,
              permission: this.account.authority
            }],
            data: {
              cand: this.account.name
            }
          }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(() => {
          this.actionLoading = false
          this.getCandidates()
          this.$util.alert('Success', 'You are inactive for auditor elections')
        })
        .catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.$util.alert('Error', 'Be inactive ERROR:' + error.message)
          console.log(e)
        })
    },
    showUpdate () {
      this.candInfo = {
        avatar: this.myCandidate.bio.avatar || '',
        bio: this.myCandidate.bio.bio,
        contact: this.myCandidate.bio.contact
      }
      this.updateDialog = true
    },
    unvote () {
      this.actionLoading = true
      const transactionOptions = {
        actions: [
          {
            account: 'auditor.bos',
            name: 'unvote',
            authorization: [{
              actor: this.account.name,
              permission: this.account.authority
            }],
            data: {
              voter: this.account.name
            }
          }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(() => {
          this.actionLoading = false
          this.$util.alert('Success', 'Unvote successfully')
          this.accountList = null
        }).catch(e => {
          this.actionLoading = false
          let error = this.$util.errorFormat(e)
          this.$util.alert('Error', 'Unote ERROR:' + error.message)
          console.log(e)
        })
    },
    updateBio () {
      this.$refs['updateForm'].validate(valid => {
        if (valid) {
          this.actionLoading = true
          const transactionOptions = {
            actions: [
              {
                account: this.contract,
                name: 'updatebio',
                authorization: [{
                  actor: this.account.name,
                  permission: this.account.authority
                }],
                data: {
                  cand: this.account.name,
                  bio: JSON.stringify(this.candInfo)
                }
              }]
          }
          this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
            .then(res => {
              this.updateDialog = false
              this.actionLoading = false
              this.$util.alert('Success', 'Update BIO successfully')
            })
            .catch(e => {
              this.actionLoading = false
              let error = this.$util.errorFormat(e)
              this.$util.alert('Error', 'Update BIO ERROR:' + error.message)
              console.log(e)
            })
        }
      })
    },
    stakeText () {
      let stake = Number(this.myCandidate.candidate.locked_tokens.split(' ')[0]).toFixed(0)
      stake = this.$util.toThousands(stake)
      return stake + '/100,000'
    },
    formatStakeAmount (value) {
      const v = Number(value.split(' ')[0])
      if (!Number.isNaN(v)) {
        this.stakeAmount = v.toFixed(4) + ' BOS'
      } else {
        this.stakeAmount = '0.0000 BOS'
      }
    }
  },
  watch: {
    $route () {
      this.getCandidates()
      this.getConfig()
      this.getPendingStake()
    }
  }
}
</script>

<style lang="stylus">
@media only screen and (max-width 840px)
  .auditor
    .el-container
      flex-wrap wrap
      flex-direction column
    .el-aside
      width 100%
      padding 0 20px
.auditor
  .el-progress__text
    font-family Roboto-Bold
    font-size 11px
    letter-spacing 0
    text-align center
  .pass-percent
    .el-progress__text
      color #30D094
    .el-progress-bar__inner
      background-image linear-gradient(270deg, #41B976 0%, #2CD69B 100%)
</style>

<style lang="stylus" scoped>
.auditor
  text-align left
h1
  font-family: Roboto-Medium;
  font-size: 20px;
  color: #507DFE;
  letter-spacing: 0;
.chart-panel
  min-width 250px
  height 200px
.main-panel
  p
    font-family: Roboto-Regular;
    font-size: 12px;
    color: #507DFE;
    letter-spacing: 0;
.board
  display flex
  justify-content flex-start
  flex-wrap wrap
.board-item
  display flex
  flex-direction column
  align-items center
  text-align center
  margin-right 20px
  p
    margin 10px
    font-family: Roboto-Medium;
    font-size: 12px;
    color: #507DFE;
    letter-spacing: 0;
.vote-panel
  p
    font-family: Roboto-Regular;
    font-size: 12px;
    color: #507DFE;
    letter-spacing: 0;
.square-button
  width 100%
.vote-button
  height 36px
  width auto
  line-height 36px
  background: #7599FF;
  border-radius: 6px;
  font-family: Roboto-Medium;
  font-size: 16px;
  color: #FFFFFF;
  cursor pointer
  letter-spacing: 0;
  text-align center
  margin 5px 0
.vote-button-active
  background: #527FFF;
  &:hover
    opacity 0.8
.card
  padding 22px 34px
  background: #FCFDFF;
  box-shadow: 0 2px 4px 0 #B0D9FF;
  border-radius: 8px;
  margin-bottom 22px
  h1
    font-family: Roboto-Medium;
    font-size: 24px;
    color #507DFE
    letter-spacing: 0;
  h2
    font-family: Roboto-Medium;
    color #507DFE
    font-size: 20px;
  p
    font-family: Roboto-Regular;
    font-size: 18px;
    color: #8A8A8A;
    letter-spacing: 0;
.selected-candidate-card
  background: #FCFDFF;
  box-shadow: 0 2px 4px 0 #B0D9FF;
  border-radius: 8px;
  padding 5px 10px
  margin-top 15px
  display flex
  justify-content space-between
  align-items center
  p
    font-family: Roboto-Medium;
    font-size: 14px;
    line-height 16px
    letter-spacing: 0;
.remove-button
  width 30px
  height 30px
  border-radius 50%
  text-align center
  background  #507DFE
  &:hover
    opacity 0.8
  i
    font-size 20px
    line-height 30px
    color #ffffff
</style>
