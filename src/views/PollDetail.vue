<template>
  <div v-loading="propLoading" class="poll-detail">
    <el-container>
      <el-main class="header">
        <div class="clear-float">
          <div id="back-button" @click="$router.push({path: '/'})">
            <i class="el-icon-arrow-left"></i>{{$t('proposal.back')}}
          </div>
        </div>
        <h1>{{proposal.proposal.title}}
        </h1>
        <!-- <h2 v-if="CDToAuditor > 0" style="color: #E74C3C">The countdown to auditors giving opinions ends in {{CDToAuditor}} days</h2>
        <h2 v-if="CDToBP > 0" style="color: #E74C3C">The countdown to BPs voting ends in {{CDToBP}} days</h2> -->
        <p>
          <span style="margin-right: 10px" class="proposal-info">{{`${proposal.proposal.proposal_name} by ${proposal.proposal.proposer} `}}</span>
          <br v-if="!$store.state.isPC"/>
          <!-- <span style="margin: 0 5px">{{$util.dateConvert(proposal.proposal.expires_at)}} </span> -->
          <span >{{proposal.proposal.proposal_json.type || $t('common.unknown')}} </span>
          <br v-if="!$store.state.isPC"/>
          <span style="font-weight:600">{{$t('proposal.budget')}}: {{incentives}}</span>
        </p>
        <div v-if="$store.state.isPC" style="margin-bottom:30px">
          <div
            class="radio-button"
            @click="activeButton = 'desc'"
            :class="{'radio-button-active': activeButton === 'desc'}">
            {{$t('proposal.desc')}}
          </div>
          <div
            v-if="votes.length"
            class="radio-button"
            @click="turnTo('stats')"
            :class="{'radio-button-active': activeButton === 'stats'}">
            {{$t('proposal.stats')}}
          </div>
          <div
            class="radio-button"
            @click="activeButton = 'voters'"
            :class="{'radio-button-active': activeButton === 'voters'}">
            {{$t('proposal.voters')}}
          </div>
          <div
            v-if="otherComm.length || BPComm.length || auditorComm.length"
            class="radio-button"
            @click="turnTo('comments')"
            :class="{'radio-button-active': activeButton === 'comments'}">
            {{$t('proposal.comments')}}
          </div>
        </div>
        <div ref="steps" class="steps-bar">
          <el-steps  style="background: #fff;min-width:500px;margin-bottom: 0"  class="card" :active="activeStep" simple finish-status="success" process-status="finish">
            <el-step ref="stepItem" :title="$t('proposal.vote')"></el-step>
            <el-step :title="$t('proposal.develop')"></el-step>
            <el-step :title="$t('proposal.review')"></el-step>
            <el-step :title="$t('proposal.finish')"></el-step>
          </el-steps>
        </div>
      <el-container>
        <el-main class="main">
          <div v-if="activeButton !=='voters'" ref="desc" class="card prop-content">
            <!-- <el-select v-model="translateTo">
              <el-option
                v-for="lang in translateOptions"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"></el-option>
            </el-select> -->
            <div v-html="content"></div>
          </div>
          <div v-else class="card" ref="voters">
            <h2>{{$t('proposal.voters')}}</h2>
            <el-table :data="showVoters" :default-sort="{prop: 'staked', order: 'descending'}">
              <el-table-column sortable :label="$t('proposal.voter')" prop="voter"></el-table-column>
              <el-table-column sortable :label="$t('common.votes')" prop="staked"></el-table-column>
              <el-table-column sortable :label="$t('proposal.type')" prop="type"></el-table-column>
              <el-table-column sortable :label="$t('common.result')" prop="result"></el-table-column>
            </el-table>
            <div v-if="showVotersNum < votes.length">
              <div class="button" style="margin: 20px auto;padding: 5px 20px" @click="showMoreVoters">{{$t('common.loadMore')}}</div>
            </div>
          </div>
          <div
            v-if="votes.length"
            v-loading="chartLoading"
            class="chart-card card"
            ref="stats">
            <h3>{{$t('proposal.voteSize')}}</h3>
            <div class="chart-panel">

              <IEcharts
                ref="chart"
                :option="chartOption"
              ></IEcharts>
            </div>
          </div>
          <div ref="comments">
            <div v-if="auditorComm.length" class="card">
              <h2>{{$t('common.auditor')}} {{$t('proposal.comments')}} {{auditorComm.length}}</h2>
              <Comment v-for="(comment, index) in auditorComm" :key="index" v-bind="comment"></Comment>
            </div>

            <div v-if="BPComm.length" class="card">
              <h2>{{$t('proposal.BP')}} {{$t('proposal.comments')}} {{BPComm.length}}</h2>
              <Comment v-for="(comment, index) in BPComm" :key="index" v-bind="comment"></Comment>
            </div>

            <div v-if="otherComm.lenght" class="card">
              <h2>{{$t('proposal.other')}} {{$t('proposal.comments')}} {{otherComm.length}}</h2>
              <Comment v-for="(comment, index) in otherComm" :key="index" v-bind="comment"></Comment>
            </div>
          </div>
        </el-main>
        <el-aside class="aside-right" :width="asideWidth">
          <div v-loading="actionLoading" class="card" id="poll-status">
            <h2>{{$t('proposal.propStatus')}}</h2>
            <el-progress :stroke-width="10" class="pass-percent" :percentage="agreePercent"></el-progress>
            <el-progress :stroke-width="10" class="dissent-percent" :percentage="rejectPercent"></el-progress>
            <!-- <el-progress :stroke-width="10" class="abstain-percent" :percentage="abstainPercent"></el-progress> -->
            <div style="margin:15px 0">
              <p style="margin: 0">{{$util.toThousands((this.proposal.stats.staked.total / 10000).toFixed(0))}} BOS {{$t('common.voted').toLocaleLowerCase()}}</p>
              <el-progress v-loading="this.votesOfBP === -1" :stroke-width="10" class="voted-percent" :percentage="votedPercent"></el-progress>
            </div>
            <div class="scatter-panel">
              <div v-if="scatter">
                <div v-if="scatter.identity">
                  <div style="magin-bottom:10px">
                  <el-radio-group v-model="voteActionParams.vote">
                    <el-radio :label="1">{{$t('common.yes')}}</el-radio>
                    <el-radio :label="0">{{$t('common.no')}}</el-radio>
                    <el-radio :label="255">{{$t('common.abstain')}}</el-radio>
                  </el-radio-group>
                  </div>
                  <div v-if="isAuditor || isBP">
                    <p>{{$t('proposal.writeOpinion')}}</p>
                    <el-input
                      type="textarea"
                      :rows="4"
                      v-model="myComment"
                    ></el-input>
                  </div>
                  <div v-else style="margin:5px 0">
                    <el-checkbox v-model="writeComment">
                      {{$t('proposal.publicComment')}} ({{$t('common.optional')}})
                    </el-checkbox>
                    <div v-if="writeComment">
                      <el-input
                        type="textarea"
                        :rows="4"
                        v-model="myComment"
                      ></el-input>
                    </div>
                  </div>

                  <div v-if="myVote">{{$t('common.voted')}} {{myVote.result}}</div>
                  <div style="display: flex; justify-content:flex-start;margin-top:10px">
                    <div @click="sendVote" class="button" style="margin-right: 20px;width:80px">
                      {{$t('common.vote')}}
                    </div>
                    <div v-if="myVote" class="button" @click="sendUnvote" style="background: red;margin-right: 20px">{{$t('common.unvote')}}</div>
                  </div>
                </div>
              </div>
            </div>
            <hr style="border: none; border-bottom:2px solid #D8D8D8;" />
            <div>
              <div v-if="(this.proposal.meet_conditions_days > 0)">
                <h3> {{satisfiedWord}}</h3>
                <el-progress :format="satisfiedText" :stroke-width="10" class="pass-percent" :percentage="satisfiedPercent"></el-progress>
              </div>
              <p>{{this.proposal.stats.votes.total}} {{this.proposal.stats.votes.total > 1 ? $t('proposal.voters') : $t('proposal.voter')}}</p>
              <p>{{this.proposal.duration > 1 ? $t('proposal.propDays', [this.proposal.duration]) : $t('proposal.propDay', [this.proposal.duration])}}</p>
            </div>
          </div>
          <div class="card" v-if="$i18n.locale === 'en'">
            <h2>The conditions for the approved proposal</h2>
            <p>1. The votes from token holders is not less than 40% of BP votes from token holders when the proposal was initiated.</p>
            <p>2. The ratio of approved votes/disapproved is greater than 1.5.</p>
            <p>3. The above conditions last for 20 days.</p>
          </div>
          <div class="card" v-if="$i18n.locale === 'cn'">
            <h2>提案通过的条件</h2>
            <p>1. 参与投票数量不少于提案发起时参与BP投票数量的40%。</p>
            <p>2. ⽀持票/反对票的⽐率⼤于 1.5。</p>
            <p>3. 以上条件持续 20 天成⽴。</p>
          </div>
          <h2 v-if="relatedPolls.length">
            {{$t('proposal.relatedProp')}}
          </h2>
          <div id="related-polls">
            <div
              v-for="(prop, index) in relatedPolls"
              @click="turnDetail(prop)"
              :key="index"
              style="margin-bottom: 30px; cursor: pointer"
            >
            <PropCard
              :type="prop.proposal.proposal_json.type || $t('common.unknown')"
              :title="prop.proposal.title"
              :desc="prop.proposal.proposal_json.content || ''"
              :votes="prop.stats.votes"
              :staked="prop.stats.staked.total"
              :percent="prop.meet_conditions_days"
              >
            </PropCard>
          </div>
          </div>
        </el-aside>
      </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import marked from 'marked'
