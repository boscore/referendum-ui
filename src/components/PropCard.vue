<template>
  <div class="prop-card">
    <div class="card-top" :class="cardTopClass">
      <div class="card-top-bar">
        <div v-if="percent > 0" class="card-top-tag card-top-tag-left clear-float">
          <span>{{satisfiedWord}}</span>
        </div>
        <div class="card-top-tag clear-float" :class="cardTagClass">
          {{type.search('referendum') !== -1 ? $t('common.referendum') : $t('common.poll')}}
        </div>
      </div>
      <p>{{title}}</p>
    </div>
    <div class="card-bottom">
      <p class="desc">{{propDesc}}</p>
      <hr/>
      <div class="card-bottom-board">
        <div v-loading="pollAtLoading" class="card-bottom-board-left" :class="cardBoardClass">
          <p :style="{'font-family': 'Roboto-Bold','font-size': '13px','line-height': '15px','margin-bottom':'4px'}">POLL AT</p>
          <p :style="{'font-family': 'AvenirNextCondensed-Bold','font-size': '20px','line-height':'27px'}">{{pollAt}}%</p>
        </div>
        <div class="card-bottom-board-right">
          <el-progress :stroke-width="10" class="pass-percent" :percentage="agreePercent"></el-progress>
          <el-progress  :stroke-width="10" class="dissent-percent" :percentage="rejectPercent"></el-progress>
          <p>{{$util.toThousands((staked / 10000).toFixed(0))}} BOS {{$t('common.voted').toLocaleLowerCase()}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropCard',
  props: {
    type: {
      type: String,
      default: 'referendum'
    },
    title: {
      type: String,
      default: 'Title'
    },
    desc: {
      type: String,
      default: 'proposal content'
    },
    votes: {
      type: [Object],
      default () {
        return {
          '0': 0,
          '1': 0,
          'accounts': 0,
          'proxies': 0,
          'total': 0
        }
      }
    },
    staked: {
      type: [Number, String],
      default: 0
    },
    expired: {
      type: Boolean,
      default: false
    },
    percent: {
      type: [String, Number],
      default: 0
    }
  },
  data () {
    return {
    }
  },
  computed: {
    cardTopClass () {
      if (this.expired) {
        return {
          'card-top-expired': true
        }
      } else {
        return {
          'card-top-referendum': this.type.search('referendum') !== -1,
          'card-top-poll': this.type.search('referendum') === -1
        }
      }
    },
    cardTagClass () {
      return {
        'card-top-tag-referendum': this.type.search('referendum') !== -1,
        'card-top-tag-poll': this.type.search('referendum') === -1
      }
    },
    cardBoardClass () {
      return {
        'card-bottom-board-referendum': this.type.search('referendum') !== -1,
        'card-bottom-board-poll': this.type.search('referendum') === -1
      }
    },
    agreePercent () {
      if (this.votes.total === 0 || !this.votes[1]) {
        return 0
      } else {
        return Number((100 * this.votes[1] / this.votes.total).toFixed(1))
      }
    },
    rejectPercent () {
      if (this.votes.total === 0 || !this.votes[0]) {
        return 0
      } else {
        return Number((100 * this.votes[0] / this.votes.total).toFixed(1))
      }
    },
    pollAt () {
      if (this.$store.state.summaries.bp_votes !== undefined) {
        return (this.staked / this.$store.state.summaries.bp_votes * 100).toFixed(2)
      } else {
        return '0.00'
      }
    },
    pollAtLoading () {
      if (this.$store.state.summaries.bp_votes === undefined) {
        return true
      } else {
        return false
      }
    },
    propDesc () {
      return this.desc.replace(/#/g, '')
    },
    satisfiedWord () {
      let word = ''
      if (this.percent > 1) {
        word = this.$t('common.daysSatisfied', [this.percent])
      } else {
        word = this.$t('common.daySatisfied', [this.percent])
      }
      return word
    }
  }
}
</script>

<style lang="stylus">
.card-bottom-board-right
  .el-progress-bar
    padding-right 60px
    margin-right -65px
  .pass-percent
    .el-progress__text
      font-family Roboto-Bold
      font-size 11px
      color #30D094
      letter-spacing 0
      text-align center
    .el-progress-bar__inner
      background-image linear-gradient(270deg, #41B976 0%, #2CD69B 100%)
    .el-progress-bar__outer
      background-color rgba(65,185,118, 0.2)
  .dissent-percent
    .el-progress__text
      font-family Roboto-Bold
      font-size 11px
      color #F46666
      letter-spacing 0
      text-align center
    .el-progress-bar__inner
      background-image linear-gradient(269deg, #F06262 0%, #FF7171 100%)
    .el-progress-bar__outer
      background-color rgba(240,98,98, 0.2)
</style>

<style lang="stylus" scoped>
.prop-card
  box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
  border-radius 12.25px 12.25px 12.25px 12.25px
  height 284px
  min-width 280px
  width 100%
  cursor pointer
p
  margin 0
.card-top
  position relative
  height 104px
  min-width 280px
  width 100%
  border-radius 12.25px 12.25px 0px 0px
  p
    width 90%
    height 60px
    margin 9px 5%
    font-family Roboto-Medium
    font-size 17px
    color #FFFFFF
    letter-spacing 0
    white-space normal
    word-wrap break-word
    text-overflow ellipsis
    text-align left
    overflow hidden
    display -webkit-box !important
    -webkit-box-orient vertical
    -webkit-line-clamp: 3
  .card-top-bar
    width 100%
    height 22px
    .card-top-tag
      height 100%
      width auto
      padding 0 10px
      float right
      text-align center
      // position absolute
      // right 0px
      border-radius 0 12.25px 0 12.25px
      font-family PingFangSC-Semibold
      font-size 12px
      color #FFFFFF
      letter-spacing 0
    .card-top-tag-left
      width auto
      float left
      border-radius 12.25px 0 12.25px 0
      background-image linear-gradient(-137deg, #27AAF3 0%, #15DDCC 100%)
      position relative
      // .card-top-progress-bar
      //   position absolute
      //   border-radius 12.25px 0 12.25px 0
      //   background-color #F06262
      //   line-height 20px
      //   height 100%
      //   white-space nowrap
      //   span
      //     position absolute
    .card-top-tag-referendum
      background-image linear-gradient(-137deg, #27AAF3 0%, #15DDCC 100%)
    .card-top-tag-poll
      background-image: linear-gradient(-137deg, #F07814 0%, #FCB557 100%);
.card-top-expired
  background-image linear-gradient(-179deg, #85929E 0%, #ABB2B9 100%)
.card-top-referendum
  background-image linear-gradient(-179deg, #317EE3 0%, #59A9EC 100%)
.card-top-poll
  background-image linear-gradient(1deg, #FFB673 0%, #F97451 100%)
.card-bottom
  min-width 280px
  width 100%
  height 180px
  background #E6F1FF
  border-radius 0px 0px 12.25px 12.25px
  box-sizing border-box
  position relative
  padding-top 14px
  padding-right 5%
  padding-left 5%
  hr
    opacity 0.22
    background #004496
  .desc
    height 83px
    width 100%
    font-family Roboto-Regular
    font-size 14px
    color #004496
    letter-spacing 0
    white-space normal
    word-wrap break-word
    text-overflow ellipsis
    text-align left
    overflow hidden
    display -webkit-box !important
    -webkit-box-orient vertical
    -webkit-line-clamp: 5
  .card-bottom-board
    position absolute
    bottom 0
    width 90%
    display flex
    align-items flex-end
    justify-content space-between
  .card-bottom-board-referendum
    background-image linear-gradient(137deg, #0570EC 0%, #53A0FD 47%, #67FFAF 100%)
  .card-bottom-board-poll
    background-image: linear-gradient(0deg, #FFB673 0%, #F97451 100%);
  .card-bottom-board-left
    padding 7px 6px
    box-sizing border-box
    height 60px
    width 70px
    border-radius 6px 6px 0 0
    p
      color #FFFFFF
      letter-spacing 0
      text-align center
  .card-bottom-board-right
    width calc(100% - 100px)
    text-align left
    margin-bottom 5px
    p
      font-family Roboto-Regular
      font-size 12px
      color #3A80D4
      letter-spacing 0
      margin-top 5px

</style>
