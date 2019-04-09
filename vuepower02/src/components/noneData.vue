<template>
  <div class="none-data">
    <!--打开弹出菜单-->
    <!--</a>-->
    <div class="none-data-msg">
      {{message}}
    </div>

  </div>
</template>

<script>
  export default {
    name: 'none-data',
    props: {
      message: String,
      required: true
    },
    data() {
      return {
        // message: '没有更多数据'
      }
    },
    methods: {

    },
    created() {
      const that = this

    }
  }
</script>

<style lang="scss">
  .none-data-msg{
    padding: 200px 0;
    font-size: 18px;
    text-align: center;
    color: #666;
  }
</style>
