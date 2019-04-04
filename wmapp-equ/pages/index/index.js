var app = getApp()
import {
  request
} from '../../utils/util.js'
const winWidth = app.globalData.windowWidth
const winHeight = app.globalData.windowHeight

Page({ 
  data: {
    // 滑动
    
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    expertList: [{ //假数据
      img: "avatar.png",
      name: "欢顔",
      tag: "知名情感博主",
      answer: 134,
      listen: 2234
    }],
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
    //
    swiperCurR: 0,
    swiperIndexR: 0,
    page_size: 10,
    page_index: 0,
    articleList: [],
    imgRecommend: [],
    // 车代表
    page_CarVipSize: 10,
    page_CarVipIndex: 0,
    articleListCarVip: [],
    carViptag: 'carVipThread',
    userList: [],
    page_usersize: 15,
    page_userindex: 0,
    checkRead: true,
    applyStatus: '',
    applyTest: '',
    // 吐槽
    swiperCurF: 0,
    swiperIndexF: 0,
    page_ForumlistSize: 10,
    page_ForumlistIndex: 0,
    articleListForumlist: [],
    imgForumList: [],
    // 话题
    topicList: [],
    newTopicList: [],
    page_topicSize: 10,
    page_topicIndex: 0,

    // E讯
    swiperCurE: 0,
    swiperIndexE: 0,
    imgEnews: [],
    einfoList: [],
    page_eSize: 10,
    page_eIndex: 0,

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
    // let len = this.data.list.length,
    //   lastItem = this.data.list[len - 1];
    // for (let i = 0; i < len; i++) {
    //   this.data.list.push(lastItem + i + 1)
    //   this.setData({
    //     'list': this.data.list
    //   })
    // }
    console.log(66666)
  },

  // onPullDownRefresh() {
  //   // 监听该页面用户下拉刷新事件
  //   // 可以在触发时发起请求，请求成功后调用wx.stopPullDownRefresh()来结束下拉刷新
  //   console.log('下拉拉拉')
  // },
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
    // console.log(9999)
    // 防抖，优化性能
    // 当滚动时，滚动条位置距离页面顶部小于设定值时，触发下拉刷新
    // 通过将设定值尽可能小，并且初始化scroll-view组件竖向滚动条位置为设定值。来实现下拉刷新功能，但没有官方的体验好
    clearTimeout(this.timer)
    const that = this
    let scrollTop = e.detail.scrollTop
    if(scrollTop < -50){
      that.loadMore()
    }
    if (e.detail.scrollTop < this.data.scrollTop) {
      this.timer = setTimeout(() => {
        this.refresh()
      }, 350)
    }
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
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

  onReachBottom: function() {
    var that = this;
    if (that.data.tab == 'recommend') {
      that.recommendOnRB();
    } else if (that.data.tab == 'vipCar') {
      that.vipCarOnRB();
    } else if (that.data.tab == 'forumList') {
      that.forumListOnRB()
    } else if (that.data.tab == 'topicList') {
      that.topicListOnRB()
    } else if (that.data.tab == 'Enews') {
      that.eNewsOnRB()
    }
  },

  reloadIndex: function() {
    var that = this;
    that.setLoding()
    that.setPageScrollToTop()
    that.setData({
      page_CarVipIndex: 0,
      page_userindex: 0,
      page_ForumlistIndex: 0,
      page_topicIndex: 0,
      page_eIndex: 0,
    })
    that.setData({
      hidePostIcon: false
    })
    if (that.data.tab == 'recommend') {
      that.recommend()
    } else if (that.data.tab == 'vipCar') {
      that.vipCar()
    } else if (that.data.tab == 'forumList') {
      that.forumList()
    } else if (that.data.tab == 'topicList') {
      that.topicList()
      that.setData({
        hidePostIcon: true
      })
    } else if (that.data.tab == 'Enews') {
      that.eNews()
    }

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
  },
  setLoding: function() {
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
  },
  setPageScrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  navChange: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({
      tab: tab,
    })
    if (tab == 'recommend')
      return
    this.reloadIndex()
  },
  tagChange: function(e) {
    const that = this
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      carViptag: tag
    })
    this.reloadIndex()
  },
  swiperChangeR: function(e) {
    let current = e.detail.current
    this.setData({
      swiperIndexR: current
    })
  },
  swiperChangeF: function(e) {
    let current = e.detail.current
    this.setData({
      swiperIndexF: current
    })
  },
  swiperChangeE: function(e) {
    let current = e.detail.current
    this.setData({
      swiperIndexE: current
    })
  },
  toCharging: function() {
    wx.navigateTo({
      url: '/user/pages/charging/charging'
    })
  },
  toSearch: function() {
    wx.navigateTo({
      url: '/praise/pages/search/search'
    })
  },
  toDetail: function(e) {
    const that = this
    var tid = e.currentTarget.dataset.tid;
    if (tid == 0) {
      return
    }
    if (tid == -1) {
      that.toCarVip()
      return
    }
    let reputation_id = e.currentTarget.dataset.reputation_id
    if (reputation_id) {
      wx.navigateTo({
        url: '/praise/pages/praise_user/praise_user?id=' + reputation_id,
      })
      return
    }
    let is_question = e.currentTarget.dataset.is_question
    if (is_question) {
      wx.navigateTo({
        url: '/question/pages/quest_detail/quest_detail?id=' + tid,
      })
      return
    }
    wx.navigateTo({
      url: '../detail/detail?tid=' + tid,
    })
  },
  toEdetail: function(e) {
    var aid = e.currentTarget.dataset.aid
    if (aid == undefined) {
      var tid = e.currentTarget.dataset.tid;
      if (tid != 0) {
        wx.navigateTo({
          url: '../detail/detail?tid=' + tid,
        })
      }
      return
    }
    wx.navigateTo({
      url: `../Edetail/Edetail?aid=${aid}`,
    })
  },
  toApplyInto: function() {
    const that = this
    if (wx.getStorageSync("has_login") == 1) {
      wx.navigateTo({
        url: `/exun/pages/applyInto/applyInto`,
      })
    } else {
      that.setData({
        showAuthorization: true
      })
    }
  },
  toRankingList: function() {
    wx.navigateTo({
      url: `/exun/pages/rankingList/rankingList`,
    })
  },
  toBigshot: function(e) {
    wx.navigateTo({
      url: `/exun/pages/bigShot/bigShot`,
    })
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },
  toTopicDetail: function(e) {
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '/pages/topic_zone/topic_zone?id=' + fid,
    })
  },


  // 推荐
  recommend: function() {
    var that = this;
    var page_size = that.data.page_size;
    var page_index = that.data.page_index;
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      let thread = res.data.forum_thread_data
      for (let i in thread) {
        if (thread[i].video) {
          that['videoContext' + thread[i].pid] = wx.createVideoContext('myVideo' + thread[i].pid)
        }
      }
      that.setData({
        articleList: thread,
        page_index: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
    that.getIndexBanner()
  },
  recommendPullDown: function() {
    const that = this
    that.setLoding()
    console.log(that.data.page_index)
    let page_index = that.data.page_index + 1
    let page_size = that.data.page_size
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      let thread = that.data.articleList
      let resThread = res.data.forum_thread_data
      for (let i in resThread) {
        if (resThread[i].video) {
          that['videoContext' + resThread[i].pid] = wx.createVideoContext('myVideo' + resThread[i].pid)
        }
      }

      thread.unshift(...resThread)

      that.setData({
        recommendTip: '更新推荐' + resThread.length + '条',
        articleList: thread,
        page_index: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
      setTimeout(() => {
        that.setData({
          recommendTip: '',
        })
      }, 1500)
    });
    that.getIndexBanner()
  },
  // 推荐图
  getIndexBanner: function() {
    const that = this
    request('post', 'get_banner.php', {
      token: wx.getStorageSync("token"),
      type: 1
    }).then((res) => {
      let imgRecommend = res.data.banner_data
      let imgRecommends = []
      for (let i in imgRecommend) {
        imgRecommend[i].x = winWidth
        imgRecommend[i].y = winHeight
        imgRecommend[i].idx = i
        imgRecommends.splice(0,0,imgRecommend[i])
      }

      that.setData({
        bannerArticleList: res.data.displayorder_data,
        imgRecommend: imgRecommend,
        imgRecommends: imgRecommends
      })
      that.getMyMsgNum()
    });
  },
  // 推荐上拉加载
  recommendOnRB: function() {
    const that = this;
    let [page_size, page_index] = [that.data.page_size, that.data.page_index + 1]
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      var tmpArticleList = that.data.articleList;
      var thread = res.data.forum_thread_data
      for (let i in thread) {
        if (thread[i].video) {
          that['videoContext' + thread[i].pid] = wx.createVideoContext('myVideo' + thread[i].pid)
        }
      }
      var newArticleList = tmpArticleList.concat(thread)
      that.setData({
        articleList: newArticleList,
        page_index: page_index,
        have_data: thread.length <= 0 ? false : true,
        nomore_data: thread.length > 0 ? false : true,
      })
    });
  },
  // 车代表
  vipCar: function() {
    var that = this;
    if (that.data.carViptag == 'carVipThread') {
      var page_size = that.data.page_CarVipSize;
      var page_index = that.data.page_CarVipIndex;
      request('post', 'get_carvip_thread.php', {
        token: wx.getStorageSync("token"),
        page_size: page_size,
        page_index: page_index
      }).then((res) => {
        that.setData({
          articleListCarVip: res.data.car_vip_thread_data,
          page_CarVipIndex: page_index,
          loading_hidden: true,
          loading_msg: '加载完毕...'
        })
      });
    } else if (that.data.carViptag == 'carVipUser') {
      var page_usersize = that.data.page_usersize;
      var page_userindex = that.data.page_userindex;
      request('post', 'get_carvip_user.php', {
        token: wx.getStorageSync("token"),
        page_size: page_usersize,
        page_index: page_userindex
      }).then((res) => {
        that.setData({
          userList: res.data.car_vip_user_data,
          page_index: page_userindex,
          loading_hidden: true,
          loading_msg: '加载完毕...'
        })
      });
    } else {
      that.getApplyCarOwner()
    }
  },
  getApplyCarOwner: function() {
    var that = this
    request('post', 'get_apply_car_owner.php', {
      token: wx.getStorageSync("token"),
    }).then((res) => {
      const applyStatus = res.data.status
      let applyTest
      //applyStatus1：已成为车代表 2：拒绝 3：已申请车代表 4：可以申请
      if (applyStatus == 1) {
        applyTest = '已审核通过'
      } else if (applyStatus == 2) {
        applyTest = '审核未通过'
      } else if (applyStatus == 3) {
        applyTest = '已申请'
      } else {
        applyTest = '一键申请'
      }
      that.setData({
        applyStatus: applyStatus,
        applyTest: applyTest,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })
  },
  applyCarOwner: function() {
    const that = this
    if (wx.getStorageSync("has_login") != 1) {
      that.setData({
        showAuthorization: true
      })
      return
    }
    if (that.data.applyStatus == 4 || that.data.applyStatus == 2 && that.data.checkRead == true) {
      request('post', 'add_apply_car_owner.php', {
        token: wx.getStorageSync("token"),
        type: 1
      }).then((res) => {
        const status = res.data.status
        if (status == 1) {
          wx.showToast({
            title: '申请成功',
            icon: 'success',
            duration: 2000,
          })
        } else {
          const url = res.data.url
          const msg = res.data.msg
          wx.showToast({
            title: msg,
            duration: 2000,
          })
          if (url) {
            setTimeout(() => {
              wx.switchTab({
                url: url,
              })
            })
          }
        }
        setTimeout(() => {
          that.getApplyCarOwner()
        }, 100)
      })
    }
  },
  vipCarOnRB: function() {
    var that = this;
    if (that.data.carViptag == 'carVipThread') {
      var page_size = that.data.page_CarVipSize;
      var page_index = that.data.page_CarVipIndex + 1;
      request('post', 'get_carvip_thread.php', {
        token: wx.getStorageSync("token"),
        page_size: page_size,
        page_index: page_index
      }).then((res) => {
        var tmpArticleList = that.data.articleListCarVip;
        var respArticleList = res.data.car_vip_thread_data;
        var newArticleList = tmpArticleList.concat(respArticleList)
        that.setData({
          articleListCarVip: newArticleList,
          page_CarVipIndex: page_index,
          have_data: respArticleList.length <= 0 ? false : true,
          nomore_data: respArticleList.length > 0 ? false : true,
        })
      });
    } else if (that.data.carViptag == 'carVipUser') {
      var page_usersize = that.data.page_usersize;
      var page_userindex = that.data.page_userindex + 1;
      request('post', 'get_carvip_user.php', {
        token: wx.getStorageSync("token"),
        page_size: page_usersize,
        page_index: page_userindex
      }).then((res) => {
        var tmpUserList = that.data.userList;
        var resUserList = res.data.car_vip_user_data;
        var newUserList = tmpUserList.concat(resUserList)
        that.setData({
          userList: newUserList,
          page_userindex: page_userindex,
          have_data: resUserList.length <= 0 ? false : true,
          nomore_data: resUserList.length > 0 ? false : true,
        })
      })
    } else {
      that.setData({
        have_data: false,
        nomore_data: false,
      })
    }
  },
  checkboxChange: function() {
    var that = this
    that.setData({
      checkRead: !that.data.checkRead,
    })
  },
  toCarVip: function() {
    var that = this
    that.setData({
      tab: 'vipCar',
      carViptag: 'carVipApply'
    })
    that.getApplyCarOwner()
  },
  // 口碑点击跳转
  parsePrice: function(e) {
    const that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/praise/pages/praise_index/praise_index?item=' + item,
    })
  },
  // 吐槽
  forumList: function() {
    var that = this;
    var page_size = that.data.page_ForumlistSize;
    var page_index = that.data.page_ForumlistIndex;
    request('post', 'get_complaint_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      that.setData({
        articleListForumlist: res.data.complaint_thread_data,
        page_ForumlistIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    })

  },
  // 吐槽下拉加载
  forumListOnRB: function() {
    var that = this;
    var page_size = that.data.page_ForumlistSize;
    var page_index = that.data.page_ForumlistIndex + 1;
    request('post', 'get_complaint_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      var tmpArticleList = that.data.articleListForumlist;
      var respArticleList = res.data.complaint_thread_data;
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        articleListForumlist: newArticleList,
        page_ForumlistIndex: page_index,
        have_data: respArticleList.length <= 0 ? false : true,
        nomore_data: respArticleList.length > 0 ? false : true,
      })
    });
  },

  //话题
  topicList: function() {
    var that = this;
    var page_size = that.data.page_topicSize;
    var page_index = that.data.page_topicIndex;
    request('post', 'get_forum_topic.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      that.setData({
        topic_min: res.data.min,
        topic_max: res.data.max,
        topic_banner: res.data.banner,
        page_topicIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },
  //话题下拉加载
  topicListOnRB: function() {
    var that = this;
    var page_size = that.data.page_topicSize;
    var page_index = that.data.page_topicIndex + 1;
    request('post', 'get_forum_topic.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index
    }).then((res) => {
      var tmpArticleList = that.data.topicList;
      var respArticleList = res.data.forum_forum_data;
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        topicList: newArticleList,
        page_index: page_index,
        have_data: respArticleList.length <= 0 ? false : true,
        nomore_data: respArticleList.length > 0 ? false : true,
      })
    });
  },

  //E讯
  eNews: function() {
    var that = this;
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    that.requestEinfoList() //E讯列表

    request('post', 'get_banner.php', {
      token: wx.getStorageSync("token"),
      type: 3
    }).then((res) => {
      let banner_data = res.data.banner_data
      that.setData({
        imgEnews: banner_data
      })
    });
  },
  //E讯下拉加载
  eNewsOnRB: function() {
    var that = this;
    var page_size = that.data.page_eSize;
    var page_index = that.data.page_eIndex + 1;
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      fup: 82
    }).then((res) => {
      var tmpArticleList = that.data.einfoList;
      var respArticleList = res.data.forum_thread_data;
      var newArticleList = tmpArticleList.concat(respArticleList)
      that.setData({
        einfoList: newArticleList,
        page_eIndex: page_index,
        have_data: respArticleList.length <= 0 ? false : true,
        nomore_data: respArticleList.length > 0 ? false : true,
      })
    });
  },
  //E讯列表
  requestEinfoList: function() {
    var that = this;
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    });
    var page_size = that.data.page_eSize;
    var page_index = that.data.page_eIndex;
    request('post', 'get_thread.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: page_index,
      fup: 82
    }).then((res) => {
      that.setData({
        einfoList: res.data.forum_thread_data,
        page_topicIndex: page_index,
        loading_hidden: true,
        loading_msg: '加载完毕...'
      })
    });
  },

  /* 下拉刷新 */
  // onPullDownRefresh: function() {
  //   const that = this
  //   if (that.data.tab == 'recommend') {
  //     that.recommendPullDown()
  //   } else {
  //     that.reloadIndex()
  //   }
  //   wx.stopPullDownRefresh();

  // },

  /* 分享 */
  onShareAppMessage: function(res) {
    const shareTitle = getApp().globalData.shareTitle
    const tab = this.data.tab
    return {
      title: shareTitle,
      path: `/pages/index/index?tab=${tab}`
    }
  },
  /* 返回顶 */
  onPageScroll: function(e) {
    const that = this
    let eScrollTop = e.scrollTop
    let dataScrollTop = that.data.scrollTop
    if (e.scrollTop >= 600 && dataScrollTop < 600) {
      this.setData({
        scrollTop: eScrollTop
      })
    } else if (eScrollTop < 600 && dataScrollTop >= 600) {
      this.setData({
        scrollTop: eScrollTop
      })
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
  selfMessage: function() {
    const that = this
    wx.navigateTo({
      url: '../message/message?type=3'
    })
    setTimeout(() => {
      that.hideShareBox()
    }, 300)
  },
  onNODone: function() {
    app.wxShowToast('该功能开发中...', 1500, 'none')
  },
  questionTap: function() {
    wx.navigateTo({
      url: '/question/pages/question/question'
    })
  },
  emptytap: function() {},
  play: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    let showCoverId = that.data.showCoverId

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
  pauseTap: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid
    let showCoverId = that.data.showCoverId
    // that['videoContext' + pid].pause()
    // that.setData({
    //   showCoverId: pid == showCoverId ? 0 : showCoverId
    // })
  },
  dd: function(e) {
console.log(e)
  },
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

})