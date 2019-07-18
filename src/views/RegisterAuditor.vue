<template>
  <el-container class="register-auditor">
    <el-main>
      <h1 style="line-height:30px;margin:15px 0px;">{{$t('auditor.registerCand')}}</h1>
      <div class="card" v-loading="actionLoading">
        <el-form ref="form" :rules="rules" :model="form" label-position="top" label-width="110px">
          <p>{{$t("auditor.regiterIntro")}}</p>
          <el-form-item prop="auditorName">
            <label slot="label">{{$t('auditor.candName')}} (BOS {{$t('common.account').toLocaleLowerCase()}})</label>
            <el-input style="max-width: 400px;"  maxlength="12" v-model="form.auditorName" ></el-input>
          </el-form-item>
          <el-form-item>
            <label slot="label">
              {{$t('auditor.stakeAmount')}}
              ({{$t('auditor.alreadyStaked')}}
              <el-checkbox v-model="hasStaked"></el-checkbox>
              )
            </label>
            <el-input disabled style="max-width: 400px;" v-model="form.stakeAmount"></el-input>
          </el-form-item>
          <el-form-item prop="contact">
            <label slot="label">{{$t('form.email')}}</label>
            <el-input style="max-width: 400px;" v-model="form.contact"></el-input>
          </el-form-item>
          <el-form-item>
            <label slot="label">{{$t('auditor.avatarUrl')}} ({{$t('common.optional')}})</label>
            <el-input style="max-width: 400px;" v-model="form.avatar" ></el-input>
          </el-form-item>
          <el-form-item prop="bio">
            <label slot="label">{{$t('auditor.BIO')}} ({{$t('form.support')}} Markdown)</label>
            <el-input  v-model="form.bio" type="textarea" :rows="10" ></el-input>
          </el-form-item>
          <el-form-item prop="signDeclar">
            <el-checkbox style="margin-right:10px" size="medium" v-model="form.signDeclar"></el-checkbox>
            <span style="color:#606266">{{$t('auditor.signDeclaration')}}</span>
            <span style="cursor:pointer;margin-left: 5px" @click="showDeclar = true">{{$t('auditor.readDetail')}}</span>
          </el-form-item>
          <el-form-item>
            <div @click="register" style="max-width: 400px; margin-top:30px;display: block" class="button square-button">{{$t('common.register')}}</div>
          </el-form-item>
        </el-form>
      </div>
      <el-dialog
        :width="dialogWidth"
        :title="$t('auditor.declarationTitle')"
        :visible.sync="showDeclar"
      >
      <div v-if="$i18n.locale === 'en'">
        <p>
          I, the undersigned,<br>
          <br>
          accept to serve as Auditor, in accordance with the BOS Rules.<br>
          <br>
          I<b>DECLARE</b> to be and to intend to remain independent and impartial during the auditing procedure.<br>
          <br>
          I<b>DECLARE</b> that, to my knowledge, there are no facts, circumstances or relationships which may affect my independence and impartiality.<br>
          <br>
          I<b>DECLARE</b> to treat all BOS members fairly, reward contributions appropriately and not seek unmerited profits. No member should have less or more information about an auditing decision than others.<br>
          <br>
          I<b>DECLARE</b> not to seek any stake in, or exert undue influence over, other block producers and shall take appropriate measures to protect my own independence and impartiality. <br>
        </p>
      </div>
        <div v-if="$i18n.locale === 'cn'">
          <p>
            我，签名人<br>
            <br>
            根据BOS规则接受担任评审员这一职务。<br>
            <br>
            我<b>声明</b>在评审提案期间保持独立和公正。<br>
            <br>
            我<b>声明</b>不会出现影响我的独立和公正判断和评审的事实，情况或关系。<br>
            <br>
            我<b>声明</b>将公平对待所有BOS成员，给予有贡献提案相应的回报，而不是给予提案方不合理的利润回报。 对于评审员来说任何成员都应该和其他成员掌握相当水平的关于审计决策的信息，而不是更少或更多的。<br>
            <br>
            我<b>声明</b>不得向其他区块生产者寻求任何利益或对其施加不当影响，并应采取适当措施保护自己的独立性和公正性。<br>
          </p>
        </div>
        <span slot="footer">
          <el-button type="primary" @click="showDeclar=false;form.signDeclar=true">{{$t('common.agree')}}</el-button>
        </span>
      </el-dialog>
    </el-main>
    <el-aside v-if="false">
      <div class="card" style="margin-top:80px">
        <p>You have not been registered as a Member yet. Please sign the declaration to use the Member Client.</p>
        <router-link :to="{path: '/auditor/constitution'}">
          <div style="width:100%" class="button square-button">SIGN THE DECLARATION</div>
        </router-link>
      </div>
    </el-aside>
  </el-container>
