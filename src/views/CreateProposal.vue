<template>
  <div class="create-proposal">
    <el-container>
      <el-main>
      <div id="back-button" @click="$router.push({path: '/'})">
        <i class="el-icon-arrow-left"></i>{{$t('common.back')}}
      </div>
      <h2>{{$t('common.createProp')}}</h2>
      <div class="card" v-loading="actionLoading">
        <el-form ref="form" :rules="rules" :model="form" label-position="top" label-width="110px">
          <el-form-item>
            <label slot="label">{{$t('form.proposer')}}</label>
            <span>{{proposer}}</span>
          </el-form-item >
          <el-form-item prop="name">
            <label slot="label">{{$t('form.proposalName')}}</label>
            <el-input maxlength="12" v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item prop="title">
            <label slot="label">{{$t('form.title')}}</label>
            <el-input maxlength="1024" type="textarea" :autosize="{ minRows: 1, maxRows: 3}" v-model="form.title"></el-input>
          </el-form-item>
          <el-form-item prop="incentives">
            <label slot="label">{{$t('form.budget')}}</label>
            <el-input max="1000000" @change="formatIncentives(form.incentives)" v-model="form.incentives"></el-input>
          </el-form-item>
          <el-form-item prop="receiptor">
            <label slot="label">{{$t('form.receiptor')}}</label>
            <el-input  maxlength="12" v-model="form.receiptor"></el-input>
          </el-form-item>
          <el-form-item prop="content">
            <label slot="label">{{$t('form.content')}} ({{$t('form.support')}} Markdown)</label>
            <el-input v-model="form.content" type="textarea" :rows="10"></el-input>
          </el-form-item>
          <el-form-item prop="type">
            <label slot="label">{{$t('form.type')}}</label>
            <el-select v-model="form.type">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <div class="button" @click="createProp">
              {{$t('form.submit')}}
            </div>
          </el-form-item>
        </el-form>
      </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Eos from 'eosjs'
import { NETWORK, EOSFORUM } from '@/assets/constants.js'
import { Message } from 'element-ui'
export default {
  name: 'CreateProposal',
  data () {
    const checkIncentives = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('Please input a number of budget'))
      } else {
        const v = Number(value.split(' ')[0])
        if (Number(v) > 1000000) {
          return callback(new Error(this.$t('alert.proposal.budgetOverstep')))
        } else {
          callback()
        }
      }
    }
    const checkPropName = (rule, value, cb) => {
      if (value === '') {
        return cb(new Error(this.$t('alert.proposal.emptyPropName')))
      } else {
        const regex = /^([a-z]|[1-5]){12}$/g
        if (regex.test(value)) {
          cb()
        } else {
          return cb(new Error(this.$t('alert.proposal.wrongName')))
        }
      }
    }
    const checkReceiptorName = (rule, value, cb) => {
      if (value === '') {
        return cb(new Error(this.$t('alert.proposal.emptyReceiptor')))
      } else {
        const regex = /^([a-z]|[1-5]){12}$/g
        if (regex.test(value)) {
          cb()
        } else {
          return cb(new Error(this.$t('alert.proposal.wrongName')))
        }
      }
    }
    return {
      actionLoading: false,
      form: {
        name: '',
        title: '',
        content: '',
        // expiry: '',
        receiptor: this.proposer,
        incentives: '0.0000 BOS',
        type: 'referendum-v1'
      },
      rules: {
        name: [
          { required: true, validator: checkPropName, trigger: 'blur' }
        ],
        title: [
          { required: true, message: this.$t('alert.proposal.emptyPropTitle'), trigger: 'blur' }
        ],
        content: [
          { required: true, message: this.$t('alert.proposal.emptyPropContent'), trigger: 'blur' }
        ],
        type: [
          { message: 'Please choose proposal type', trigger: 'blur' }
        ],
        incentives: [
          { required: true, validator: checkIncentives, trigger: 'blur' }
        ],
        receiptor: [
          { required: true, validator: checkReceiptorName, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    proposer () {
      if (this.scatter && this.scatter.identity) {
        return this.scatter.identity.accounts.find(x => x.blockchain === 'eos').name
      } else {
        return ''
      }
    },
    scatter () {
      return this.$store.state.scatter
    },
    typeOptions () {
      return [
        {
          label: this.$t('common.referendum'),
          value: 'referendum-v1'
        },
        {
          label: this.$t('common.poll'),
          value: 'poll_default'
        }
      ]
    },
    eos () {
      if (this.scatter && this.scatter.identity) {
        const eosOptions = { expireInSeconds: 60 }
        const eos = this.scatter.eos(NETWORK, Eos, eosOptions)
        return eos
      }
      return null
    }
  },
  methods: {
    createProp () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.actionLoading = true
          const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
          let actionParams = {
            proposer: account.name,
            proposal_name: this.form.name,
            title: this.form.title,
            // expires_at: this.form.expiry,
            proposal_json: JSON.stringify({
              content: this.form.content,
              type: this.form.type,
              incentives: this.form.incentives,
              receiptor: this.form.receiptor
            })
          }
          const transactionOptions = {
            actions: [{
              account: EOSFORUM,
              name: 'propose',
              authorization: [{
                actor: account.name,
                permission: account.authority
              }],
              data: actionParams
            }]
          }
          this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
            .then(res => {
              this.actionLoading = false
              Message({
                showClose: true,
                type: 'success',
                message: this.$t('alert.proposal.createSUC')
              })
              this.$router.replace('/referendum')
            }).catch(e => {
              this.actionLoading = false
              this.$util.eosErrorAlert(e)
              console.log(e)
            })
        }
      })
    },
    formatIncentives (value) {
      const v = Number(value.split(' ')[0])
      if (!Number.isNaN(v)) {
        this.form.incentives = v.toFixed(4) + ' BOS'
      } else {
        this.form.incentives = '0.0000 BOS'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.create-proposal
  h2
    color: #507DFE;
.card
  text-align left
  max-width 700px
  padding 22px 50px
  margin auto
  margin-bottom 70px
  label
    color: #507DFE;
.button
  display block
  border-radius: 4px;
  height 40px
  line-height 30px
  width 400px
  margin auto
  margin-top 20px
@media only screen and (max-width 600px)
  .button
    width 100%
#back-button
  cursor pointer
  width 100px
  height 32px
  line-height 32px
  background: #507DFE;
  border-radius: 15.5px;
  font-family: PingFangSC-Medium;
  font-size: 18px;
  color: #FFFFFF;
  letter-spacing: 0;
  text-align: center;
</style>
