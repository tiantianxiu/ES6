<template>
    <div class="post-detail">
        <div class="section-body">
            <div class="article section-wrap section-detail-wrap">
                <div class="author-info">
                    <div class="author">
                        <img :src="thread_data.author_avatar"/>
                    </div>

                    <div class="author-name">

                        <span>{{thread_data.author}}</span>
                        <div class="icon1"
                             v-if="thread_data.level=='自媒体' || thread_data.level=='新能源砖家' || thread_data.is_carvip == 1 || thread_data.is_auth_car_icon == 1">
                            <img class="icon-width icon-width-l"
                                 src="http://cdn.e-power.vip/resources/image/icon-v2.png"/>
                        </div>
                        <em class="tag-item tag-green" v-if="thread_data.level != ''">{{thread_data.level}}</em>
                    </div>
                    <div class="tag-item-wrap">
                        <em class="tag-item tag-green" v-if="thread_data.is_carvip == 1">
                            <img class="icon-v" src="http://cdn.e-power.vip/resources/image/icon-v.png"/>车代表
                        </em>
                        <em class="tag-item tag-green" v-if="thread_data.is_auth_car">{{thread_data.is_auth_car}}</em>
                        <div class="e-power">
                            <img src="http://cdn.e-power.vip/resources/image/e_power.png"/>
                            <span class="text-green">{{thread_data.extcredits2}}</span>
                            <i>度</i>
                        </div>
                    </div>
                    <div class="ext">
                        <span>浏览：{{thread_data.views}}</span>
                        {{thread_data.create_time}}
                    </div>
                </div>

                <div class="article-content-title box-wrap">
                    <div class="item">{{thread_data.subject}}</div>
                </div>

                <div class="article-text article-detail-text" v-html="message" @click="tokenDetail">
                </div>
                <div class="images" v-if="thread_data.image_list.length > 0">
                    <div class="li" v-for="images in thread_data.image_list"
                         :style="{backgroundImage: 'url(' + images + ')'}" @click="wxParseImgTap('{{$index}}')">
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
    import wxapi from '../store/modules/wxapi'
    const Lazyload = vant.Lazyload
    const ImagePreview = vant.ImagePreview

    Vue.use(Lazyload)
    export default {
        name: 'quest-detail',
        components: {wxapi},

        data() {
            return {
                tid: 1,
                thread_data: [],
                message: ''
            }
        },

        methods: {

            getQuestDetail: function () {
                const that = this
                that.$store.dispatch({
                    type: 'getQuestDetail',
                    tid: that.id
                }).then((res) => {
                        if (res.data.status == -1) {
                            that.$emit('statusNeg')
                            return
                        }
                        that.$store.dispatch({
                            type: 'toast',
                            hideToast: true
                        })

                        let message = res.data.thread_data.message
                        that.message = message.replace('<br />', '')
                        that.thread_data = res.data.thread_data
                        that.subject = res.data.thread_data.subject
                        wxapi.wxRegister(that.wxRegCallback)


                    }
                )
            },
            wxRegCallback() {
                this.ShareData()
            },
            popover: function () {
                this.$emit("pop-over", true)
            },
            ShareData() {
                let opstion = {
                    title: '问答：' + this.subject, // 分享标题
                    link: '',      // 分享链接
                    imgUrl: 'http://cdn.e-power.vip/share_friends_logo.jpg',// 分享图标

                }
                // 将配置注入通用方法
                wxapi.ShareData(opstion)
            },

            wxParseImgTap: function (e) {
                const idx = e
                ImagePreview({
                    images: [
                        ...imgs
                    ],
                    startPosition: idx,
                    lazyLoad: true
                })
            }
        },

        created(options) {
            const that = this
            let id = this.$route.params.id
            that.id = id
            that.getQuestDetail()
        }
    }
</script>

<style lang="scss">
    .ext {
        span {
            margin: 0 10px;
        }
    }

    .detail-header {
        height: 50px;
        width: 100%;
        background: #00c481 url(http://cdn.e-power.vip/resources/image/e_logo.png) 6% 80% no-repeat;
        background-size: auto 66%;
    }

    .article-content-title {
        font-size: 18px;
        color: #3d3d3d;
        font-weight: bold;
        font-family: Optima-Regular, PingFangTC-light;
        margin: 15px 0;
    }

    .section-detail-wrap {
        .article-text {
            font-size: 14px;
            font-family: Optima-Regular, PingFangTC-light;
            letter-spacing: 1px;
            margin: 0 4px;
            font-size: 17px;
            > div {
                text-align: left !important;
                text-indent: 2em;
            }
            .textbox-wrap {
                text-indent: 0;
            }
            .smile_img {
                width: 20px;
                height: 20px;
                display: inline-block;
                vertical-align: middle;
                margin: 0 4px;
                border-radius: 0;
                box-shadow: none;
            }
            .emoji_img {
                width: 100px;
                height: 100px;
                display: inline-block;
                vertical-align: middle;
                margin: 0 5px;
                border-radius: 0;
                box-shadow: none;
            }
            .tb-text {
                padding: 8px 15px;
                background-color: #333;
                color: #fafafa;
            }
            .textbox-wrap {
                border-radius: 4px;
                margin: 8px 0;
                overflow: hidden;
                .tb-text {
                    padding: 8px 15px;
                    background-color: #333;
                    color: #fafafa;
                    margin-top: -4px;
                }
            }

        }
        .rich-text {
            line-height: 1.8;
            font-family: Optima-Regular, PingFangTC-light;
            font-size: 26px;
        }
    }

    .section-detail-wrap .rich-text {
        line-height: 1.8;
        font-family: Optima-Regular, PingFangTC-light;
        font-size: 26px;
    }

    .article-detail-text .WxEmojiView {
        line-height: 1.8;
        display: block;
        margin: 30px 0;
    }

    /* 投票 */
    .progress_em {
        width: 80%;
        background-color: #eee;
        height: 4px;
        vertical-align: middle;
        margin: auto 4px auto 0;
        p {
            background-color: #00c481;
            height: 4px;
        }
    }

    .poll {
        border: 1px solid #e0e0e0;
        background: #fff;
        border-radius: 4px;
    }

    .poll .title {
        font-size: 16px;
        margin: 0 5px;
        padding: 3px 0 5px;
    }

    .polloption {
        border-bottom: 1px solid #e0e0e0;
        margin: 0 5px;
        padding: 14px 0 11px;
    }

    .polloption .check-box {
        width: 12px;
        height: 12px;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 1px;
        vertical-align: middle;
        line-height: 0;
        margin-right: 8px;
    }

    .polloption text {
        font-size: 14px;
        letter-spacing: 1px
    }

    .polloption.polloption-radio .check-box {
        border-radius: 50%;
    }

    .radioed {
        width: 56%;
        height: 56%;
        margin: 23%;
        box-sizing: border-box;
        border-radius: 100%;
        background: #00c481
    }

    .poll-btn {
        background: #a0e7cc;
        color: #00c481;
        text-align: center;
        padding: 7px 0;
    }

    .poll-btn.disabled {
        color: #707070
    }

    .is-vote {
        margin: 7px 4px 15px;
    }

    .is-vote .progress {
        display: flex;
        vertical-align: middle;
    }

    .is-vote .progress p {
        font-size: 11px;
        width: 24%;
        text-align: right;
        color: #bfbfbf
    }


</style>
