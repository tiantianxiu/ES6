<template>
  <div class="relay-list">
    {{pageIndexFa}}
    <div class="section-body">

      <div class="article" v-for="item in post_list">
        <div class="author-info">
          <div class="author">
            <img :src="item.author_avatar || item.avatar"/>
          </div>
          <div class="author-name">
            <span>{{item.author}}</span>
            <em class="tag-item tag-red" v-if="item.authorid == id">楼主</em>
            <div class="icon1"
                 v-if="item.level=='自媒体' || item.level=='新能源砖家' || item.is_carvip == 1 || item.is_auth_car_icon == 1 || is_ident_icon ==1">
              <img class="icon-width icon-width-l"
                   src="http://cdn.e-power.vip/resources/image/icon-v2.png"/>
            </div>
            <em class="tag-item tag-green" v-if="item.level != ''">{{item.level}}</em>
          </div>
          <div class="tag-item-wrap">
            <em class="tag-item tag-green" v-if="item.is_carvip == 1">
              <img class="icon-v" src="http://cdn.e-power.vip/resources/image/icon-v.png"/>车代表
            </em>
            <em class="tag-item tag-green" v-if="item.is_auth_car">{{item.is_auth_car}}</em>
            <div class="e-power">
              <img src="http://cdn.e-power.vip/resources/image/e_power.png"/>
              <span class="text-green">{{item.extcredits2}}</span>
              <i>度</i>
            </div>
          </div>
          <!--<div class="ext">{{item.position}}楼</div>-->
        </div>

        <div class="reply_message" v-if="item.reply_author"
             v-html="'<span >回复' + item.reply_author +'：</span>' + item.message">
        </div>
        <div class="reply_message" v-else v-html="item.message">
        </div>
        <div class="article-ext-info">
          <span>{{item.time}}</span>
          <a @click="popover()" class="item more-function">
            <div class="itemFunction">
              <img class="icon-width" src="http://cdn.e-power.vip/resources/image/icon-text.png"/>
            </div>
            <div :class="{itemFunction: true}">
              <div class="ext-no">{{item.zan}}</div>
              <img class="ib-width" src="http://cdn.e-power.vip/resources/image/icon-zan.png"/>
            </div>
            <div :class="{itemFunction: true}">
              <div class="ext-no">{{item.cai}}</div>
              <img class="ib-width" src="http://cdn.e-power.vip/resources/image/icon-cai.png"/>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import {transformPHPTime} from '../assets/js/util'

  export default {
    name: 'reply-list',
    props: {
      page_index_fa: Number,
    },
    data() {
      return {
        id: 1,
        page_size: 5,
        page_index: 0,
        total_num: 0,
        post_list: [],
        page_index_fa: 0,
        url: 'get_post_detail_comment.php'
      }
    },
    computed: {
      pageIndexFa() {
        const that = this
        console.log(that.page_index_fa)
        that.page_index = that.page_index_fa

        if (that.page_index_fa > 0)
          that.getReplyList()
      }
    },
    methods: {

      getReplyList: function () {
        const that = this
        that.$store.dispatch({
          type: 'getReplyList',
          url: that.url,
          tid: that.id,
          page_size: that.page_size,
          page_index: that.page_index
        }).then((res) => {
          let res_post_list = that.hidden == 3 ? res.data.post : res.data.post_list
//                    that.total_num = res.data.total_num
          for (let i in res_post_list) {
            res_post_list[i].time = transformPHPTime(res_post_list[i].dateline)
          }
          let post_list = that.post_list
          that.post_list = post_list.length == 0 ? res_post_list : post_list.concat(res.data.post_list)

          let havMore = res_post_list.length < that.page_size ? 1 : 0
          that.$emit('hav-more', havMore)
        })
      },
      popover: function () {
        this.$emit("pop-over", true)
      }

    },
    created(option) {
      const that = this
      let id = that.$route.params.id
      let hidden = that.$route.params.hidden || 0
      if (hidden == 3) {
        console.log(hidden)
        that.url = 'get_square_detail_comment.php'
      }
      that.hidden = hidden
      that.id = id
      that.getReplyList()
    }
  }
</script>

<style lang="scss">
  .reply_message {
    span {
      color: #cecfd3
    }
  }

  .relay-list {
    background-color: white;

    .article-ext-info {
      display: flex;
      color: #898989;
      font-size: 12px;
      margin-top: 10px;
      span {
        width: 100px;
        text-align: left;
        line-height: 26px;
      }
      .more-function {
        display: flex;
        align-items: center;
        .itemFunction {
          display: flex;
          align-items: center;
          width: 50px;
          position: relative;

          .ext-no {
            position: absolute;
            top: 20%;
            left: 50%;
            color: #bfbfbf;
            transform: scale(0.9);
            line-height: 100%;
          }
        }
      }
    }

  }

</style>
