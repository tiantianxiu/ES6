const state = {
  tid: 0, //帖子tid
  png: '' //二维码
}

const mutations = {}

const actions = {
  toast({dispatch}, payload){
    if(payload.hideToast){
      vant.Toast.clear()
      return
    }
    vant.Toast.loading({
      mask: true,
      message: '加载中...',
      duration: 0
    })
  }
}

export default {
  state,
  mutations,
  actions
}
