<template>
  <div>
    <h1 class="title">{{$t('help.howToVote')}}</h1>
    <div class="card tutorial">
      <p>1. {{$t('help.vote.step1')}}</p>
      <el-image style="width:100%" :lazy="true" :src="images.Tutorial1" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
      <p>2.{{$t('help.vote.step2')}}</p>
      <el-image style="width:100%" :lazy="true" :src="images.Tutorial2" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
      <p>3. {{$t('help.vote.step3')}}</p>
      <el-image style="width:100%" :lazy="true" :src="images.Tutorial3" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
      <p>4. {{$t('help.vote.step4')}} </p>
      <el-image style="width:100%" :lazy="true" :src="images.Tutorial4" >
         <div slot="placeholder" class="image-slot">
          {{$t('common.loading')}}<span class="dot">...</span>
        </div>
      </el-image>
    </div>
  </div>
</template>

<script>
import Tutorial1 from '@/assets/images/tutorial-1.png'
import Tutorial2 from '@/assets/images/tutorial-2.png'
import Tutorial3 from '@/assets/images/tutorial-3.png'
import Tutorial4 from '@/assets/images/tutorial-4.png'

export default {
  data () {
    return {
      images: {
        Tutorial1,
        Tutorial2,
        Tutorial3,
        Tutorial4
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
.tutorial
  text-align left
  img
    display block
    width 80%
    margin auto
.image-slot
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  min-height: 200px;
  background: #f5f7fa;
  color: #909399;
</style>
