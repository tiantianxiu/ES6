var app = getApp()
import {
  request
} from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '加载中...',
    budget4: [],
    budget2: [],
    budget3: [],
    heightMt: app.globalData.heightMt + 20 * 2,
    wtCash: false,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1,
      title: '我的问答', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    that.setData({
      loading_hidden: false
    })
    that.getBudgetLog()
  },
  companyPay: function () {
    const that = this
    let balance = that.data.balance

    request('post', 'company_pay.php', {
      token: wx.getStorageSync('token'),
      price: balance > 200 ? 200 : balance
    }).then((res) => {
      that.setData({
        loading_hidden: true
      })
      if (res.err_code != 0)
        return
      wx.showToast({
        title: '提现成功'
      },
        that.getBudgetLog()
      )
    })
  },
  getBudgetLog: function () {
    const that = this
    request('post', 'get_user_budget_log.php', {
      token: wx.getStorageSync('token')
    }).then((res) => {
      if (res.err_code != 0)
        rerurn
      let balance = res.data.balance,
        budget = res.data.budget
      that.setData({
        balance: balance,
        budget: budget,
        loading_hidden: true
      })
    })
  },
  budgetap: function (e) {
    const that = this
    let item = e.currentTarget.dataset.item,
      id = e.currentTarget.dataset.id
    that.setData({
      [item]: that.data[item].length == 0 ? that.data.budget[id] : ''
    })
  },
  isCashTap: function () {
    const that = this
    wx.showToast({
      title: '您的余额不够两元',
      icon: 'none'
    })
  },
  cashTap: function () {
    const that = this
    that.setData({
      wtCash: !that.data.wtCash
    })
  },
  havCashTap: function () {
    const that = this
    if (that.data.balance > 200) {
      wx.showModal({
        title: '提示',
        content: '您余额超过200元，点击确定您将提现200元！',
        success(res) {
          if (res.confirm) {
            that.setData({
              loading_hidden: false,
              loading_msg: '提现中...',
            })
            that.companyPay()
          }
          that.cashTap()
        }
      })
      return
    }
    that.setData({
      loading_hidden: false,
      loading_msg: '提现中...',
    })
    that.companyPay()
    that.cashTap()
  },

  todetail: function (e) {
    const that = this
    let item = e.currentTarget.dataset.item,
      key = e.currentTarget.dataset.key
    if (key) {
      wx.navigateTo({
        url: `../${item}/${item}?key=${key}`
      })
      return
    }
    wx.navigateTo({
      url: `../${item}/${item}`
    })
  },

})