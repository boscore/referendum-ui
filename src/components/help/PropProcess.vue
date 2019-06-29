<template>
  <div>
    <h1 class="title">{{$t('help.propProcess')}}</h1>
    <div class="card">
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
      <img style="width:100%" src="@/assets/proposal_flow.png" />
    </div>
  </div>
</template>

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
</style>
