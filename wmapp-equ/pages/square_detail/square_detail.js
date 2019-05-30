// detail.js
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp()
import {
  request,
  myTrim,
  contains,
  transformPHPTime
} from '../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    scrollTop: 0, //滑动高度
    page_index: 0,
    page_size: 5,
    new_reader: 0,

    pid: 0, //0表示评论，回复评论用评论的pid
    articleList: '',
    message: '',
    // 显示点赞需要的参数
    is_zan: '', //0没有 1赞 2踩
    type: 1,
    showZhan: true,
    tid: 0,
    // 显示收藏需要的参数
    showFavorite: true,
    idtype: 'tid',
    // showAuthorization: false,
    // 显示评论数
    showReplies: true,
    showCai: true,
    showZan: true,
    reply: 0,
    stamp_index: 0, //图章index
    focus: false,
    thread_data: '',
    showShareBox: false,
    is_share: 0, //分享页面前后，管理员按钮是否存在 1是存在 0是分享中不存在
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      shareImg: 1,
      showCapsule: 1, //是否显示左上角图标,
      transparent: 1,
      title: '广场详情', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this

    let tid
    if (options.id) {
      tid = options.id
    } else {
      tid = options.tid
    }

    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      const tidVal = scene.split('=')
      tid = tidVal[1]
    }

    let reply = 0
    if (options.reply) {
      reply = options.reply
    }
    this.setData({
      tid: tid,
      new_reader: 1,
      reply: reply
    })

    if (options.messagePid) {
      this.setData({
        messagePid: options.messagePid
      })
    }
    if (options.action)
      that.setData({
        action: options.action
      })
    that.reloadIndex()
  },

  reloadIndex: function() {
    var that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    that.getPostDetail()
    wx.onUserCaptureScreen(function(res) {
      console.log('用户截屏了')
      that.setData({
        showShareBox: true
      })
    })
  },

  // 管理员点开所有设置
  toSet: function() {
    const that = this
    let is_share = that.data.is_share ? 0 : 1
    if (that.data.is_admin == 1 && is_share)
      that.getStamp() // 获得图章列表
    that.setData({
      is_share: is_share
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })


  },
  //管理员设置图章
  setStamp: function(e) {
    const that = this
    let index = parseInt(e.detail.value) - 1,
      tid = that.data.tid,
      displayorder, stampCode
    if (index != -1) {
      displayorder = that.data.common_stamp[index].displayorder
      stampCode = that.data.common_stamp[index].code
    } else {
      displayorder = -1
      stampCode = '取消'
    }
    request('post', 'set_stamp.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      displayorder: displayorder
    }).then((res) => {

      if (res.data.status == 1) {
        app.wxShowToast(stampCode + res.data.message, 1500)
        that.setData({
          'thread_data.stamp': index >= 0 ? that.data.common_stamp[index].url : ''
        })
      }
    })

  },
  //管理员设置精华
  setDigest: function(e) {
    const that = this
    let digest = parseInt(e.detail.value) + 1,
      tid = that.data.tid
    if (digest - 1 == that.data.thread_data.digest) {
      app.wxShowToast('没有修改', 1500)
      return
    }
    request('post', 'set_digest.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      digest: digest
    }).then((res) => {
      if (res.data.status == 1) {
        app.wxShowToast(that.data.digestLevel[digest - 1] + res.data.message, 1500)
        that.setData({
          'thread_data.digest': digest - 1
        })
      }

    })
  },
  //清除缓存
  cleanCache: function(e) {
    const that = this
    let type = parseInt(e.detail.value) + 1
    let data = {
      token: wx.getStorageSync("token"),
      type: type
    }
    if (type > 2) {
      data.typeid = that.data.tid
    }
    request('post', 'del_syscache.php', data)
      .then((res) => {
        if (res.data.status == 1) {
          app.wxShowToast(that.data.cleanCacheSel[type - 1] + res.data.message, 1500)
        }
      })
  },
  //置顶
  threadTopChange: function(e) {
    const that = this
    let type = parseInt(e.detail.value) + 1
    if (type - 1 == that.data.thread_data.displayorder) {
      app.wxShowToast('没有修改', 1500)
      return
    }
    request('post', 'add_thread_top.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      type: type
    }).then((res) => {
      let message = that.data.getTops[type - 1] //改了什么
      that.setData({
        'thread_data.displayorder': type - 1
      })
      app.wxShowToast(message + '成功', 1500)
    })
  },
  setPraises: function(e) {
    const that = this
    let index = parseInt(e.detail.value),
      tid = that.data.tid,
      praiseName = that.data.praises[index]

    request('post', 'set_price_recommend.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      type_price: index
    }).then((res) => {
      if (res.data.status == 1) {
        app.wxShowToast(praiseName + '设置成功', 1500)
      }

    })
  },
  // 关注与取消关注
  followBtn: function() {
    const that = this
    that.isShowAuthorization().then((res) => {
      if (!res)
        return
      let followStatus = that.data.thread_data.is_follow //0未关注 1已关注 2互相关注
      let e = {
        followuid: that.data.thread_data.authorid
      }
      app.followBtn(e).then((r) => {
        if (followStatus == 0) {
          wx.showToast({
            title: '关注成功',
            icon: 'success',
          })
          that.setData({
            ['thread_data.is_follow']: 1
          })
        } else {
          wx.showToast({
            title: '已取消关注',
            icon: 'success',
          })
          that.setData({
            ['thread_data.is_follow']: 0
          })
        }
      })
    })
  },
  // 获取帖子信息
  getPostDetail: function() {
    var that = this
    request('post', 'get_square_detail.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
    }).then((res) => {

      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        fontS: 34
      })

      //帖子已被删除
      if (res.data.status == -1) {
        app.wxShowToast(res.data.msg, 1500, 'none')
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
        return
      }
      let thread_data = res.data.thread

      let extcredits2 = thread_data.extcredits2 + ''

      thread_data.extcredits2_arr = extcredits2.split('')

      thread_data.time = transformPHPTime(thread_data.dateline)
    

      that.setData({
        thread_data: thread_data,
        is_zan: thread_data.is_zan,
        authorId: thread_data.authorid,
        new_reader: 0,
        'navbarData.transparent': res.data.cover ? 1 : 0
      })
      that.getComment()

      let share_img = 'http://cdn.e-power.vip/default_logo_none.jpg'
      if (thread_data.attachment == 2) {
        share_img = thread_data.image_list[0]
      } else if (thread_data.attachment == 1) {
        share_img = 'http://cdn.e-power.vip/default_logo.jpg'
      }
      that.setData({
        share_img: share_img
      })

     
      
    });
  },

  getComment: function() {
    const that = this
    let page_size = that.data.page_size
    request('post', 'get_square_detail_comment.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: 0,
    }).then((res) => {
      if (!res || res.err_code != 0)
        return
      let post_list = res.data.post
      let post_list_length = post_list.length

      if (post_list.length > 0)
        for (let i in post_list) {
          post_list[i].time = transformPHPTime(post_list[i].dateline)
        }
      
      that.setData({
        articleList: post_list,
        page_index: 0,
        have_data: post_list_length < page_size ? false : true,
        nomore_data: post_list_length < page_size ? true : false
      })
    })
  },

  addPost: function(e) {
    const that = this
    const message = e.detail.message
    const aidList = e.detail.aidList
    const attachment = e.detail.attachment
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'add_post.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      uppid: that.data.uppid || 0,
      reply_pid: that.data.reply_pid || 0,
      aid_list: aidList,
      message: message,
      attachment: attachment
    }).then((r) => {
      if (r.err_code != 0)
        return
      if (r.data.status == -1){
        wx.showToast({
          title: r.data.message,
          icon: 'none'
        })
        
        that.setData({
          loading_hidden: true,
        })
        return
      }  

      that.setData({
        textContent: '',
        loading_msg: '加载完毕...',
        loading_hidden: true,
        reply_pid: 0,
        ['thread_data.replies']: parseInt(that.data.thread_data.replies) + 1
      })
      wx.showToast({
        title: r.data.credits ? '已评论，电量+' + r.data.credits : '评论成功！',
        icon: 'success',
        duration: 2000,
      })
      
      that.scrollToBottom({
        detail: {
          id: '#articleWrap'
        }
      })
      that.getComment()
      that.setData({
        uppid: 0,
        reply_pid: 0,
        to_author: ''
      })
      that.selectComponent("#replyTail").resetData()
    });
  },
  hideReplyForm(){
    const that = this
    that.setData({
      uppid: 0,
      reply_pid: 0,
      to_author: ''
    })
  },
  scrollToBottom: function (e) {
    const that = this
    setTimeout(function () {
      const query = wx.createSelectorQuery()
      query.select(e.detail.id).boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {

        wx.pageScrollTo({
          scrollTop: res[0].top + res[1].scrollTop - (app.globalData.heightMt + 20 * 2),
          duration: 0
        })
      })
    }, 500)
  },
  // 评论回复
  replyComment: function (e) {
    const that = this
    const uppid = e.currentTarget.dataset.uppid
    const reply_pid = e.currentTarget.dataset.pid
    const author = e.currentTarget.dataset.author
    that.setData({
      uppid: uppid,
      reply_pid: reply_pid,
      to_author: author
    })

    that.isShowAuthorization().then((res) => {
      if (res == true) {
        that.selectComponent("#replyTail").showreplyFormFun()
      }
    })
  },
  //管理员删帖
  postDel: function(e) {
    var tid = e.currentTarget.dataset.tid,
      data = {
        token: wx.getStorageSync("token"),
        tid: tid
      }
    app.deleteNormal(data, 'del_thread.php', true)
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },


  onReachBottom: function() {
    const that = this
    that.setData({
      scrollTop: 300
    })
    let page_size = that.data.page_size
    let page_index = that.data.page_index + 1
    if (that.data.nomore_data == true)
      return

    request('post', 'get_square_detail_comment.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: page_index

    }).then((res) => {
      if (!res || res.err_code != 0)
        return
      let post_list = res.data.post
      let post_list_length = post_list.length
      let tmpArticleList = that.data.articleList;

      if (post_list.length > 0)
        for (let i in post_list) {
          post_list[i].time = transformPHPTime(post_list[i].dateline)
        }
      let newArticleList = tmpArticleList.concat(post_list)
      

      that.setData({
        have_data: post_list_length < page_size ? false : true,
        articleList: newArticleList,
        page_index: page_index,
        nomore_data: post_list_length < page_size ? true : false,
      })
    })
  },

  //回复删除
  replyDel: function(e) {
    const that = this
    let index = e.currentTarget.dataset.index,
      pid = e.currentTarget.dataset.pid,
      data = {
        token: wx.getStorageSync("token"),
        pid: pid
      }
    app.deleteNormal(data, 'del_reply.php').then((res) => {
      if (res.status < 0)
        return
      that.data.articleList.splice(index, 1)
      that.setData({
        articleList: that.data.articleList
      })
    })
  },

  // 点赞文章
  toZan: function (e) {
    const that = this
    const type = e.currentTarget.dataset.type //1赞 2踩
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        var is_zan = that.data.thread_data.is_zan

        request('post', 'add_zan.php', {
          token: wx.getStorageSync("token"),
          tid: that.data.tid,
          type: type
        }).then((res) => {
          if (res.err_code != 0)
            return

          if (type == 1) {
            that.setData({
              ['thread_data.is_zan']: is_zan == type ? 0 : 1,
              ['thread_data.zan']: is_zan == type ? parseInt(that.data.thread_data.zan) - 1 : parseInt(that.data.thread_data.zan) + 1,
              ['thread_data.cai']: is_zan == 2 ? parseInt(that.data.thread_data.cai) - 1 : that.data.thread_data.cai
            })
          } else {
            that.setData({
              ['thread_data.is_zan']: is_zan == type ? 0 : 2,
              ['thread_data.cai']: is_zan == type ? parseInt(that.data.thread_data.cai) - 1 : parseInt(that.data.thread_data.cai) + 1,
              ['thread_data.zan']: is_zan == 1 ? parseInt(that.data.thread_data.zan) - 1 : that.data.thread_data.zan
            })
          }

        })

      }
    })
  },


  onShareAppMessage: function(res) {
    const that = this
    return {
      title: that.data.thread_data.subject,
      path: `/pages/index/index?shareName=qdetail&shareId=${that.data.tid}`,
      imageUrl: app.globalData.is_android ? that.data.share_img : ''
    }
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
  headerShare: function() {
    const that = this
    that.selectComponent('#moreFunctions').showShareBox()
  },

  //跳转广场话题
  picTap: function(e) {
    const that = this
    let id = parseInt(e.currentTarget.dataset.typeid)
    wx.navigateTo({
      url: `/pages/square_pic/square_pic?id=${id}`
    })
  },

  previewImage(e) {
    app.previewImage(e)
  }
})