var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'
var Dec = require('../../utils/public.js');

Page({
  data: {

    loading_hidden: true,
    loading_msg: '加载中...',
    square_thread: [],
    // 广场
    page_square_index: 0,
    page_square_size: 10,

    square_order: 0,
    cates: [{
        name: '最新',
        type: 0
      },
      {
        name: '关注',
        type: 1
      },
      {
        name: '美女',
        type: 3
      },
      {
        name: '帅哥',
        type: 2
      }
    ],
    follow_text: '',
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      square: 1,
      title: '广场', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    that.reloadIndex()
    Dec.Encrypt("需要加密的字符串")
    Dec.Decrypt("KrzX7PeB5iUk6JKBUMR9eW6ai3Kd25Gl3JkQ==")
  },

  reloadIndex: function() {
    const that = this;
    that.setData({
      loading_hidden: false,
      square_type: 0,
      square_name: '最新'
    })
    that.data.page_square_index = 0
    that.getSquareClass()
  },
  // 热门围观
  getSquareClass() {
    const that = this
    request('post', 'get_square_class.php', {
      token: wx.getStorageSync("token"),
      page_size: 10,
      page_index: 0
    }).then((res) => {
      if (res.err_code != 0)
        return
      that.getSquare()
      let threadclass = res.data.threadclass
      for (let i in threadclass) {
        threadclass[i].time = transformPHPTime(threadclass[i].dateline)
      }
      that.setData({
        threadclass: threadclass
      })
    })
  },
  // 广场首页列表
  getSquare(b) {
    const that = this
    let page_index = b ? that.data.page_square_index + 1 : 0,
      page_size = that.data.page_square_size,
      type = that.data.square_type,
      order = that.data.square_order
    request('post', 'get_square.php', {
      token: wx.getStorageSync("token"),
      page_index: page_index,
      page_size: page_size,
      type: type,
      typeid: 0,
      order: order
    }).then((res) => {
      if (res.err_code != 0)
        return
      let thread = res.data.thread
      for (let i in thread) {
        thread[i].time = transformPHPTime(thread[i].timestamp)
        if (thread[i].message && thread[i].message.length > 108)
          thread[i].mes_more = thread[i].message.substr(0, 108)

      }
      let square_thread = b ? that.data.square_thread.concat(thread) : thread

      that.setData({
        square_thread: square_thread,
        page_square_index: page_index,
        loading_hidden: true
      })
      if (b)
        that.setData({
          have_square_data: false,
          nomore_square_data: thread.length < that.data.page_size ? true : false
        })
    })
  },
  moreDown(e) {
    const that = this
    let index = e.currentTarget.dataset.index
    let more = e.currentTarget.dataset.more
    let mores = e.currentTarget.dataset.mores
    let message = e.currentTarget.dataset.message
    if (mores) {
      that.setData({
        ['square_thread[' + index + '].mes_mores']: ''
      })
      return
    }
    that.setData({
      ['square_thread[' + index + '].mes_mores']: message
    })
  },
  // 上拉加载
  onReachBottom() {
    const that = this
    let tab = that.data.tab
    if (tab = 1) {
      if (that.data.nomore_square_data || that.data.have_square_data)
        return
      that.setData({
          have_square_data: true
        },
        that.getSquare(true)
      )
    }
  },
  // 点赞文章
  toZan: function(e) {
    const that = this
    const type = e.currentTarget.dataset.type //1赞 2踩
    const index = e.currentTarget.dataset.index //index
    const is_zan = e.currentTarget.dataset.is_zan //index
    const tid = e.currentTarget.dataset.tid //index
    const zan = e.currentTarget.dataset.zan //index
    const cai = e.currentTarget.dataset.cai //index
    that.isShowAuthorization().then((res) => {
      if (res == true) {

        request('post', 'add_zan.php', {
          token: wx.getStorageSync("token"),
          tid: tid,
          type: type
        }).then((res) => {
          if (res.err_code != 0)
            return

          if (type == 1) {
            that.setData({
              ['square_thread[' + index + '].is_zan']: is_zan == type ? 0 : 1,
              ['square_thread[' + index + '].zan']: is_zan == type ? parseInt(zan) - 1 : parseInt(zan) + 1,
              ['square_thread[' + index + '].cai']: is_zan == 2 ? parseInt(cai) - 1 : cai
            })
          } else {
            that.setData({
              ['square_thread[' + index + '].is_zan']: is_zan == type ? 0 : 2,
              ['square_thread[' + index + '].cai']: is_zan == type ? parseInt(cai) - 1 : parseInt(cai) + 1,
              ['square_thread[' + index + '].zan']: is_zan == 1 ? parseInt(zan) - 1 : zan
            })
          }

        })

      }
    })
  },
  picTap: function(e) {
    app.picTap(e)
  },
  toZone: function(e) {
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '../zone/zone?id=' + fid,
    })
  },
  toDetail: function(e) {
    var tid = e.currentTarget.dataset.tid;
    if (tid == 0) {
      return
    }
    wx.navigateTo({
      url: `../square_detail/square_detail?tid=${tid}`
    })


  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    const that = this
    that.reloadIndex()
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function(res) {
    var that = this
    return {
      title: app.globalData.shareTitle,
      path: '/pages/square/square',
      success: function(res) {
        console.log(res);
      },
    }
  },
  // 图片预览
  imagesFor: function(e) {
    const that = this
    let image = e.currentTarget.dataset.image
    if (image) {
      let arr = []
      arr.push(image)
      wx.previewImage({
        urls: arr // 需要预览的图片http链接列表
      })
      return
    }
    let images = e.currentTarget.dataset.images,
      url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: images, // 需要预览的图片http链接列表
      current: url
    })
  },
  // 是否弹出授权框
  isShowAuthorization: function() {
    const that = this
    const hasLogin = wx.getStorageSync("has_login")
    return new Promise(function(resolve, reject) {
      if (hasLogin == 1) {
        resolve(true)
      } else {
        resolve(false)
        that.showAuthorization()
      }
    })
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  toTopicDetail: function(e) {
    let fid = e.currentTarget.dataset.fid
    wx.navigateTo({
      url: '/pages/topic_zone/topic_zone?id=' + fid,
    })
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  squareTap: function() {
    const that = this
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          if (res == true)
            that.setData({
              witchAdd: !that.data.witchAdd
            })
        })
      }
    })
  },
  squareLong: function(e) {
    const that = this
    let type = e.currentTarget.dataset.type
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          if (res == true) {
            wx.navigateTo({
              url: `/pages/add_square/add_square?type=${type}`
            })
            that.setData({
              witchAdd: false
            })
          }
        })
      }
    })
  },
  previewImage(e) {
    app.previewImage(e)
  },
  cateTap() {
    const that = this
    that.setData({
      showCate: !that.data.showCate
    })
  },
  selectedCate(e) {
    const that = this
    let type = e.currentTarget.dataset.type
    let name = e.currentTarget.dataset.name
    let square_type = that.data.square_type
    if (type == square_type)
      return
    that.setData({
        square_type: type,
        square_name: name
      },
      () => {

        that.setData({
          loading_hidden: false
        })
        that.data.page_square_index = 0
        that.getSquare()
      }
    )
  },
  isFollow() {
    const that = this
    request('post', 'is_follow.php', {
      token: wx.getStorageSync('token'),
      uid: that.data.uid
    }).then((res) => {
      if (!res || res.err_code != 0)
        return
      if (res.data.status == 1)
        that.setData({
          follow_text: '已'
        })
      if (res.data.status == 2)
        that.setData({
          follow_text: '互相'
        })
      if (res.data.status == 0)
        that.setData({
          follow_text: ''
        })
    })
  },
  operationTap(e) {
    const that = this
    if (e && e.currentTarget.dataset.uid) {
      let uid = e.currentTarget.dataset.uid
      let idx = e.currentTarget.dataset.index + 1
      that.data.idx = idx
      that.setData({
        show_opera: true,
        uid: uid
      })
      that.isFollow()
    } else {
      that.setData({
        show_opera: false,
        uid: 0,
        index: 0
      })
    }
  },
  addFollow(e) {
    const that = this
    let uid = that.data.uid
    if(e && e.currentTarget.dataset.uid)
      uid = e.currentTarget.dataset.uid
    request('post', 'add_follow.php', {
      token: wx.getStorageSync('token'),
      followuid: uid
    }).then((res) => {
      if (res.err_code != 0)
        return
      that.operationTap()
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
      if (res.data.status == 1){
        that.getWxUser()
      } else if (e.currentTarget.dataset.uid){
        that.getWxUser()
      }else{
        that.setData({
          idx: 0
        })
      }
    })
  },
  getWxUser() {
    const that = this
    request('post', 'get_wx_user.php', {
      token: wx.getStorageSync('token')
    }).then((res) => {
      if (res.err_code != 0)
        return
      that.setData({
        member: res.data.member,
        idx: that.data.idx
      })
    })
  },
  hotTap(e){
    const that = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/hot_pic/hot_pic?id=' + id
    })
  },
  dialogueTap(e){
    let uid = this.data.uid
    wx.navigateTo({
      url: '/pages/dialogue/dialogue?uid=' + uid
    })
  }

})