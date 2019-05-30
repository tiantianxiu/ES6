<template>
    <div class="post-detail">
        <div class="section-body">
            <div class="article section-wrap section-detail-wrap">
                <div class="author-info">
                    <div class="author">
                        <img :src="thread_data.author_avatar || thread_data.avatar"/>
                    </div>

                    <div class="author-name">

                        <span>{{thread_data.author}}</span>
                        <div class="icon1"
                             v-if="thread_data.level=='自媒体' || thread_data.level=='新能源砖家' || thread_data.is_carvip == 1 || thread_data.is_auth_car_icon == 1 || is_ident_icon ==1">
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
                        {{thread_data.time}}
                    </div>
                </div>

                <div class="article-content-title box-wrap">
                    <div class="item">{{thread_data.subject}}</div>
                </div>
                <!-- 投票 -->
                <div class="poll" v-if="poll">
                    <div class="title">投票: ( 最多可选 {{poll.maxchoices}} 项 ), 共有 {{poll.voters}} 人参与投票</div>

                    <div class="is-vote" v-for="item in polloption">
                        <div class="text">{{item.polloption}}</div>
                        <div class="progress">
                            <div class="progress_em">
                                <p :style="{'width': item.vote_rate}"></p>
                            </div>
                            <p>{{item.votes}}票 {{item.vote_rate}}</p>
                        </div>
                    </div>

                    <div class="poll-btn" @click="popover()">投票</div>
                </div>

                <div class="article-text article-detail-text" v-html="message" @click="tokenDetail">
                </div>
                <div class="textbox-wrap" v-if="thread_data.video">
                    <div class="width-atuo tb-img">
                        <video class="width-atuo" :poster="thread_data.image_list[0]" controls="">
                            <source :src="thread_data.video" type="video/mp4">
                        </video>
                    </div>
                </div>
                <div class="textbox-wrap" v-if="image_list_length > 0 && !thread_data.video">
                    <div class="width-atuo tb-img">
                        <img lazy-load="" @click="imagePreviews({index:index})" class="width-atuo" v-for="(image, index) in thread_data.image_list"
                             :src="image" ></div>
                </div>
            </div>
        </div>

        <div class="section-title">
          <span>
            全部回复（{{thread_data.replies || page_indexs}}）
          </span>
        </div>
    </div>
</template>

<script>
    import wxapi from '../store/modules/wxapi'
    import { transformPHPTime } from '../assets/js/util'
    const Lazyload = vant.Lazyload
    const ImagePreview = vant.ImagePreview

    Vue.use(Lazyload)
    export default {
        name: 'post-detail',
        components: {wxapi},
        data() {
            return {
                tid: 10681,
                thread_data: [],
                message: '',
                url: 'get_post_detail.php',
                image_list_length: 0
            }
        },

        methods: {

            getPostDetail: function () {
                const that = this
                that.$store.dispatch({
                    type: 'getPostDetail',
                    tid: that.id,
                    url: that.url
                }).then((res) => {
                        if (res.data.status == -1) {
                            that.$emit('statusNeg')
                            return
                        }
                        that.$store.dispatch({
                            type: 'toast',
                            hideToast: true
                        })
                        let thread_data = that.hidden == 3 ? res.data.thread : res.data.thread_data
                        let message = thread_data.message
                        if (message) {
                            that.message = message.replace('<br />', '')
                            that.getImgs(message)
                        }
                        if(thread_data.image_list && thread_data.image_list.length > 0) {
                            that.image_list_length = thread_data.image_list.length

                        }
                        thread_data.time = transformPHPTime(thread_data.dateline)
                        that.thread_data = thread_data
                        that.subject = thread_data.subject
                        wxapi.wxRegister(that.wxRegCallback)

                        if (res.data.poll) {
                            let expiration = res.data.poll.expiration,
                                timestamp = Date.parse(new Date()) / 1000,
                                //当前时间
                                remainder = 1
                            if (expiration != 0)
                                remainder = parseInt(expiration) - timestamp //是否为负数
                            res.data.poll.remainder = remainder
                            that.poll = res.data.poll
                        }
                        if (res.data.polloption) {
                            for (let i = 0; i < res.data.polloption.length; i++) {
                                let vote_rate = res.data.polloption[i].vote_rate,
                                    vote_rate_str = vote_rate.replace("%", "")
//                                vote_rate_str = vote_rate_str.split('.')[0] + '%'
//                                console.log(vote_rate)
                                res.data.polloption[i].vote_rate_str = vote_rate_str
                            }
                            that.polloption = res.data.polloption,
                                that.optionids = []
                        }

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
                    title: this.subject, // 分享标题
                    link: '',      // 分享链接
                    imgUrl: 'http://cdn.e-power.vip/share_friends_logo.jpg',// 分享图标

                }
                // 将配置注入通用方法
                wxapi.ShareData(opstion)
            },
            getImgs: function (message) {
                const that = this
                let rep1 = new RegExp("<img( ||.*?)src=('|\"|)(.*?)('|\"|>| )", "gim") //定义正则模式
                let str2 = message.match(rep1)
                let imgs = []
                if (!str2 || str2.length == 0)
                    return

                for (let i = 0; i < str2.length; i++) { //循环
                    rep1.exec(message) //刷新regexp.$3
                    imgs.push((RegExp.$3)) //给值，起加速作用
                }
                that.imgs = imgs
            },
            tokenDetail: function (e) {
                const that = this
                if (e.target.nodeName === 'IMG') {
                    // 获取触发事件对象的属性
                    const imgs = that.imgs
                    let src = e.target.getAttribute('src'),
                        index = 1
                    for (let i in imgs) {

                        if (src == imgs[i]) {
                            index = parseInt(i)
                            continue
                        }
                    }

                    ImagePreview({
                        images: [
                            ...imgs
                        ],
                        startPosition: index,
                        lazyLoad: true
                    })
                }
            },
            imagePreviews(e){
                const that = this
                let index = e.index
                let imgs = that.thread_data.image_list
                ImagePreview({
                    images: [
                        ...imgs
                    ],
                    startPosition: index,
                    lazyLoad: true
                })
            },
        },
        created(options) {
            const that = this
            let id = that.$route.params.id
            let hidden = that.$route.params.hidden || 0
            if (hidden == 3) {
                console.log(hidden)
                that.url = 'get_square_detail.php'
            }
            that.hidden = hidden
            that.id = id
            that.getPostDetail()
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
