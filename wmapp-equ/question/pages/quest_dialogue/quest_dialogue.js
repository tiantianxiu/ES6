var app = getApp()
import {
  request,
  addClass,
  myTrim,
  transformPHPTime
} from '../../../utils/util.js'
var WxParse = require('../../../wxParse/wxParse.js');
Page({
  data: {
    showReply: false, //是否显示回复框
    focus: false,
    message: '',
    windowHeight: app.globalData.windowHeight,
    plid: '',
    uid: 0,
    dialogueList: '',
    type: 2, //1:post 2:msg 3:system
    focus: false,

    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '对话详情', //导航栏 中间的标题
    }
  },

  onLoad: function(options) {
    const that = this
    const pid = options.pid
    const tid = options.tid
    that.setData({
      pid: pid,
      tid: tid
    })
    that.reloadIndex()
    that.pageUrl()
  },
  pageUrl: function() {
    const that = this
    let page = '/pages/index/index?shareName=quest_detail&shareId=' + that.data.tid
    that.setData({
      page: page
    })
  },
  reloadIndex: function(p) {
    const that = this
    this.setData({
      loading_hidden: false,
      loading_msg: '加载中...',
    });
    request('post', 'get_question_dialogue.php', {
      token: wx.getStorageSync("token"),
      pid: that.data.pid,
      tid: that.data.tid
    }).then((res) => {
      if (res.err_code != 0)
        return
      if (!res.data.is_can_reply || res.data.is_reward || res.data.is_show_pid) {
        that.setData({
          hasTall: false
        })
      } else {
        that.setData({
          hasTall: true
        })
      }
      if (res.data.is_luozhu && !res.data.is_reward && !res.data.is_show_pid) {
        that.setData({
          is_luozhu: true
        })
      } else {
        that.setData({
          is_luozhu: false
        })
      }
      let dialogue = res.data.dialogue
      for (let i in dialogue) {
        dialogue[i].time = transformPHPTime(dialogue[i].dateline)
      }
      let dialogueListamp = res.data.dialogue,
        length = dialogueListamp.length,
        lis = {}

      if (res.data.reward_type == 3) {
        lis.author = dialogueListamp[0].author
        lis.authorid = dialogueListamp[0].authorid
        lis.right = dialogueListamp[0].right
        lis.avatar = dialogueListamp[0].avatar
        lis.message = '问题超过3天未采纳答案，系统已自动选择最佳答案！'
        lis.time = ' '
      } else if (res.data.reward_type == 1 && res.data.is_show_pid == 1) {
        lis.author = dialogueListamp[0].author
        lis.authorid = dialogueListamp[0].authorid
        lis.right = dialogueListamp[0].right
        lis.avatar = dialogueListamp[0].avatar
        lis.message = '您的回答很棒，特此采纳！'
        lis.time = ' '
      }
      if (Object.keys(lis).length != 0 ){
        dialogue.push(lis)
      }
      for(let i in dialogue){
        if (dialogue[i].right == 0){
          that.setData({
            uid: dialogue[i].authorid
          })
          break
        }
      }
  
      that.setData({
        dialogueList: dialogue,
        is_can_reply: res.data.is_can_reply,
        loading_hidden: true,
        loading_msg: '加载完毕'
      })
      if (p)
        that.scrollTobuttom()
    })
  },
 
  changeTab: function(e) {
    var that = this
    var type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '/user/pages/message/message?type=' + type,
    })
  },

  addPost: function(e) {
    const that = this
    const message = e.detail.message,
      aid_list = e.detail.aid_list,
      attachment = e.detail.attachment
    request('post', 'add_question_reply.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      pid: that.data.pid,
      message: message,
      aid_list: aid_list || '',
      attachment: attachment || 0,
    }).then((r) => {
      if(r.err_code != 0)
        return
      let data = {
        pid: r.data.pid,
        type: that.data.is_luozhu ? 2 : 1,
        tid: that.data.tid,
        uid: that.data.uid
      }
      that.formIdSubmit(data)

      that.reloadIndex('post')
      that.selectComponent("#reply-quest").resetData()
    })
  },
  formIdSubmit: function (e) {
    app.formIdSubmit(e)
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
  imagePreview: function(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  },
  showAuthorization: function() {
    const that = this
    that.setData({
      showAuthorization: true
    })
  },
  scrollTobuttom: function() {
    const that = this
    wx.createSelectorQuery().select('#dialogueList').boundingClientRect(function(rect) {
      wx.pageScrollTo({
        scrollTop: rect.bottom
      })
    }).exec()
  },
  acceptTap: function() {
    const that = this
    app.showSelModal('是否采纳?', true).then((res) => {
      if (res)
        that.acceptTaps()
    })
  },
  acceptTaps: function() {
    const that = this
    let pid = that.data.pid,
      tid = that.data.tid
    request('post', 'add_question_reward.php', {
      token: wx.getStorageSync("token"),
      tid: tid,
      pid: pid,
      reward_type: 1
    }).then((res) => {
      if (res.err_code != 0)
        return
      if (res.data.status == -1) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        return
      }
      let data = {
        tid: tid,
        pid: pid,
        type: 3,
        uid: that.data.uid
      }
      that.reloadIndex('post')
      that.formIdSubmit(data)
    })
  },
  formIdSubmit: function (e) {
    app.formIdSubmit(e)
  },
  toUserDetail: function (e) {
    app.toUserDetail(e)
  },

})