import Eos from 'eosjs'
import { NETWORK, API_URL, NODE_ENDPOINT, EOSFORUM } from '@/assets/constants.js'
import IEcharts from 'vue-echarts-v3/src/lite.js'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
import PropCard from '@/components/PropCard.vue'
import Comment from '@/components/Comment.vue'

export default {
  name: 'PollDetail',
  components: {
    PropCard,
    IEcharts,
    Comment
  },
  computed: {
    account () {
      if (this.scatter && this.scatter.identity) {
        return this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      }
      return null
    },
    activeStep () {
      if (this.proposal) {
        if (this.proposal.approved_by_vote) {
          if (this.proposal.finish) {
            // final approved
            return 4
          } else if (this.proposal.review) {
            // voting by BPs
            return 2
          }
          // reviewing
          return 1
        }
      }
      return 0
    },
    asideWidth () {
      if (this.screenWidth < 821) {
        return '100%'
      }
      return '374px'
    },
    auditorComm () {
      let comm = []
      this.votes.forEach(vote => {
        if (vote.vote_json && vote.vote_json.comment) {
          let comment = {
            avatar: '',
            name: vote.voter,
            time: vote.updated_at,
            comment: vote.vote_json.comment
          }
          let isAuditor = this.auditorsList.find(auditor => {
            return Boolean(auditor.auditor_name === vote.voter)
          })
          if (isAuditor) {
            comm.push(comment)
          }
        }
      })
      return comm
    },
    BPComm () {
      let comm = []
      this.votes.forEach(vote => {
        if (vote.vote_json && vote.vote_json.comment) {
          let comment = {
            avatar: '',
            name: vote.voter,
            time: vote.updated_at,
            comment: vote.vote_json.comment
          }
          let isBP = this.producers.find(producer => {
            return Boolean(producer.owner === vote.voter)
          })
          if (isBP) {
            comm.push(comment)
          }
        }
      })
      return comm
    },
    chartLoading () {
      if (this.votes) {
        return false
      } else {
        return true
      }
    },
    chartOption () {
      let data = []
      if (this.votes) {
        this.votes.forEach(vote => {
          let label = true
          if (!this.$store.state.isPC) {
            label = false
          }
          if (vote.vote !== 1 && vote.vote !== 0) {
            return
          }
          if (data.length > 20) {
            if (this.proposal.stats.staked.total !== 0 && (vote.staked * 10000 / this.proposal.stats.staked.total) > 0.002) {
              return
            }
            label = false
          }
          data.push({
            value: vote.staked,
            name: vote.voter,
            itemStyle: {
              color: (vote.vote === 1) ? 'rgb(97, 169, 19)' : 'rgb(217, 83, 79)'
            },
            label: {
              show: label
            },
            labelLine: {
              show: label
            }
          })
        })
      }
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} BOS ({d}%)',
          position: this.$store.state.isPC ? null : ['10px', '100px']
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: this.$store.state.isPC ? ['50%', '50%'] : ['50%', '100px'],
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
    incentives () {
      if (this.proposal) {
        if (this.proposal.proposal.proposal_json.incentives !== undefined) {
          let incentives = Number(this.proposal.proposal.proposal_json.incentives.split(' ')[0])
          let integer = Number(incentives.toFixed(0))
          let decimals = String(incentives * 10000 % 10000)
          while (decimals.length < 4) {
            decimals = '0' + decimals
          }
          return this.$util.toThousands(integer) + '.' + decimals + ' BOS'
        } else {
          if (this.budgetList[this.proposal.proposal.proposal_name] !== undefined) {
            let incentives = Number(this.budgetList[this.proposalName])
            let integer = Number(incentives.toFixed(0))
            let decimals = String(incentives * 10000 % 10000)
            while (decimals.length < 4) {
              decimals = '0' + decimals
            }
            return this.$util.toThousands(integer) + '.' + decimals + ' BOS'
          }
        }
      }
      return 'Not declare'
    },
    otherComm () {
      let comm = []
      this.votes.forEach(vote => {
        if (vote.vote_json && vote.vote_json.comment) {
          let comment = {
            avatar: '',
            name: vote.voter,
            time: vote.updated_at,
            comment: vote.vote_json.comment
          }
          let isAuditor = this.auditorsList.find(auditor => {
            return Boolean(auditor.auditor_name === vote.voter)
          })
          let isBP = this.producers.find(producer => {
            return Boolean(producer.owner === vote.voter)
          })
          if (!isAuditor && !isBP) {
            comm.push(comment)
          }
        }
      })
      return comm
    },
    showVoters () {
      return this.votes.slice(0, this.showVotersNum)
    },
    myVote () {
      let myVotes = null
      if (this.$store.state.accounts && this.scatter && this.scatter.identity) {
        myVotes = this.$store.state.accounts[this.scatter.identity.accounts[0].name]
        if (myVotes && myVotes.votes[this.proposalName]) {
          let vote = { ...myVotes.votes[this.proposalName] }
          if (vote.vote === 1) {
            vote.result = this.$t('common.yes')
          } else if (vote.vote === 0) {
            vote.result = this.$t('common.no')
          } else {
            vote.result = this.$t('common.abstain')
          }
          return vote
        }
      }
      return null
    },
    proposalName () {
      return this.$route.query.proposal || localStorage.getItem('proposalName')
    },
    relatedPolls () {
      let related = []
      const proposals = this.$store.state.proposals
      if (proposals && this.proposal) {
        Object.keys(proposals).forEach(key => {
          if (proposals[key].proposal.proposer === this.proposal.proposal.proposer &&
          proposals[key].proposal.proposal_name !== this.proposal.proposal.proposal_name) {
            if (related.length < 2) {
              // if (!this.$util.isExpired(proposals[key].proposal.expires_at)) {
              related.push(proposals[key])
              // }
            }
          }
        })
      }
      return related
    },
    satisfiedPercent () {
      if (this.proposal) {
        if (this.proposal.meet_conditions_days > 20) {
          return 100
        }
        return Number((100 * this.proposal.meet_conditions_days / 20).toFixed(1))
      } else {
        return 0
      }
    },
    satisfiedWord () {
      let word = ''
      if (this.proposal.meet_conditions_days > 1) {
        word = this.$t('common.daysSatisfied', [this.proposal.meet_conditions_days])
      } else {
        word = this.$t('common.daySatisfied', [this.proposal.meet_conditions_days])
      }
      return word
    },
    agreePercent () {
      if (!this.proposal || this.proposal.stats.staked.total === 0 || !this.proposal.stats.staked[1]) {
        return 0
      } else {
        return Number((100 * this.proposal.stats.staked[1] / this.proposal.stats.staked.total).toFixed(1))
      }
    },
    rejectPercent () {
      if (!this.proposal || this.proposal.stats.staked.total === 0 || !this.proposal.stats.staked[0]) {
        return 0
      } else {
        return Number((100 * this.proposal.stats.staked[0] / this.proposal.stats.staked.total).toFixed(1))
      }
    },
    votes () { // votes for this proposal
      let allVotes = this.$store.state.votes
      let allAccounts = this.$store.state.accounts
      let allProxies = this.$store.state.proxies
      if (allVotes && allAccounts && allProxies) {
        if (typeof allVotes === 'string') {
          allVotes = JSON.parse(allVotes)
        }
        let votes = []
        allVotes.forEach(vote => {
          if (vote.proposal_name === this.proposalName) {
            if (vote.vote === 1) {
              vote.result = this.$t('common.yes')
            } else if (vote.vote === 0) {
              vote.result = this.$t('common.no')
            } else {
              vote.result = this.$t('common.abstain')
            }
            if (allAccounts[vote.voter]) {
              vote.type = 'Voter'
              vote.staked = Number((allAccounts[vote.voter].staked / 10000).toFixed(0))
            } else if (allProxies[vote.voter]) {
              vote.type = 'Proxy'
              vote.staked = Number((allProxies[vote.voter].votes[this.proposalName].staked_proxy / 10000).toFixed(0))
            } else {
              vote.type = 'Voter'
              vote.staked = 0
            }
            // sort votes
            if (votes.length === 0 || vote.staked <= votes[votes.length - 1].staked) {
              votes.push(vote)
            } else {
              for (let i = votes.length - 1; i >= 0; i--) {
                if (vote.staked < votes[i].staked) {
                  votes.splice(i + 1, 0, vote) // 插在该元素后面
                  break
                } else if (i === 0) {
                  votes.splice(0, 0, vote)
                }
              }
            }
          }
        })
        return votes
      } else {
        return []
      }
    },
    votesOfBP () { // cunrrent active votes of BP election
      return this.$store.state.summaries.bp_votes || -1
    },
    votedPercent () {
      if (this.votesOfBP === 0 || this.votesOfBP === -1) {
        return 0
      } else {
        return Number((this.proposal.stats.staked.total / this.votesOfBP * 100).toFixed(1))
      }
    },
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
    isAuditor () {
      return this.auditorsList.find(auditor => {
        return auditor.auditor_name === this.account.name
      })
    },
    isBP () {
      return this.auditorsList.find(auditor => {
        return auditor.auditor_name === this.account.name
      })
    },
    finalApproved () {
      if (this.proposal) {
        if (this.proposal.approved_by_BPs || this.proposal.approved_by_BET) {
          return 1
        } else if (this.proposal.approved_by_BPs_date !== 'None' && !this.approved_by_BPs_date) {
          return 0
        }
      }
      return -1
    }
  },
  data () {
    return {
      activeButton: 'desc',
      actionLoading: false,
      auditorsList: [],
      budgetList: {
        'historyindex': '250000.0000',
        'eosiosg11111': '1000000.0000',
        'bosnationwps': '515000.0000',
        'constantstab': '350000.0000',
        'hyperion.api': '995600.0000',
        'chintaionbos': '1000000.0000',
        'omegaautodex': '450000.0000',
        'btconbos': '400000.0000',
        'universal': '800000.0000'
      },
      CDToBP: -1,
      CDToAuditor: -1,
      content: '',
      myComment: '',
      producers: [],
      proposal: {
        approved_by_BET: false,
        approved_by_BPs: false,
        approved_by_BPs_date: 'None',
        approved_by_vote: false,
        approved_by_vote_date: 'None',
        id: '',
        meet_conditions_days: 0,
        proposal: {
          // expires_at: '',
          created_at: '',
          title: '',
          proposer: '',
          proposal_name: '',
          proposal_json: {
            type: '',
            content: ''
          }
        },
        reviewed_by_BET_date: 'None',
        stats: {
          votes: {},
          accounts: {},
          staked: {
            total: 0
          }
        }
      },
      propLoading: true,
      showVotersNum: 30,
      screenWidth: document.body.clientWidth,
      translateTo: 'en',
      translateOptions: [{
        value: 'en',
        label: 'English'
      }, {
        value: 'zh-cn',
        label: '简体中文'
      }, {
        value: 'zh-tw',
        label: '繁体中文'
      }],
      voteActionParams: {
        voter: '',
        proposal_name: '',
        vote: -1,
        vote_json: ''
      },
      writeComment: false
    }
  },
  created () {
    this.getProposal()
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.$refs['chart'].resize()
      this.screenWidth = document.body.clientWidth
    })
    this.getProducers()
    this.getAuditors()
    this.$refs['steps'].scrollLeft += this.$refs['steps'].scrollWidth * this.activeStep / 4
  },
  methods: {
    calcDays (start, end) {
      let startDay = new Date(start)
      let endDay = new Date(end)
      return ((endDay.getTime() - startDay.getTime()) / 1000 / 3600 / 24).toFixed(0)
    },
    calcPercent (numerator, denominator) {
      if (!denominator === 0) {
        return 0
      } else {
        return Number((numerator * 100 / denominator).toFixed(2))
      }
    },
    getProposal () {
      fetch(API_URL.API_GET_PROPOSAL + '/' + this.proposalName)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          this.propLoading = false
          this.proposal = res
          this.proposal.duration = this.calcDays(this.proposal.proposal.created_at, new Date().toString())
          if (this.proposal.approved_by_vote && !this.proposal.approved_by_BET && this.proposal.reviewed_by_BET_date && this.proposal.reviewed_by_BET_date !== 'None') {
            const start = new Date(this.proposal.reviewed_by_BET_date).getTime()
            const end = new Date().getTime()
            const d = Math.floor((end - start) / 1000 / 60 / 60 / 24)
            if (d >= 7) {
              this.CDToBP = 14 - d + 7
            } else {
              this.CDToAuditor = 7 - d
            }
          }
          try {
            this.proposal.proposal.proposal_json = JSON.parse(this.$util.transSpecialChar(this.proposal.proposal.proposal_json))
            this.proposal.proposal.proposal_json.content = this.$util.unTransSpecialChar(this.proposal.proposal.proposal_json.content)
          } catch (e) {
            console.log(e)
            this.proposal.proposal.proposal_json = {
              type: '',
              content: ' '
            }
            let error = this.$util.errorFormat(e)
            this.$util.alert('Error', 'proposal_json ERROR:' + error.message)
          }

          // 将提案内容MD解析并翻译
          this.content = marked(this.proposal.proposal.proposal_json.content, { sanitize: true })
        }).catch(e => {
          this.propLoading = false
          // let error = this.$util.errorFormat(e)
          // this.$util.alert('Error', 'Get Proposal ERROR:' + error.message)
          console.log(e)
        })
    },
    getProducers () {
      fetch(API_URL.API_GET_PRODUCERS)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          this.producers = res.producer
        }).catch(e => {
          // let error = this.$util.errorFormat(e)
          // this.$util.alert('Error', 'Get Producers ERROR:' + error.message)
          console.log(e)
        })
    },
    getAuditors () {
      // const tableOptions = new FormData()
      // tableOptions.append('scope', 'auditor.bos')
      // tableOptions.append('code', 'auditor.bos')
      // tableOptions.append('table', 'auditors')
      // tableOptions.append('json', true)
      const tableOptions = {
        'scope': 'auditor.bos',
        'code': 'auditor.bos',
        'table': 'auditors',
        'json': true
      }
      fetch(NODE_ENDPOINT + '/v1/chain/get_table_rows', {
        method: 'POST',
        body: JSON.stringify(tableOptions),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }).then(res => res.json())
        .then(res => {
          this.auditorsList = res.rows
        }).catch(e => {
          console.log(e)
          // let error = this.$util.errorFormat(e)
          // this.$util.alert('Error', 'Get Auditors ERROR:' + error.message)
        })
    },
    getIdentity () {
      const requiredFields = {
        accounts: [ NETWORK ]
      }
      this.scatter.getIdentity(requiredFields).then(() => {
        // console.log(this.scatter.identity)
        this.$store.dispatch('setScatter', { scatter: this.scatter })
      })
    },
    sendVote () {
      if (this.voteActionParams.vote === -1) {
        this.$util.alert('Warning', 'Please choose your vote')
      } else
      if (this.myComment === '' && (this.isAuditor || this.isBP)) {
        this.$util.alert('Warning', 'Please write your opinion of this proposal')
      } else {
        this.actionLoading = true
        this.voteActionParams.voter = this.account.name
        this.voteActionParams.proposal_name = this.proposalName
        if (this.myComment !== '' && (this.writeComment || this.isAuditor || this.isBP)) {
          this.voteActionParams.vote_json = JSON.stringify({ comment: this.myComment })
        } else {
          this.voteActionParams.vote_json = ''
        }
        const transactionOptions = {
          actions: [{
            account: EOSFORUM,
            name: 'vote',
            authorization: [{
              actor: this.account.name,
              permission: this.account.authority
            }],
            data: { ...this.voteActionParams }
          }]
        }
        this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
          .then(res => {
            this.actionLoading = false
            let message = `Your vote  has been cast on ${this.proposalName}, data will be updated some time later`
            this.$util.alert('Success', message)
            this.$store.commit('addVote', { vote: {
              ...this.voteActionParams
            } })
          }).catch(e => {
            this.actionLoading = false
            this.$util.eosErrorAlert(e)
            console.log(e)
          })
      }
    },
    sendUnvote () {
      this.actionLoading = true
      const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      const actionParams = {
        voter: account.name,
        proposal_name: this.proposalName
      }
      const transactionOptions = {
        actions: [{
          account: EOSFORUM,
          name: 'unvote',
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: { ...actionParams }
        }]
      }
      this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
        .then(res => {
          this.actionLoading = false
          let message = `Your unvote on ${this.proposalName} was successful, data will be updated some time later`
          this.$util.alert('Success', 'Vote ERROR:' + message)
          this.$store.commit('deleteVote', { vote: {
            ...actionParams
          } })
        }).catch(e => {
          this.actionLoading = false
          this.$util.eosErrorAlert(e)
          console.log(e)
        })
    },
    showMoreVoters () {
      this.showVotersNum += 30
      if (this.showVotersNum > this.votes.length) {
        this.showVotersNum = this.votes.length
      }
    },
    satisfiedText (percentage) {
      return `${this.proposal.meet_conditions_days}/20`
    },
    turnTo (target) {
      // 跳转到某个card
      this.activeButton = target
      this.$refs[target].scrollIntoView()
    },
    turnDetail (prop) {
      // 进入另一个prop
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
      // this.$router.push({ path: '/poll_detail', query: { proposal: prop.proposal.proposal_name } })
      // this.getProposal()
    }
  },
  watch: {
    $route () {
      this.getProposal()
      this.$store.dispatch('getAccounts')
      this.$store.dispatch('getVotes')
      this.$store.dispatch('getProxies')
    },
    activeStep (newValue, oldValue) {
      this.$refs['steps'].scrollLeft += this.$refs['stepItem'].width * newValue
    }
  }
}
</script>

