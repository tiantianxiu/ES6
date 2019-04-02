<template>
  <div class="qr-code">
    <!--打开弹出菜单-->
    <!--</a>-->

    <van-popup v-model="show">
      <div v-if="png">
        <img v-gallery :src="png" alt="">
      </div>
      <div class="loading-icon" v-if="!png">
        <van-loading color="#999" size="50px" />
      </div>
      <p>长按识别小程序码，发表评论</p>
    </van-popup>

    <div class="to-post" @click="popover()">
      <img src="http://cdn.e-power.vip/resources/image/detail/toreply2.png" alt="aa">
    </div>

  </div>
</template>

<script>

  export default {
    name: 'qr-code',
    data() {
      return {
        show: false
      }
    },
    computed: {
      png: function () {
        const that = this
        return that.$store.state.detail.png
      },

    },
    methods: {
      popover: function () {
        const that = this
        that.show = !that.show

      }
    },
    created() {
      const that = this

    }
  }
</script>

<style lang="scss">
  .qr-code {
    position: fixed;
    z-index: 999;
    width: 100%;
  }

  .to-post {
    width: 64px;
    bottom: 12%;
    right: 22px;
    position: fixed;
    z-index: 1;
  }

  .van-popup {
    padding: 16px;
    border-radius: 5px;
    width: 60%;
    text-align: center;
    p {
      font-size: 12px;
      text-align: center;
    }
  }

  img {
    max-width: 100%;
  }
  .loading-icon{
    display: inline-block;
    padding: 30px 0;
  }
</style>