</template>

<script>
import Eos from 'eosjs'
import { NETWORK, NODE_ENDPOINT } from '@/assets/constants.js'
import { setInterval, clearInterval } from 'timers'
export default {
  name: 'RegisterAuditor',
  data () {
    const validateDeclar = (rule, value, callback) => {
      if (value === false) {
        callback(new Error(this.$t('alert.auditor.notSignDec')))
      } else {
        callback()
      }
    }
    const checkCandName = (rule, value, cb) => {
      if (value === '') {
        return cb(new Error(this.$t('alert.auditor.candidateEmpty')))
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
        stakeAmount: '100000.0000 BOS',
        contact: '',
        avatar: '',
        bio: '',
        signDeclar: false,
        auditorName: ''
      },
      hasStaked: false,
      rules: {
        auditorName: [
          { validator: checkCandName, trigger: 'blur' }
        ],
        contact: [
          { required: true, message: this.$t('alert.auditor.contactEmpty'), trigger: 'blur' }
        ],
        bio: [
          { required: true, message: this.$t('alert.auditor.BIOEmpty'), trigger: 'blur' }
        ],
        signDeclar: [
          { validator: validateDeclar, trigger: 'blur' }
        ]
      },
      config: null,
      contract: 'auditor.bos',
      showDeclar: false
    }
  },
  computed: {
    dialogWidth () {
      if (this.$store.state.screenWidth < 450) {
        return '90%'
      }
      return '60%'
    },
    scatter () {
      return this.$store.state.scatter
    },
    eos () {
      if (this.scatter && this.scatter.identity) {
        const eosOptions = { expireInSeconds: 60 }
        const eos = this.scatter.eos(NETWORK, Eos, eosOptions)
        console.log(eos)
        return eos
      }
      return null
    }
  },
  mounted () {
    let interv = setInterval(() => {
      if (this.scatter && this.scatter.identity) {
        this.form.auditorName = this.scatter.identity.accounts.find(x => x.blockchain === 'eos').name
        clearInterval(interv)
      }
    }, 500)
    this.getConfig()
  },
  methods: {
    async stake () {
      const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
      try {
        await this.eos.transfer(account.name, this.contract, this.form.stakeAmount, '')
      } catch (e) {
        this.actionLoading = false
        this.$util.eosErrorAlert(e)
        console.log(e)
      }
    },
    getConfig () {
      const tableOptions = {
        'scope': 'auditor.bos',
        'code': 'auditor.bos',
        'table': 'config',
        'json': true
      }
      fetch(NODE_ENDPOINT + '/v1/chain/get_table_rows', {
        method: 'POST',
        body: JSON.stringify(tableOptions)
      }).then(res => res.json())
        .then((res) => {
          this.config = res.rows[0]
          this.form.stakeAmount = this.config.lockupasset
        }).catch(e => {
          console.log(e)
        })
    },
    async register () {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.actionLoading = true
          if (this.hasStaked === false) {
            await this.stake()
          }
          if (this.actionLoading === false) {
            return
          }
          const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos')
          const transactionOptions = {
            actions: [
              {
                account: this.contract,
                name: 'nominatecand',
                authorization: [{
                  actor: account.name,
                  permission: account.authority
                }],
                data: {
                  cand: this.form.auditorName
                }
              },
              {
                account: this.contract,
                name: 'updatebio',
                authorization: [{
                  actor: account.name,
                  permission: account.authority
                }],
                data: {
                  cand: this.form.auditorName,
                  bio: JSON.stringify({
                    avatar: this.form.avatar,
                    bio: this.form.bio,
                    contact: this.form.contact
                  })
                }
              }]
          }
          this.eos.transaction(transactionOptions, { blocksBehind: 3, expireSeconds: 30 })
            .then(res => {
              this.actionLoading = false
              this.$util.alert(this.$t('alert.success'), this.$t('alert.auditor.registerSuccessful'))
              this.$router.replace('/auditor')
            }).catch(e => {
              this.actionLoading = false
              this.$util.eosErrorAlert(e)
              console.log(e)
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.register-auditor
  text-align left
  color: #507DFE
</style>
