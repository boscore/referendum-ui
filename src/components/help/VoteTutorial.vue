<template>
  <div>
    <h1 class="title">{{$t('help.propProcess')}}</h1>
    <div class="card tutorial">
      <p>1. Set Scatter networks</p>
      <img src="@/assets/images/tutorial-1.png"/>
      <p>2. Add your key</p>
      <img src="@/assets/images/tutorial-2.png"/>
      <p>3. Then link your account</p>
      <img src="@/assets/images/tutorial-3.png"/>
      <p>4. Login and send your vote to a proposal </p>
      <img src="@/assets/images/tutorial-4.png"/>
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
.tutorial
  text-align left
  img
    display block
    width 80%
    margin auto
</style>
