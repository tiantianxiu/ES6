var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'
const winWidth = app.globalData.windowWidth
const winHeight = app.globalData.windowHeight
const shuaHeight = 40

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
    tab: 0,
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
    //  兴趣卡
    page_digest_index: 0,
    page_digest_size: 10,
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
    // 广场
    page_square_index: 0,
    page_square_size: 10,
    square_type: 0,
    square_order: 0,

    articleList: [],
    digest_data: [],
    square_thread: [],
    new_text: '下拉可以刷新',
    members: '', //会员数
    online: '', //在线人数
    showCoverId: 0, //打开视频的pid
    showAuthorization: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 0, //是否显示左上角图标,
      isIndex: 1
    },
    navfarData: {
      position: 'index'
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
    console.log(e.timeStamp, that.data.lastTapTime)

    var cur = e.target.dataset.current
    if (that.data.currentTab == cur) {
      if (e.timeStamp - that.data.lastTapTime > 300)
        that.setData({
            zan_loading: true,
            scrollToId: 'z',
            new_text: '刷新中...'
          },
          that.switchTap(true)
        )

    } else {
      that.setData({
        currentTab: cur
      })
    }
    that.data.lastTapTime = e.timeStamp
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function() {
    const that = this
    that.stopVideo()
    if (that.data.currentTab > 4) {
      that.setData({
        scrollLeft: 300
      })
    } else {
      that.setData({
        scrollLeft: 0
      })
      that.switchTap()
    }
  },
  switchTap(t) {
    const that = this
    switch (that.data.currentTab) {
      case 0:
        that.getInterest()
        break
      case 1:
        that.getThread(t)
        break
      case 2:
        that.getVideo(t)
        break
      default:
        that.getExun(t)
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
    if (app.globalData.restart == 0) {
      app.get_token().then((res) => {
        that.onLoad(options)
      })
    } else {
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
    }
  },
  tap: function(e) {
    var that = this;
    var distance = that.data.distance || 0
    let index = e.currentTarget.dataset.index
    let that_index = that.data.index
    let x = e.currentTarget.dataset.x
    let digest_data = that.data.digest_data,
      length = digest_data.length
    if (index != that_index) {
      // console.log(e)
      // console.log(that_index)
      distance = x
    }
    let tid = e.currentTarget.dataset.tid
    let ad = e.currentTarget.dataset.ad
    let data = {
      tid: tid
    }
    if (distance && distance > (winWidth + winWidth / 5)) {
      // 感兴趣
      data.type = 0
      // app.showSelModal('dddddd').then(() => {
      that.setData({
          [`digest_data[${index}]x`]: winWidth * 2,

        },
        () => {
          that.data.distance = 0
          if (ad != 1)
            that.addInterest(data)
        }

      )
      if (index == 0)
        that.setData({
            digest_data: []
          },
          that.getDigest(true)
        )
      // })
    } else if (distance && distance < (winWidth - winWidth / 5)) {
      // 不感兴趣
      data.type = 1
      // app.showSelModal('ccccccc').then(() => {
      that.setData({
          [`digest_data[${index}]x`]: 0,
        },
        () => {
          that.data.distance = 0
          if (ad != 1)
            that.addInterest(data)
        }
      )
      if (index == 0)
        that.setData({
            digest_data: []
          },
          that.getDigest(true)
        )
      // })
    } else {
      that.setData({
        [`digest_data[${index}]x`]: winWidth,
        [`digest_data[${index}]y`]: winHeight
      })
    }
  },
  // add_interest_thread.php
  addInterest(e) {
    request('post', 'add_interest_thread.php', {
      token: wx.getStorageSync("token"),
      tid: e.tid,
      type: e.type
    }).then((res) => {
      return
    })
  },
  onChange: function(e) {
    var that = this
    that.data.distance = e.detail.x
    that.data.index = e.currentTarget.dataset.index
  },
  tabNav(e) {
    const that = this
    let tab = e.currentTarget.dataset.tab
    if (tab == that.data.tab)
      return
    that.setData({
      tab: tab
    })
    if (tab == 1){
      if (that.data.square_thread.length == 0)
        that.getSquare()
    }

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
      if (res.err_code != 0)
        return
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
  bindscroll(e) {
    const that = this
    that.stopVideo()
    // console.log(e.detail.scrollTop)
    // const _pullDownStatusDic = {
    //   invisiable: 0, //看不见
    //   pulling: 1, //下拉时
    //   release: 2, //可松开刷新时
    //   refresing: 3, //正在刷新
    //   finish: 4, //刷新完成
    // }
    let scrollTop = e.detail.scrollTop
    that.shuaxin(scrollTop)

  },
  ontouchend(e) {
    const that = this
    if (that.data.targetStatus == 2) {
      // that.setLoding()   
      that.setData({
          zan_loading: true,
          new_text: '刷新中...'
        },
        that.switchTap(true)
      )
      return
    }
    that.setData({
      zan_loading: false
    })
  },
  shuaxin(scrollTop) {
    const that = this
    let targetStatus
    if (scrollTop < -1 * shuaHeight) {
      that.data.targetStatus = 2
      that.setData({
        new_text: '松开立即刷新'
      })
    } else if (scrollTop < 0) {
      that.data.targetStatus = 1
    } else {
      that.data.targetStatus = 0
    }
  },

  stopVideo() {
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
    that.getDigest()
    that.getSquareClass()
  },
  //兴趣列表
  getInterest(t) {
    const that = this
    // if (that.data.interest_data && that.data.interest_data.length > 0 && !t)
    //   return
    console.log(that.data.page_interest_index)
    let page_index = t ? that.data.page_interest_index : 0,
      page_size = that.data.page_interest_size
    request('post', 'get_interest_thread.php', {
      token: wx.getStorageSync('token'),
      page_index: page_index,
      page_size: page_size
    }).then((res) => {
      that.setLoding(true)
      if (res.err_code != 0)
        return
      let interest_data = res.data.thread_data
      for (let i in interest_data) {
        interest_data[i].time = transformPHPTime(interest_data[i].dateline)
      }
      let thread_data = that.data.interest_have_data ? that.data.interest_data.concat(interest_data) : interest_data
      that.setData({
        interest_data: thread_data || [],
        interest_have_data: false,
        interest_nomore_data: interest_data.length < that.data.page_interest_size

      })
      that.data.page_interest_index = page_index
      setTimeout(() => {
        that.setData({
          new_text: '刷新成功'
        })
      }, 800)
      setTimeout(() => {
        that.setData({
          zan_loading: false
        })
      }, 1000)
      setTimeout(() => {
        that.setData({
          new_text: '下拉可以刷新',
        })
      }, 1500)

    })
  },
  reachInterestBottom: function() {
    const that = this
    if (that.data.interest_nomore_data || that.data.interest_have_data)
      return

    that.setData({
        interest_have_data: true
      },
      // console.log(that.data.page_interest_index)
      // that.getInterest(true)
      function() {
        that.data.page_interest_index = that.data.page_interest_index + 1
        that.getInterest(true)
      }
    )
  },
  //视频列表
  getVideo(t) {
    const that = this
    if (that.data.video_data && that.data.video_data.length > 0 && !t)
      return
    let e = {
      page_index: 0,
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
  getExun(t) {
    const that = this
    if (that.data.exun_data && that.data.exun_data.length > 0 && !t)
      return
    let e = {
      page_index: 0,
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
  getThread(t) {
    const that = this
    if (that.data.thread_data && that.data.thread_data.length > 0 && !t)
      return
    let e = {
      page_index: 0,
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
        that.setLoding(true)
        if (res.err_code != 0)
          return
        resolve(res.data)
        let forum_thread_data = res.data.forum_thread_data
        for (let i in forum_thread_data) {
          forum_thread_data[i].time = transformPHPTime(forum_thread_data[i].dateline)
        }
        let thread_data = e.page_index == 0 ? forum_thread_data : that.data[e.type].concat(forum_thread_data)
        that.setData({
          [e.type]: thread_data || []
        })

        setTimeout(() => {
          that.setData({
            new_text: '刷新成功'
          })
        }, 800)
        setTimeout(() => {
          that.setData({
            zan_loading: false
          })
        }, 1000)
        setTimeout(() => {
          that.setData({
            new_text: '下拉可以刷新',
          })
        }, 1500)
      })
    })
  },
  getDigest(t) {
    const that = this
    // digest	否	首页banner栏 digest:1
    let page_digest_index = t ? that.data.page_digest_index + 1 : that.data.page_digest_index
    let page_digest_size = that.data.page_digest_size
    request('post', 'get_thread_by_card.php', {
      token: wx.getStorageSync('token'),
      page_index: page_digest_index,
      page_size: page_digest_size
    }).then((res) => {
      if (res.err_code != 0)
        return
      let thread = res.data.thread
      for (let i in thread) {
        thread[i].time = transformPHPTime(thread[i].dateline)
        thread[i].x = winWidth
        thread[i].y = winHeight
      }

      that.setData({
        digest_data: thread,
        page_digest_index: page_digest_index
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
      order: order,
    }).then((res) => {
      that.setLoding(true)
      if (res.err_code != 0)
        return
      let thread = res.data.thread
      for (let i in thread) {
        thread[i].time = transformPHPTime(thread[i].timestamp)
      }
      let square_thread = b ? that.data.square_thread.concat(thread) : thread

      that.setData({
        square_thread: square_thread,
        page_square_index: page_index
      })
      if (b)
        that.setData({
          have_square_data: false,
          nomore_square_data: thread.length < that.data.page_size ? true : false
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
      if (res.err_code != 0)
        return
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
  },
  // get_square_class.php
  getSquareClass() {
    const that = this
    request('post', 'get_square_class.php', {
      token: wx.getStorageSync("token"),
      page_size: 3,
      page_index: 0
    }).then((res) => {
      if (res.err_code != 0)
        return
      let threadclass = res.data.threadclass
      for (let i in threadclass) {
        threadclass[i].time = transformPHPTime(threadclass[i].dateline)
      }
      that.setData({
        threadclass: threadclass
      })
    })
  },
  aaa(e){
    const that = this
    console.log(e)
  },
  // 滚动
  onPageScroll(e) {
    const that = this
    // if(that.data.tab != 0)
      return
    const query = wx.createSelectorQuery()
    if (that.data.tab != 0)
      return
    let scrollTop = e.scrollTop
    const heightMt = app.globalData.heightMt + 20 * 2 
    if (that.data.index_list)
      return
    query.select('#index-list').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      // #reply-title节点的上边界坐标
      console.log(res[0].top , res[1].scrollTop)
      let contenTop = res[0].top + res[1].scrollTop // 显示区域的竖直滚动位置
      if (heightMt + scrollTop >= contenTop){
      // if (res[0].top < 100)
        that.setData({
          index_list: true
        })
      }else{
        that.setData({
          index_list: false
        })
      }
    })
  },
  hIndexList: function() {
    const that = this
    that.setData({
      index_list: false
    })
  },
  toDetail: function(e) {
    const that = this
    var tid = e.currentTarget.dataset.tid
    if (tid == 0)
      return

    let hidden = e.currentTarget.dataset.hidden
    let reputation_id = e.currentTarget.dataset.reputation_id
    if (reputation_id && hidden == 1) {
      wx.navigateTo({
        url: '/praise/pages/praise_user/praise_user?id=' + reputation_id,
      })
      return
    }

    if (hidden == 2) {
      wx.navigateTo({
        url: '/question/pages/quest_detail/quest_detail?id=' + tid,
      })
      return
    }

    wx.navigateTo({
      url: '../detail/detail?tid=' + tid,
    })
  },
  toUserDetail(e) {
    app.toUserDetail(e)
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
  /* 下拉刷新 */
  onPullDownRefresh: function () {
    const that = this
    let tab = that.data.tab
    if (tab = 1) 
      that.getSquare()

    wx.stopPullDownRefresh()

  },

})