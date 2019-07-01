<template>
  <div>
    <h1 class="title">{{$t('help.propProcess')}}</h1>
    <div class="card" v-if="$i18n.locale === 'en'">
      <h2>Fund payment process points</h2>
      <ul id="fund-process">
        <li>
          The community chooses suitable proposals for fund support by referendum.
        </li>
        <li>
          The amount of a single proposal incentives cannot exceed 1 Million BOS. Generally, after the deadline expires, the proposal incentives are automatically paid.
        </li>
        <li>
          10 days before the deadline, if the BOS Executive Team believes that the task has not been effectively executed, it has the right to temporarily freeze the payment of funds and submit the payment proposal to BP vote. BOSCore Executive Team checkpoints:
          <ul style="list-style-type:lower-alpha">
            <li>
              Testcase coverage, whether the test passed?
            </li>
            <li>
              Whether the coding quality is up to standard?
            </li>
            <li>
              Whether the specified functions in the proposal are fully implemented?
            </li>
            <li>
              Is there a security bug?
            </li>
          </ul>
        </li>
        <li>
          If the fund payment is frozen, the BOS independent auditor needs to publish the review within 7 days, make independent judgment in the contract, and issue a link to the relevant investigation report.
        </li>
        <li>
          Within two weeks after the auditor’s comments, BP needs to make a decision. If more than 2/3+1 active BPs agree to continue to pay the incentives, it will continue to pay 90% of the incentives; Otherwise the payment will be rejected.
        </li>
        <li>
          The 10% of the incentives for the proposal are equally divided between the auditors who agree with the majority of the BPs and the BPs who voted.
        </li>
      </ul>
      <el-image style="width:100%" :lazy="true" :src="images.ProposalFlow" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
    </div>
    <div class="card" v-if="$i18n.locale === 'cn'">
      <h2>⽅案流程要点</h2>
      <ul id="fund-process">
        <li>
          社区以公投⽅式选出合适的提案来进⾏基⾦⽀持。
        </li>
        <li>
          单笔提案激励额度不得⼤于100万BOS；正常情况下截⽌时间到期后，提案奖⾦⾃动⽀付。
        </li>
        <li>
          最晚交付⽇前10天，若BOSCore Executive Team认为该任务未被有效执⾏，则有权暂时冻结资⾦⽀付，并将该⽀付的议案提交⾄节点表决。BOSCore Executive Team 检查点：
          <ul style="list-style-type:lower-alpha">
            <li>
              Testcase覆盖程度，测试是否通过。
            </li>
            <li>
              编码质量是否达标。
            </li>
            <li>
              提案规定的功能是否实现。
            </li>
            <li>
              是否存在安全漏洞。
            </li>
          </ul>
        </li>
        <li>
          若资⾦⽀付被冻结，BOS独⽴评审员需要在7天内发表审查意⻅，并在合约中做出独⽴判断，并发布判断的相关调查报告的链接。
        </li>
        <li>
          评审员发布意⻅以后2周内，BP可以参考评审员的决定，若超过2/3加1的出块节点同意继续⽀付提案激励，则继续⽀付90%的提案激励，反之则否决⽀付。
        </li>
        <li>
          提案激励的10% 平分给和多数节点做出⼀致结论的评审员 和 参与表决的BP。
        </li>
      </ul>
      <el-image style="width:100%" :lazy="true" :src="images.ProposalFlow" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
    </div>
  </div>
</template>

<script>
import ProposalFlow from '@/assets/proposal_flow.png'
export default {
  data () {
    return {
      images: {
        ProposalFlow
      }
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
  margin-top 22px
  margin-bottom 22px
  text-align left
#fund-process
  list-style-type:decimal;
  text-align:left
  li
    margin-top: 20px;
    margin-bottom: 20px;
.image-slot
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  min-height: 200px;
  background: #f5f7fa;
  color: #909399;
</style>
