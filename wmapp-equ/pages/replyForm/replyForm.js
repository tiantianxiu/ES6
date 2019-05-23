// detail.js
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp()
import {
  request,
  transformPHPTime
} from '../../utils/util.js'
Page({
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',

    scrollTop: 0, //滑动高度
    page_index: 0,
    page_size: 10,

    message: '',
    // 显示点赞需要的参数
    is_zan: '', //0没有 1赞 2踩
    type: 1,
    showZhan: true,
    tid: 0,
    // 显示收藏需要的参数
    showFavorite: true,
    is_favorite: '',
    idtype: 'tid',
    // showAuthorization: false,
    // 显示评论数
    showReplies: true,
    showCai: true,
    showZan: true,
    reply: 0,
    stamp_index: 0, //图章index
    focus: false,
   
    showShareBox: false,
    is_share: 0, //分享页面前后，管理员按钮是否存在 1是存在 0是分享中不存在
    heightMt: app.globalData.heightMt + 20 * 2,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      title: '评论详情', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    let pid = options.pid || 0
    let tid = options.tid || 0
    let focus = options.focus
    that.setData({
      pid: pid,
      uppid: pid,
      tid: tid
    })
    if (focus)
      that.selectComponent('#replyTail').showreplyFormFun()
    
    that.reloadIndex()
  },

  reloadIndex: function() {
    var that = this
    that.setData({
      loading_hidden: false,
      loading_msg: '加载中...'
    })
    that.getComment()

  },

  getComment: function() {
    const that = this
    let page_size = that.data.page_size
    request('post', 'get_post_detail_comment_single.php', {
      token: wx.getStorageSync("token"),
      page_size: page_size,
      page_index: 0,
      pid: that.data.pid,
    }).then((res) => {
      if(res.err_code != 0)
        return
      if (that.data.action && that.data.action == 'reply') {
        that.selectComponent('#replyTail').showreplyFormFun()
        that.setData({
          focus: true
        })
      }
      let post_data = res.data.post_data
      let reply = res.data.reply
      let data_length = reply.length

      post_data.time = transformPHPTime(post_data.dateline)
      if (reply.length > 0)
        for (let i in reply) {
          reply[i].time = transformPHPTime(reply[i].dateline)
        }
   
      that.setData({
        loading_hidden: true,
        loading_msg: '加载完成。',
        post_data: post_data,
        reply_data: reply,
        to_author: post_data.author,
        reply_num: res.data.reply_num,
        have_data: data_length < page_size ? false : true,
        nomore_data: data_length < page_size ? true : false
      })
    })
  },

  radioTap: function(e) {
    const that = this
    let optionid = e.currentTarget.dataset.optionid,
      index = e.currentTarget.dataset.index,
      optionids = [],
      polloption = that.data.polloption
    for (let i = 0; i < polloption.length; i++) {
      that.setData({
        ['polloption[' + i + '].checked']: false
      })
    }
    that.setData({
      ['polloption[' + index + '].checked']: true
    })
    optionids.push(optionid)
    that.setData({
      optionids: optionids
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
      reply_pid: that.data.pid || 0,
      aid_list: aidList,
      message: message,
      attachment: attachment
    }).then((r) => {
      if (r.err_code != 0)
        return
      if (r.data.status == -1) {
        that.setData({
          loading_hidden: true
        })
        app.wxShowToast(r.data.message, 2000, 'none')
        return
      }
      console.log(r.err_code)
      that.setData({
        textContent: '',
        loading_msg: '加载完毕...',
        loading_hidden: true,
        reply_pid: 0,
        total_num: that.data.total_num + 1
      })
      wx.showToast({
        title: r.data.credits ? '已评论，电量+' + r.data.credits : '评论成功！',
        icon: 'success',
        duration: 2000,
      })
      that.getComment()     

      that.selectComponent("#replyTail").resetData()
    });
  },

  // 评论回复
  replyComment: function(e) {
    const that = this
    const uppid = e.currentTarget.dataset.uppid
    const reply_pid = e.currentTarget.dataset.pid
    const author = e.currentTarget.dataset.author
    that.setData({
      uppid: uppid,
      pid: reply_pid,
      to_author: author
    })
    
    that.isShowAuthorization().then((res) => {
      if (res == true) {
        that.selectComponent("#replyTail").showreplyFormFun()
      }
    })
  },


  //管理员删评论
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
    request('post', 'get_post_detail_comment_single.php', {
      token: wx.getStorageSync("token"),
      tid: that.data.tid,
      page_size: page_size,
      page_index: page_index

    }).then((res) => {
      let post_list = res.data.post_list;
      let tmpArticleList = that.data.articleList;
      if (post_list.length > 0)
        for (let i in post_list) {
          post_list[i].time = transformPHPTime(post_list[i].dateline)
        }
      let newArticleList = tmpArticleList.concat(post_list)
      let post_list_length = res.data.post_list.length

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

  // 点赞
  clickZan: function(e) {
    const that = this
    const type = e.currentTarget.dataset.type //1赞 2踩
    const is_zan = e.currentTarget.dataset.iszan
    const pid = e.currentTarget.dataset.pid
    const index = e.currentTarget.dataset.index
    const name = e.currentTarget.dataset.name
    const number = e.currentTarget.dataset.number
    that.isShowAuthorization().then((res) => {
      if (res == true) {
          request('post', 'add_zan_post.php', {
            token: wx.getStorageSync("token"),
            tid: that.data.tid,
            type: type,
            pid: pid
          }).then((res) => {
            let indexNum
            if (type == 1) {
              indexNum = 1
            } else {
              indexNum = 2
            }
            if (name == 'post_data'){
              let postData
              if (type == 1) {
                postData = name + '.zan'
              } else {
                postData = name + '.cai'
              }
              let posIndexIs =   name +'.is_zan'
              that.setData({
                [posIndexIs]: is_zan == indexNum ? 0 : indexNum,
                [postData]: is_zan == indexNum ? parseInt(number) - parseInt(1) : parseInt(number) + parseInt(1)
              })
              if (is_zan && is_zan != indexNum) {
                let articlePostIndex, articlePostData
                if (is_zan == 1) {
                  articlePostIndex = name + '.zan'
                  articlePostData = that.data.post_data.zan
                } else {
                  articlePostIndex = name + '.cai'
                  articlePostData = that.data.post_data.cai
                }
                that.setData({
                  [articlePostIndex]: parseInt(articlePostData) - parseInt(1)
                })
              }
              return
            }
            let replyData,
              repIndexIs = 'reply_data[' + index + '].is_zan'
            if (type == 1) {
              replyData = 'reply_data[' + index + '].zan'
            } else {
              replyData = 'reply_data[' + index + '].cai'
            }
            that.setData({
              [repIndexIs]: is_zan == indexNum ? 0 : indexNum,
              [replyData]: is_zan == indexNum ? parseInt(number) - parseInt(1) : parseInt(number) + parseInt(1)
            })
            if (is_zan && is_zan != indexNum) {
              let articlePostIndex, articlePostData
              if (is_zan == 1) {
                articlePostIndex = 'reply_data[' + index + '].zan'
                articlePostData = that.data.reply_data[index].zan
              } else {
                articlePostIndex = 'reply_data[' + index + '].cai'
                articlePostData = that.data.reply_data[index].cai
              }

              that.setData({
                [articlePostIndex]: parseInt(articlePostData) - parseInt(1)
              })
            }
          })
        
      }
    })
  },

  //子组件点赞的返回
  myZan: function(e) {
    const that = this
    let artIndexIs = e.detail.artIndexIs,
      articleListIndex = e.detail.articleListIndex,
      indexNum = e.detail.indexNum,
      number = e.detail.number
    that.setData({
      [artIndexIs]: indexNum,
      [articleListIndex]: parseInt(number) + parseInt(1)
    })
  },

  onShareAppMessage: function(res) {
    const that = this
    return {
      title: that.data.thread_data.subject,
      path: `/pages/index/index?shareName=detail&shareId=${that.data.tid}`,
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
  previewImage(e) {
    app.previewImage(e)
  }



})