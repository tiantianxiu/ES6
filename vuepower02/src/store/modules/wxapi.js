// wxapi.js
import store from '../../store'

/**
 * 微信js-sdk
 * 参考文档：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
 */

const wxApi = {
    /**
     * [wxRegister 微信Api初始化]
     * @param  {Function} callback [ready回调函数]
     */
    wxRegister(callback) {

        var params = new URLSearchParams()
        params.append('url', encodeURIComponent(location.href.split('#')[0]))
        params.append('typeid', store.state.detail.tid)
        axios.post('/wmapi/get_share.php', params).then((res) => {
            let data = res.data.data // PS: 这里根据你接口的返回值来使用
            store.state.detail.png = data.qrcode
            wx.config({
                debug: false, // 开启调试模式
                appId: data.signPackage.appId, // 必填，公众号的唯一标识
                timestamp: data.signPackage.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.signPackage.nonceStr, // 必填，生成签名的随机串
                signature: data.signPackage.signature, // 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            })
        }).catch((error) => {
            // console.log(error)
        })
        // 如果需要定制ready回调方法
        if (callback) {
            callback()
        }
    },
    /**
     * [ShareTimeline 微信分享到朋友圈]
     * @param {[type]} option [分享信息]
     * @param {[type]} success [成功回调]
     * @param {[type]} error   [失败回调]
     */
    ShareData(option) {
        wx.ready(function () {
            wx.onMenuShareTimeline({
                title: option.title, // 分享标题
                link: option.link, // 分享链接
                imgUrl: option.imgUrl, // 分享图标
            })
            wx.onMenuShareAppMessage({
                title: option.title, // 分享标题
                desc: option.title,
                link: option.link, // 分享链接
                imgUrl: option.imgUrl, // 分享图标
            })
            wx.onMenuShareQQ({
                title: option.title, // 分享标题
                desc: option.title, // 分享描述
                link: option.link, // 分享链接
                imgUrl: option.imgUrl, // 分享图标
            })
        })
    },

}


export default wxApi