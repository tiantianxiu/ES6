<template>
    <div>
        <div v-if="showcalendar">

            <div v-if="status_neg">
                <none-data :message="message"></none-data>
            </div>
            <div v-else>
                <logo></logo>
                <qr-code ref="child"></qr-code>
                <div class="detail-view has-header">
                    <div>
                        <van-list
                                v-model="loading"
                                :finished="finished"
                                :offset="50"
                                @load="onLoad"
                                finished-text="没有更多了"
                                :error.sync="error"
                                error-text="请求失败，点击重新加载"
                                :immediate-check="check"
                        >

                            <quest-detail @hide-toast="toast" v-on:statusNeg="statusNeg"
                                          @pop-over="popover"></quest-detail>
                            <quest-re-list :page_index_fa="page_index_fa" @hav-more="havMores"
                                           @pop-over="popover"></quest-re-list>
                        </van-list>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import questDetail from '../components/questDetail'
    import questReList from '../components/questReList'
    import qrCode from '../components/qrCode'
    import logo from '../components/Logo'
    import noneData from '../components/noneData'


    export default {
        name: 'questView',
        components: {questDetail, questReList, qrCode, logo, noneData},
        data() {
            return {
                showcalendar: false,
                nickname: '',
                loading: false,   //是否处于加载状态
                finished: false,  //是否已加载完所有数据
                isLoading: false,   //是否处于下拉刷新状态
                check: false,       //是否在初始化时立即执行滚动位置检查
                page_index_fa: 0,
                havMore: 1,
                status_neg: false,
                message: "该问答 不存在"
            }
        },
        computed: {},
        methods: {
            onLoad() {      //上拉加载
                const that = this
                that.page_index_fa += 1
            },
            havMores: function (havMore) {
                const that = this
                that.loading = false
                if (havMore)
                    that.finished = true
            },
            toast: function () {
                const that = this
                that.$store.dispatch({
                    type: 'toast'
                })
            },
            popover: function (e) {
                const that = this
                that.$refs.child.popover()
            },
            statusNeg: function () {
                const that = this
                that.status_neg = true
            }
        },
        created(options) {
            const that = this

            setTimeout(() => {
                that.toast()
                that.showcalendar = true
            }, 0)
        }

    }
</script>

<style lang="scss" scoped>
    .home-view {
        background: #F4F4F4;
    }

    .scroll-list-wrap {
        height: 100%;
    }
</style>