<style lang="stylus">
@media only screen and (max-width 840px)
  .poll-detail
    .el-container
      flex-wrap wrap
      // flex-direction column-reverse
    .el-aside
      width 100%
#poll-status
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
    .el-progress-bar__outer
      background-color rgba(65,185,118, 0.2)
  .dissent-percent
    .el-progress__text
      color #F46666
    .el-progress-bar__inner
      background-image linear-gradient(269deg, #F06262 0%, #FF7171 100%)
    .el-progress-bar__outer
      background-color rgba(240,98,98, 0.2)
  .satisfied-percent
    .el-progress__text
      color #F4D03F
    .el-progress-bar__inner
      background-image linear-gradient(270deg, #F7DC6F 0%, #F1C40F 100%)
  .voted-percent
     .el-progress__text
      color #3498DB
    .el-progress-bar__inner
      background-image linear-gradient(270deg, #5DADE2 0%, #3498DB 100%)
    .el-progress-bar__outer
      background-color rgba(93,173,226, 0.2)
</style>

<style lang="stylus" scoped>
.poll-detail
  background-color rgb(232,236,255)
  padding 20px 0
  text-align left
  color #507DFE
.chart-card
  text-align: center
  overflow: auto
.chart-panel
  min-width:600px
  height:500px
.header
  h1
    font-family: Roboto-Medium;
    font-size: 30px;
    letter-spacing: 0;
  h2
    font-family: Roboto-Medium;
    font-size: 24px;
  p
    font-family: Roboto-Regular;
    font-size: 18px;
    color: #8A8A8A;
    letter-spacing: 0;
.main
  font-family: Roboto-Regular;
  font-size: 18px;
  color: #8A8A8A;
  letter-spacing: 0;
  padding-left 0
  padding-top 0
  h1, h2, h3, h4, h5
    font-family: Roboto-Medium;
    color: #507DFE;
.aside-right
  padding 0 12px
.prop-content
  overflow-wrap break-word
  color: #010101;
  >>> h1
    font-size 24px
    color #507DFE
  >>> h2
    font-size 22px
    color #507DFE
  >>> h3
    font-size 20px
    color #507DFE
  >>> h4
    font-size: 18px;
    color #507DFE
  >>> h5
    font-size: 16px;
    color #507DFE
  >>> h6
    font-size: 14px;
    color #507DFE
  >>> p
    font-family: Roboto-Regular;
    font-size: 14px;
    letter-spacing: 0;
  >>> a
    color #0366d6
  >>> img
    max-width 100%
#back-button
  float left
  cursor pointer
  padding 0 10px
  height 32px
  line-height 32px
  background: #507DFE;
  border-radius: 15.5px;
  font-family: PingFangSC-Medium;
  font-size: 18px;
  color: #FFFFFF;
  letter-spacing: 0;
  text-align: center;
.radio-button
  height 24px
  min-width 103px
  line-height 24px
  margin-right 10px
  display inline-block
  cursor pointer
  opacity: 0.5;
  background: #7599FF;
  border-radius: 13.29px;
  font-family: PingFangSC-Medium;
  font-size: 13.71px;
  color: #FFFFFF;
  letter-spacing: 0;
  text-align: center;
.radio-button-active
  opacity 1
.pie-chart
  width:800px
  height:500px
  margin:auto
#related-polls
  display flex
  flex-wrap wrap
  justify-content center
.steps-bar
  overflow auto
  border-radius 8px
  margin-bottom 22px
  margin-right 12px
@media only screen and (max-width 840px)
  .main
    padding 0
  .radio-button
    margin-bottom 5px
  .aside-right
    padding 0
@media only screen and (max-width 450px)
  .chart-card
    height 300px
    overflow hidden
  .chart-panel
    min-width:200px
  .header
    h1
      font-size 24px
    h2
      font-size 20px
    p
      font-size 16px
  .proposal-info
    display inline-block
    font-size 18px
    margin 5px 0
</style>
