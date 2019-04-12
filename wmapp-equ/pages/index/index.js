var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'
const winWidth = app.globalData.windowWidth
const winHeight = app.globalData.windowHeight

Page({
  data: {
    // 滑动

    currentTab: 1, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    scrollTop: 5,

    // 卡片
    x: winWidth,
    y: winHeight,
    distance: "",
    animationData: {},
    content: [{
      "value": ''
    }, {
      "value": ''
    }, {
      "value": ''
    }, {
      "value": ''
    }],
    // 卡片end

    tab: 'recommend',
    loading_hidden: true,
    loading_msg: '加载中...',
    scrollTop: '',

    // swiper设置
    indicatorDots: false,
    autoplay: true,
    interval: 4000,
    duration: 500,
    swiperCurrent: 0,
    swiperCurR: 0,
    swiperIndexR: 0,
    //  最新
    page_index: 0,
    page_size: 10,
    // 视频
    page_video_index: 0,
    page_video_size: 10,
    //  兴趣
    page_interest_index: 0,
    page_interest_size: 10,
    //  E讯
    page_exun_index: 0,
    page_exun_size: 10,

    articleList: [],
    imgRecommend: [],

    members: '', //会员数
    online: '', //在线人数
    showCoverId: 0, //打开视频的pid
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      isIndex: 1
    }
  },
  loadMore() { // 触底加载更多
    console.log(66666)
  },


  refresh() { // 函数式触发开始下拉刷新。如可以绑定按钮点击事件来触发下拉刷新
    wx.startPullDownRefresh({
      success(errMsg) {
        console.log('开始下拉刷新', errMsg)
      },
      complete() {
        console.log('下拉刷新完毕')
      }
    })
  },

  scrollFn(e) {
    // 防抖，优化性能
    // 当滚动时，滚动条位置距离页面顶部小于设定值时，触发下拉刷新
    // 通过将设定值尽可能小，并且初始化scroll-view组件竖向滚动条位置为设定值。来实现下拉刷新功能，但没有官方的体验好
    clearTimeout(this.timer)
    const that = this
    let scrollTop = e.detail.scrollTop
    if (scrollTop < -50) {
      that.loadMore()
    }
    if (e.detail.scrollTop < this.data.scrollTop) {
      this.timer = setTimeout(() => {
        this.refresh()
      }, 350)
    }
  },

  // 滚动切换标签样式
  switchTab: function(e) {
    const that = this
    that.setData({
      currentTab: e.detail.current
    });
    that.checkCor()
  },
  // 点击标题切换当前页时改变样式
  swichNav: function(e) {
    const that = this
    var cur = e.target.dataset.current;
    if (that.data.currentTaB == cur) {
      return false
    } else {
      that.setData({
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function() {
    const that = this
    that.bindscroll()
    if (that.data.currentTab > 4) {
      that.setData({
        scrollLeft: 300
      })
    } else {
      that.setData({
        scrollLeft: 0
      })
      switch (that.data.currentTab) {
        case 0:
          that.getInterest()
          break
        case 1:
          that.getThread()
          break
        case 2:
          that.getVideo()
          break
        default:
          that.getExun()
      }

    }
  },

  onLoad: function(options) {
    const that = this
    if (options.tab) {
      that.setData({
        tab: options.tab,
      })
    }
    var res = wx.getSystemInfoSync();
    var winWidth = res.windowWidth;
    var winHeight = res.windowHeight;
    that.setData({
      x: winWidth,
      y: winHeight,
      winHeight: winHeight
    })

    that.getOnline()
    that.reloadIndex()

    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log(scene)
      const tidVal = scene.split('=')
      const shareName = tidVal[1].split('&')[0]
      const shareId = tidVal[2]
      if (shareId) {
        if (shareName == 'pdetail') {
          wx.navigateTo({
            url: `/praise/pages/praise_user/praise_user?id=${shareId}`
          })
          return
        }
        wx.navigateTo({
          url: `../${shareName}/${shareName}?id=${shareId}`
        })
        return
      }
      wx.navigateTo({
        url: `../${shareName}/${shareName}`
      })
      return
    }
    if (options.shareName) {
      let shareName = options.shareName
      let shareId = options.shareId
      let root = options.root
      if (root) {
        wx.navigateTo({
          url: `/${root}/pages/${shareName}/${shareName}?id=${shareId}`
        })
        return
      }
      wx.navigateTo({
        url: `/pages/${shareName}/${shareName}?id=${shareId}`
      })
    }
  },
  tap: function(e) {
    var that = this;
    var distance = that.data.distance
    let index = e.currentTarget.dataset.index
    let imgRecommend = that.data.imgRecommend
    let imgRecommends = that.data.imgRecommends,
      length = imgRecommends.length
    if (distance > (winWidth + winWidth / 5)) {
      // app.showSelModal('dddddd').then(() => {
      that.setData({
        [`imgRecommends[${length - index - 1}]x`]: winWidth * 2
      })
      // })
    } else if (distance < (winWidth - winWidth / 5)) {
      // app.showSelModal('ccccccc').then(() => {
      that.setData({
        [`imgRecommends[${length - index -1}]x`]: 0
      })
      // })
    } else {
      that.setData({
        [`imgRecommends[${length - index - 1}]x`]: winWidth,
        [`imgRecommends[${length - index - 1}]y`]: winHeight
      })
    }
  },
  onChange: function(e) {
    var that = this
    that.data.distance = e.detail.x
  },


  /* 分享 */
  onShareAppMessage: function(res) {
    const shareTitle = getApp().globalData.shareTitle
    const tab = this.data.tab
    return {
      title: shareTitle,
      path: `/pages/index/index?tab=${tab}`
    }
  },

  // get_my_msg_num
  getMyMsgNum: function() {
    const that = this
    if (wx.getStorageSync("has_login") != 1)
      return
    request('post', 'get_my_msg_num.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      if (res.data.notice.length == 0)
        return
      let notice = res.data.notice,
        msg_status = res.data.msg_status

      that.setData({
        notice: notice,
        msg_status: res.data.msg_status,
        showQuest: true
      })
    })
  },
  hideShareBox: function() {
    const that = this
    that.setData({
      showQuest: false
    })
  },

  onNODone: function() {
    app.wxShowToast('该功能开发中...', 1500, 'none')
  },
  questionTap: function() {
    wx.navigateTo({
      url: '/question/pages/question/question'
    })
  },

  play: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    let showCoverId = that.data.showCoverId

    that['videoContext' + pid] = wx.createVideoContext('myVideo' + pid)

    if (showCoverId) {
      that['videoContext' + showCoverId].stop()
    }
    that.setData({
      showCoverId: pid
    }, () => {
      setTimeout(() => {
        that['videoContext' + pid].play()
      }, 300)
    })

  },
  dd: function(e) {},
  exitFullScreen: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    let showCoverId = that.data.showCoverId
    that['videoContext' + pid].pause()
    that['videoContext' + pid].stop()
    that.setData({
      showCoverId: pid == showCoverId ? 0 : showCoverId
    })
  },
  bindscroll(){
    const that = this
    let showCoverId = that.data.showCoverId
    if (showCoverId == 0)
      return
    that['videoContext' + showCoverId].pause()
    that['videoContext' + showCoverId].stop()
    that.setData({
      showCoverId: 0
    })
  },
  setLoding: function(t) {
    this.setData({
      loading_hidden: t ? true : false,
      loading_msg: t ? '加载完成' : '加载中...'
    });
  },
  setPageScrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  reloadIndex: function() {
    var that = this
    that.setLoding()
    that.setPageScrollToTop()
    that.getThread()
  },
  //兴趣列表
  getInterest() {
    const that = this
    if (that.data.interest_data && that.data.interest_data.length > 0)
      return
    let page_index = that.data.page_interest_index,
      page_size = that.data.page_interest_size
    request('post', 'get_interest_thread.php', {
      token: wx.getStorageSync('token'),
      page_index: page_index,
      page_size: page_size
    }).then((res) => {
      let interest_data = res.data.thread_data
      for (let i in interest_data) {
        interest_data[i].time = transformPHPTime(interest_data[i].dateline)
      }
      let thread_data = page_index == 0 ? interest_data : that.data.interest_data.concat(thread_data)
      that.setData({
        interest_data: thread_data || [],
        page_interest_index: that.data.page_interest_index + 1,
        interest_have_data: false,
        interest_nomore_data: interest_data.length < that.data.page_interest_size
      })
      that.setLoding(true)
    })
  },
  reachInterestBottom: function() {
    const that = this
    if (that.data.interest_nomore_data || that.data.interest_have_data)
      return

    that.setData({
        interest_have_data: true,
        page_interest_index: that.data.page_interest_index + 1
      },
      that.getInterest(re)
    )
  },
  //视频列表
  getVideo() {
    const that = this
    if (that.data.video_data && that.data.video_data.length > 0)
      return
    let e = {
      page_index: that.data.page_video_index,
      page_size: that.data.page_video_size,
      attachment: 1,
      type: 'video_data'
    }
    that.getCommon(e)
  },
  reachVideoBottom: function(e) {
    const that = this
    if (that.data.video_nomore_data || that.data.video_have_data)
      return
    let re = {
      page_index: that.data.page_video_index + 1,
      page_size: that.data.page_video_size,
      attachment: 1,
      type: 'video_data'
    }
    that.setData({
        video_have_data: true
      },
      that.getCommon(re).then((res) => {
        that.setData({
          page_video_index: that.data.page_video_index + 1,
          video_have_data: false,
          video_nomore_data: res.forum_thread_data.length < that.data.page_video_size
        })
      })
    )
  },
  //E讯列表
  getExun() {
    const that = this
    if (that.data.exun_data && that.data.exun_data.length > 0)
      return
    let e = {
      page_index: that.data.page_exun_index,
      page_size: that.data.page_exun_size,
      fup: 82,
      type: 'exun_data'
    }
    that.getCommon(e)
  },
  reachExunBottom: function(e) {
    const that = this
    if (that.data.exun_nomore_data || that.data.exun_have_data)
      return
    let re = {
      page_index: that.data.page_exun_index + 1,
      page_size: that.data.page_exun_size,
      fup: 82,
      type: 'exun_data'
    }
    that.setData({
        exun_have_data: true
      },
      that.getCommon(re).then((res) => {
        that.setData({
          page_exun_index: that.data.page_exun_index + 1,
          exun_have_data: false,
          exun_nomore_data: res.forum_thread_data.length < that.data.page_exun_size
        })
      })
    )
  },
  //最新列表
  getThread() {
    const that = this
    if (that.data.thread_data && that.data.thread_data.length > 0)
      return
    let e = {
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      type: 'thread_data'
    }
    that.getCommon(e)
  },
  reachNewBottom: function(e) {
    const that = this
    if (that.data.new_nomore_data || that.data.new_have_data)
      return
    let re = {
      page_index: that.data.page_index + 1,
      page_size: that.data.page_size,
      type: 'thread_data'
    }
    that.setData({
        new_have_data: true
      },
      that.getCommon(re).then((res) => {
        that.setData({
          page_index: that.data.page_index + 1,
          new_have_data: false,
          new_nomore_data: res.forum_thread_data.length < that.data.page_size
        })
      })
    )
  },

  getCommon(e) {
    const that = this
    // fup	否	int	e讯= 82
    // fid	否	int	板块fid
    // attachment	否	int	首页视频必填 attachment: 1
    return new Promise(function(resolve, reject) {

      request('post', 'get_thread.php', {
        token: wx.getStorageSync('token'),
        page_index: e.page_index,
        page_size: e.page_size,
        attachment: e.attachment || '',
        fup: e.fup || ''
      }).then((res) => {
        if (res.err_code == 0)
          resolve(res.data)
        let forum_thread_data = res.data.forum_thread_data
        for (let i in forum_thread_data) {
          forum_thread_data[i].time = transformPHPTime(forum_thread_data[i].dateline)
        }
        let thread_data = e.page_index == 0 ? forum_thread_data : that.data[e.type].concat(forum_thread_data)
        that.setData({
          [e.type]: thread_data || []
        })
        that.setLoding(true)
      })
    })
  },

  getOnline: function() {
    const that = this
    let getOnline = app.getSt('getOnline') //精华帖子列表详情
    if (getOnline) {
      that.setData({
        'navbarData.online': getOnline.online,
        'navbarData.members': getOnline.members
      })
      return
    }
    request('post', 'get_online.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      let online = res.data.online
      let members = res.data.members

      let getOnline = {
        online: online,
        members: members
      }
      app.putSt('getOnline', getOnline, 86400)
      that.setData({
        'navbarData.online': online,
        'navbarData.members': members
      })
    })
  }
})