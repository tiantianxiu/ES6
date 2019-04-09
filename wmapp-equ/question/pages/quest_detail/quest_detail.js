// pages/question/question.js
var WxParse = require('../../../wxParse/wxParse.js');
var app = getApp()
import {
  wxParseImgTap
} from '../../../wxParse/wxParse.js'
import {
  request,
  myTrim,
  transformPHPTime
} from '../../../utils/util.js'
Page({
  /**
   * 页面的初始数据 
   */
  data: {
    loading_hidden: false,
    loading_msg: '加载中...',
    page_index: 0,
    page_size: 5,
    replyType: 1,
    showReply: true,
    is_admin: 0,
    is_share: 0,
    //精华
    digestLevel: [
      '取消置顶',
      '置顶'
    ],
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '问答', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this
    const tid = options.id
    that.setData({
      tid: tid
    })
  },
  onShow: function() {
    const that = this
    that.data.page_index = 0
    that.data.articleList = []
    that.getPostDetail()
  },
 
  getPostDetail: function() {
    var that = this
    request('post', 'get_question_detail.php', {
      token: wx.getStorageSync("token"),
      // token: '111122dd',
      tid: that.data.tid,
    }).then((res) => {

      that.setData({
        loading_hidden: true,
        loading_msg: '加载完毕...',
        fontS: 34
      })
      //问答已被删除
      if (res.data.status == -1) {
        app.wxShowToast('该问答已被删除', 1500, 'none')
        setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          },
          1500)
        return
      }
      let thread_data = res.data.thread_data
      if (thread_data.is_reward == 1 || thread_data.has_reply == 1 || thread_data.is_self == 1 || thread_data.is_reply != 1)
        that.setData({
          showReply: false
        })
      res.data.thread_data.time = transformPHPTime(res.data.thread_data.dateline)

      let member_tag = thread_data.member_tag
      if (member_tag != 0) {
        member_tag = member_tag.split(',')
      }
      var extcredits2 = thread_data.extcredits2 + ''
      thread_data.extcredits2_arr = extcredits2.split('')
      that.setData({
        thread_data: thread_data,
        is_admin: thread_data.is_admin,
        member_tag: member_tag
      })
      let disableMsg = '',
        showUnVip = false,
        btnMsg = ''
      if (thread_data.is_reply == 0) {
        showUnVip = true
        disableMsg == '为保证回答质量，需认证车主才能回答'
      }

      if (thread_data.has_reply == 1) {
        showUnVip = true
        btnMsg = '已回答'
      }
      if (thread_data.is_reward == 1) {
        showUnVip = true
        btnMsg = '已采纳'
      }
      if (thread_data.is_self == 1) {
        showUnVip = false
      }
      that.setData({
        showUnVip: showUnVip,
        btnMsg: btnMsg,
        disableMsg: disableMsg
      })
      if (thread_data.is_reward == 1 || thread_data.is_self == 0) {
        that.setData({
          show_reward: false
        })
      } else {
        that.setData({
          show_reward: true
        })
      }

      that.getComment()
    });
  },

  getComment: function() {
    const that = this
    let page_size = that.data.page_size,
      page_index = that.data.page_index

    request('post', 'get_question_detail_comment.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: page_index
    }).then((res) => {

      let respArticleList = res.data.post_list
      for (let i in respArticleList) {
        respArticleList[i].time = transformPHPTime(respArticleList[i].dateline)
        var extcredits2 = respArticleList[i].extcredits2 + ''
        respArticleList[i].extcredits2_arr = extcredits2.split('')
      }
      let tmpArticleList = that.data.articleList
      let newArticleList = tmpArticleList ? tmpArticleList.concat(respArticleList) : respArticleList
      let post_list_length = res.data.post_list.length

      let price_abs = 0.00
      let total_num = res.data.total_num,
        thread_data = that.data.thread_data
      if (thread_data.is_reward == 1 && thread_data.reward_type == 2) {
        price_abs = (thread_data.question_price / total_num).toFixed(2)
      }

      that.setData({
        articleList: newArticleList,
        total_num: total_num,
        price_abs: price_abs,
        have_data: false,
        loading_hidden: true,
        nomore_data: post_list_length < page_size ? true : false
      })

    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    const that = this

    let page_index = that.data.page_index + 1
    if (that.data.nomore_data == true)
      return
    that.setData({
      page_index: page_index
    })
    that.setData({
      have_data: true
    }, that.getComment())

  },
  formIdSubmit: function (e) {
    app.formIdSubmit(e)
  },
  toUserDetail: function(e) {
    app.toUserDetail(e)
  },

  addPost: function(e) {
    const that = this
    const message = e.detail.message
    const aidList = e.detail.aidList || ''
    const attachment = e.detail.attachment || 0

    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    request('post', 'add_question_reply.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      aid_list: aidList,
      message: message,
      attachment: attachment
    }).then((r) => {
      if (r.err_code != 0) {
        that.setData({
          loading_hidden: true
        })
        wx.showToast({
          title: '错误!',
          icon: 'none'
        })
        that.postSuccess()
        return
      }
      if (r.data.status == -1) {
        wx.showToast({
          title: r.data.message,
          icon: 'none'
        })
        return
      }
      that.setData({
        loading_hidden: true,
        loading_msg: '加载完成',
        textContent: '',
        total_num: that.data.total_num + 1
      })
      wx.showToast({
        title: '回答成功！',
        icon: 'success',
        duration: 2000
      })
      that.postSuccess()
      let datae = {
        pid: r.data.pid,
        type: 1,
        tid: that.data.tid,
        uid: that.data.thread_data.authorid
      }
      
      that.formIdSubmit(datae)
    })
  },
  // 回复成功
  postSuccess: function() {
    const that = this
    that.setData({
      page_index: 0,
      showReply: false,
      articleList: []
    })
    that.getComment()
    that.selectComponent("#reply-quest").resetData()
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
    console.log("showAuthorization")
    that.setData({
      showAuthorization: true
    })
  },
  wxParseImgTap: function(e) {
    const that = this
    e.urls = that.data.thread_data.image_list
    wxParseImgTap(e)
  },
  toQuestDiague: function(e) {
    const that = this
    let pid = e.currentTarget.dataset.pid,
      tid = e.currentTarget.dataset.tid
    wx.navigateTo({
      url: `../quest_dialogue/quest_dialogue?pid=${pid}&tid=${tid}`
    })
  },
  averageTap: function(e) {
    const that = this

    let reward_type = e.currentTarget.dataset.reward_type,
      pid = e.currentTarget.dataset.pid || 0,
      uid = e.currentTarget.dataset.uid || 0

    let data = {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      pid: pid || 1,
      reward_type: reward_type,
      type: 4,
      uid: uid
    }
    if (that.data.question_price) {
      that.questReward(data)
      return
    }
    let msg = '是否均分打赏'
    if (pid){
      msg = '是否打赏'
      data.type = 3
    }
    app.showSelModal(msg, true).then((res) => {
      if (res)
        that.questReward(data)
    })
  },

  questReward: function(data) {
    const that = this
    request('post', 'add_question_reward.php', data).then((res) => {
      if (res.err_code != 0)
        return
      if (res.data.status == -1) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        return
      }
      that.setData({
        articleList: []
      })
      that.getPostDetail()
      wx.showToast({
        title: '打赏成功'
      })
        that.formIdSubmit(data)
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this,
      thread_data = that.data.thread_data
    let title = '用户' + thread_data.author + '提了一个问题'
    if (thread_data.question_price != '0.00') {
      title = thread_data.author + '提了一个问题并悬赏' + thread_data.question_price + '元'
    }
    return {
      title: that.data.thread_data.subject,
      path: `/pages/index/index?shareName=quest_detail&shareId=${that.data.tid}&root=question`
    }
  },
  toSet: function() {
    const that = this
    that.setData({
      is_share: that.data.is_share == 1 ? 0 : 1
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
        app.wxShowToast('设置成功!', 1500)
        that.setData({
          'thread_data.digest': digest - 1,
          is_share: 0
        })
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
  //弹出修改管理员浏览数input
  postViews: function(e) {
    const that = this
    if (that.data.editViews) {
      that.setData({
        editViews: false
      })
      return
    }
    that.setData({
      editViews: true
    })
  },
  inputViews: function(e) {
    const that = this
    that.setData({
      views: e.detail.value //设置数
    });
  },
  submitViews: function() {
    const that = this
    let views = that.data.views
    let reg = "^[0-9]*[1-9][0-9]*$"
    if (!views) {
      app.showErrModal('设置不能为空')
      return
    }
    if (!views.match(reg)) {
      app.showErrModal('只能正整数')
      return
    }
    if (views.length > 6) {
      app.showErrModal('长度不能超过6位')
      return
    }
    request('post', 'add_thread_views.php', {
      token: wx.getStorageSync('token'),
      tid: that.data.tid,
      views: views
    }).then((res) => {
      if (res.err_code == 0) {
        app.wxShowToast(res.data.message).then(() => {
          if (res.data.status < 0)
            return
          setTimeout(() => {
            that.setData({
              'thread_data.views': views,
              editViews: false
            })
          }, 1000)
        })
      } else {
        app.wxShowToast('修改失败')
      }
    })
  },
  formSubmit: function(e) {
    const that = this
    app.formSubmit(e)
  },
})