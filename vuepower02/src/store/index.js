import detail from './modules/detail'
import axios from './modules/http'
import common from './modules/common'


export default new Vuex.Store({
  modules: {
    detail,
    axios,
    common
  }
})
