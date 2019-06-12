var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'

Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    nomore_data: false,
    page_size: 4,
    page_index: 0,
    threadclass: [],
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '热门围观', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    that.reloadIndex()
  },
  loading() {
    this.setData({
      loading_hidden: !this.data.loading_hidden
    })
  },
  reloadIndex: function() {
    const that = this;
    that.loading()
    that.data.page_index = 0
    that.getSquareClass()
  },
  // 热门围观
  getSquareClass() {
    const that = this
    let page_size = that.data.page_size
    let page_index = that.data.page_index
    request('post', 'get_square_class.php', {
      token: wx.getStorageSync("token"),
      fid: 0,
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      if (!that.data.loading_hidden)
        that.loading()
      if (res.err_code != 0)
        return
      let resThreadclass = res.data.threadclass
      let dataThreadclass = that.data.threadclass
      for (let i in resThreadclass) {
        resThreadclass[i].time = transformPHPTime(resThreadclass[i].dateline)
      }
      let threadclass = dataThreadclass.concat(resThreadclass)
      that.setData({
        threadclass: threadclass,
        have_data: false,
        nomore_data: resThreadclass.length < page_size ? true : false,
      })

    })
  },
  onReachBottom: function() {
    const that = this
    if (that.data.have_data || that.data.nomore_data)
      return

    let page_index = that.data.page_index + 1
    that.setData({
        have_data: true,
        page_index: page_index
      },
      setTimeout(() => {
        that.getSquareClass()
      })
    )
  },

  picTap: function(e) {
    app.picTap(e)
  },

  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid;
    if (tid == 0) {
      return
    }
    wx.navigateTo({
      url: `../square_detail/square_detail?tid=${tid}`,
    })
  },

  /* 下拉刷新 */
  onPullDownRefresh: function() {
    console.log('onPullDownRefresh')
    this.reloadIndex()
    wx.stopPullDownRefresh()
  },

  onShareAppMessage: function() {
    const that = this
    return {
      title: that.data.navbarData.title,
      path: '/pages/index/index?shareName=hot_pic'
    }
  },

  squareTap: function() {
    const that = this
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          that.setData({
            witchAdd: !that.data.witchAdd
          })
        })
      }
    })
  },


})