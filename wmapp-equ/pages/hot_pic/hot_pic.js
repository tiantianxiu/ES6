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
    page_size: 9,
    page_index: 0,
    order: 0,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      transparent: 1,
      showCapsule: 1, //是否显示左上角图标,
      title: '#广场专题#', //导航栏 中间的标题
    }
  },
  onLoad: function(options) {
    const that = this
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log(scene)
      var tidVal = scene.split('=')
      var id = tidVal[1].split('&')[0]
      var subject = tidVal[2]
    } else {
      var id = options.id
      var subject = options.subject
      var fid = options.fid
    }
    that.setData({
      id: id,
      fid: fid || 0,
      subject: subject
    })
    if (subject)
      that.setData({
        'navbarData.title': subject
      })
    that.reloadIndex();
  },

  reloadIndex: function() {
    const that = this;
    that.setData({
      loading_hidden: false,
    })
    that.data.page_index = 0
    that.getSquare()
  },
  orderTap() {
    const that = this
    that.data.order =  that.data.order == 1 ? 0 : 1
    that.reloadIndex()
      
    
  },
  //最新贴子
  getSquare: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = 0
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'get_square.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      typeid: that.data.id,
      order: that.data.order,
      type: 0,

    }).then((res) => {
      if (res.err_code != 0)
        return
      let thread = res.data.thread
      if (thread.length > 1)
        for (let i in thread) {
          if (!thread[i].ad) {
            thread[i].time = transformPHPTime(thread[i].timestamp)
            if (thread[i].message && thread[i].message.length > 100)
              thread[i].mes_more = thread[i].message.substr(0, 100)
          }
        }
      that.setData({
        order: that.data.order,
        replies: res.data.replies,
        views: res.data.views,
        banner: res.data.banner,
        class_name: res.data.name || '',
        description: res.data.description || '',
        thread: thread,
        page_topicIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕',
        have_data: thread.length < page_size ? false : true,
        nomore_data: thread.length < page_size ? true : false
      })
    })
  },
  picTap: function(e) {
    app.picTap(e)
  },
  moreDown(e) {
    const that = this
    let index = e.currentTarget.dataset.index
    let more = e.currentTarget.dataset.more
    let mores = e.currentTarget.dataset.mores
    let message = e.currentTarget.dataset.message
    if (mores) {
      that.setData({
        ['thread[' + index + '].mes_mores']: ''
      })
      return
    }
    that.setData({
      ['thread[' + index + '].mes_mores']: message
    })
  },

  onReachBottom: function() {
    const that = this

    let page_size = that.data.page_size
    let page_index = that.data.page_index + 1

    if (that.data.nomore_data == true)
      return
    request('post', 'get_square.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      typeid: that.data.id,
      order: that.data.order,
      typeid: that.data.id
    }).then((res) => {
      let tmpThread = that.data.thread
      let thread = res.data.thread;
      for (let i in thread) {
        var extcredits2 = thread[i].extcredits2 + ''
        var extcredits2_arr = extcredits2.split('')
        thread[i].extcredits2_arr = extcredits2_arr
        thread[i].timestamped = transformPHPTime(thread[i].timestamp)
        if (thread[i].video) {
          that['videoContext' + thread[i].pid] = wx.createVideoContext('myVideo' + thread[i].pid)
        }
        if (thread[i].message.length > 40) {
          thread[i].message_more = thread[i].message.substring(0, 40) + '...'
        }
      }
      let newThread = tmpThread.concat(thread)
      that.setData({
        have_data: thread.length < page_size ? false : true,
        thread: newThread,
        page_index: page_index,
        nomore_data: thread.length < page_size ? true : false,
      })
    })
  },
  play: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    that.setData({
      showCoverId: pid
    }, () => {
      that['videoContext' + pid].play()
      that['videoContext' + pid].requestFullScreen({
        direction: 0
      })

    })
  },
  exitFullScreen: function(e) {
    const that = this
    that.setData({
      showCoverId: 0
    })
    let pid = e.currentTarget.dataset.pid
    if (e.detail.fullScreen != true) {
      that['videoContext' + pid].stop()
      return
    }
    that['videoContext' + pid].stop()
    that['videoContext' + pid].exitFullScreen()
  },
  fullscreenchange: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    if (e.detail.fullScreen != true) {
      that.setData({
        showCoverId: 0
      })
      that['videoContext' + pid].stop()
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
              ['thread[' + index + '].is_zan']: is_zan == type ? 0 : 1,
              ['thread[' + index + '].zan']: is_zan == type ? parseInt(zan) - 1 : parseInt(zan) + 1,
              ['thread[' + index + '].cai']: is_zan == 2 ? parseInt(cai) - 1 : cai
            })
          } else {
            that.setData({
              ['thread[' + index + '].is_zan']: is_zan == type ? 0 : 2,
              ['thread[' + index + '].cai']: is_zan == type ? parseInt(cai) - 1 : parseInt(cai) + 1,
              ['thread[' + index + '].zan']: is_zan == 1 ? parseInt(zan) - 1 : zan
            })
          }

        })

      }
    })
  },
  previewImage(e) {
    app.previewImage(e)
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
      url: `../square_detail/square_detail?tid=${tid}`,
    })
  },
  /* 下拉刷新 */
  onPullDownRefresh: function() {
    console.log('onPullDownRefresh')
    this.reloadIndex()
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function() {
    const that = this
    const id = that.data.id
    const subject = that.data.subject
    return {
      title: subject || '广场专题',
      path: `/pages/index/index?shareName=square_pic&shareId=${id}`
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
  toUserDetail: function(e) {
    app.toUserDetail(e)
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
  squareLong: function(e) {
    const that = this
    let type = e.currentTarget.dataset.type
    let id = that.data.id
    app.canAddThread(true).then((re) => {
      if (re) {
        that.isShowAuthorization().then((res) => {
          wx.navigateTo({
            url: `/pages/add_square/add_square?type=${type}&typeid=${id}`
          })
          that.setData({
            witchAdd: false
          })
        })
      }
    })
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
    if (e && e.currentTarget.dataset.uid)
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
      if (res.data.status == 1) {
        that.getWxUser()
      } else if (e.currentTarget.dataset.uid) {
        that.getWxUser()
      } else {
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
  onPageScroll(e) {
    const that = this
    const scrollTop = e.scrollTop
    if (that.data.res_top_scroll < scrollTop && that.data.navbarData.transparent == 0)
      return
    if (that.data.res_top_scroll > scrollTop && that.data.navbarData.transparent == 1)
      return
    const query = wx.createSelectorQuery()
    query.select("#thread-content-cell").boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      let res_top = res[0].top // #the-id节点的上边界坐标
      let res_scrollTop = res[1].scrollTop // 显示区域的竖直滚动位置
      that.data.res_top_scroll = res_top + res_scrollTop - that.data.heightMt -20
      if (res_top + res_scrollTop - that.data.heightMt -20 < scrollTop) {
        that.setData({
          'navbarData.transparent': 0
        })
      } else {
        that.setData({
          'navbarData.transparent': 1
        })
      }
    })
  },

})