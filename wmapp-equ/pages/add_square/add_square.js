var app = getApp()
import {
  request,
  uploadFile
} from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading_hidden: true,
    loading_msg: '提交中...',
    video: '',
    image_list: [],
    aid_list: [],
    type: 0, //视频1 图片2 文字0
    progress: 0,
    pic: 0,
    focus: false,
    pic_text: '',
    page_index: 0,
    page_size:  10,
    thread: [],
    showProgress: false,
    heightMt: app.globalData.heightMt + 20 * 2,
    height: app.globalData.windowHeight,
    navbarData: {
      showCapsule: 1, //是否显示左上角图标,
      hideShare: 1, //隐藏分享键
      title: '发表', //导航栏 中间的标题
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this

    if (options.typeid) {
      that.setData({
        typeid: options.typeid
      })
    }
  },
  
  // 获取话题
  // fid	否	int	0：默认全部广场分类 130：广场专题 133：直播专题
  getsClass: function(e) {
    const that = this
    let page_size = that.data.page_size
    if (that.data.nomore_data)
      return
    let page_index = e ? that.data.page_index + 1 : 0
  
    request('post', 'get_square_class.php', {
      token: wx.getStorageSync('token'),
      fid: 130,
      page_size: page_size,
      page_index: e ? 0 : page_index
    }).then((res) => {
      if (res.err_code != 0)
        return
      let res_thread = res.data.threadclass
      let that_thread = that.data.thread
      let thread = that_thread.length == 0 ? res_thread : that_thread.concat(res_thread)
      that.setData({
        thread: thread,
        page_index: page_index,
        have_data: false,
        nomore_data: thread.length < page_size ? true : false
      })
      let typeid = that.data.typeid
      if (typeid)
        for (let i in thread) {
          if (typeid == thread[i].typeid) {
            that.setData({
              pic_text: thread[i].name
            })
          }
        }
    })
  },
  scrolltolower(e) {
    const that = this
    if (that.data.have_data || that.data.nomore_data)
      return
    that.setData({
      have_data: true
    },
      that.getsClass(true)
    )
    
  },
  topicTap(){
    const that = this
    that.setData({
      topic_list: !that.data.topic_list
    },()=>{
      if(that.data.topic_list)
        that.getsClass()
    })
  },
  focusTap() {
    this.setData({
      focus: false
    })
  },
  focusTaps(){
    this.setData({
      focus: true
    })
  },
  
  addPic: function(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    that.setData({
      typeid: id == that.data.typeid ? 0 : id,
      pic_text: id == that.data.typeid ? '' : name
    })
    that.topicTap()
  },
  imageTap: function() {
    const that = this
    let image_list = that.data.image_list
    let aid_list = that.data.aid_list
    wx.chooseImage({
      count: 9 - image_list.length,
      success(res) {
        let paths = res.tempFilePaths
        that.setData({
          loading_hidden: false
        })
        for (let i in paths) {
          uploadFile('post', 'add_image.php', paths[i], 'myfile', {
            token: wx.getStorageSync("token")
          }).then((re) => {
            if (re.err_code != 0)
              return
            let data = re.data
            image_list.push(data.read_file_url)
            aid_list.push(data.aid)
            that.setData({
              aid_list: aid_list,
              image_list: image_list
            })
          })
        }
        setTimeout(() => { 
          that.setData({
            loading_hidden: true
          })
        }, 120 * paths.length)
       
      }
    })
  },

  videoTap: function() {
    const that = this
    let aid_list = []
    let video = ''

    wx.chooseVideo({
      maxDuration: 20,
      success(re) {

        let path = re.tempFilePath
        let v_height = re.height
        let v_width = re.width
        that.setData({
          loading_hidden: false
        })
        
        uploadFile('post', 'add_video.php', path, 'myfile', {
          token: wx.getStorageSync("token")
        }).then((res) => {
          if (res.err_code != 0)
            return
          let code = res.data.code
          let url = res.data.read_file_url
          aid_list.push(res.data.aid)

          that.setData({
            aid_list: aid_list,
            video: url,
            v_height: v_height,
            v_width: v_width,
            loading_hidden: true
          })

        })
      }
    })
    //     const uploadTask = wx.uploadFile({
    //       url: app.globalData.svr_url + 'add_video.php',
    //       filePath: path,
    //       name: 'myfile',
    //       method: 'POST',
    //       formData: {
    //         token: '69fdpj4qAftzUxFIl5PqKJDQNqkPqcQFumTOt4h6/WH5GhxTEmUeDf/27SJsaycH21MCpDVkRa6411d12g3Hc7H36XoOMIIS2BkJ3wGdqzjrgQUprmE9/DGBeW20b6Y7lXpeFEJGxLQVT8AEpzC6WD0PENLzsPJa/JS/3G1Rvhxm',
    //       },
    //       success: function(resp) {
    //         var resp_dict = JSON.parse(resp.data)
    //         if (resp_dict.err_code == 0) {

    //           let code = resp_dict.data.code
    //           let url = resp_dict.data.read_file_url
    //           aid_list.push(resp_dict.data.aid)

    //           that.setData({
    //             aid_list: aid_list,
    //             video: url,
    //             v_height: v_height,
    //             v_width: v_width,
    //             loading_hidden: true
    //           })
    //         } else {
    //           app.showErrModal('上传失败，请重新上传');
    //           that.setData({
    //             loading_hidden: true
    //           })
    //           uploadTask.abort()
    //         }
    //       },
    //       fail: function(resp) {
    //         app.showErrModal('上传失败，请重新上传');
    //         that.setData({
    //           loading_hidden: true,
    //           showE: 0,
    //         })
    //         uploadTask.abort()
    //       }
    //     })

    //     uploadTask.onProgressUpdate((res) => {
    //       if (res.progress == 100) {
    //         that.setData({
    //           loading_hidden: true
    //         })
    //       } else{
    //         that.setData({
    //           loading_hidden: false
    //         })
    //       }
    //     })

    //   }
    // })
  },
  videoMinusTap: function() {
    const that = this
    that.setData({
      video: '',
      aid_list: []
    })
  },
  //latitude 纬度  longitude 经度
  localTap: function() {
    const that = this
    wx.chooseLocation({
      success: function(res) {
        that.chooseLocation(res)
      },
      fail: function() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '获得您当前发帖位置',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          //授权成功之后，再调用chooseLocation选择地方
                          wx.chooseLocation({
                            success: function(res) {
                              that.chooseLocation(res)
                            }
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          },
          fail: function(res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  chooseLocation: function(res) {
    const that = this
    if (!res.address) {
      that.setData({
        address: '',
        latitude: '',
        longitude: ''
      })
      return
    }
    that.setData({
      address: res.name,
      latitude: res.latitude,
      longitude: res.longitude
    })
  },
  //   message	是	string	内容
  // attachment	是	int	附件类型012 如果为0，下面2个参数不用传
  // aid_list	否	string	附件
  // address	否	string	地址名称
  // longitude	否	string	经度
  // latitude	否	string	纬度
  inputContent: function(e) {
    const that = this
    let message = e.detail.value
    that.setData({
      message: message
    })
  },
  addSquare: function() {
    const that = this
    that.setData({
      loading_hidden: false
    })
    let message = that.data.message
    let attachment = 0
    let aid_list_arr = that.data.aid_list,
      aid_list = ''
    let image_list = that.data.image_list
    let video = that.data.video
    let address = that.data.address || ''
    let latitude = that.data.latitude || ''
    let longitude = that.data.longitude || ''
    if (!message) {
      that.setData({
        loading_hidden: true
      })
      wx.showToast({
        title: '需要输入文字内容!',
        icon: 'none'
      })
      return
    }
    if (image_list.length != 0) {
      attachment = 2
    } else if (video) {
      attachment = 1
    }
    if (aid_list_arr.length > 0)
      aid_list = aid_list_arr.join(',')
   
    request('post', 'add_square.php', {
      token: wx.getStorageSync('token'),
      message: message,
      attachment: attachment,
      aid_list: aid_list,
      typeid: that.data.typeid || 0,
      address: address,
      latitude: latitude,
      longitude: longitude
    }).then((res) => {
      that.setData({
        loading_hidden: true
      })
      if (res.err_code != 0)
        return
      wx.reLaunch({
        url: '/pages/square/square'
      })
    })
  },

  imageDel: function(e) {
    const that = this
    let index = e.currentTarget.dataset.idx
    let image_list = that.data.image_list
    image_list.splice(index, 1)
    that.setData({
      image_list: image_list
    })
  }
})