import axios from './http'

const state = {
    tid: 0, //帖子tid
    png: '' //二维码
}

const mutations = {}

const actions = {

    /**
     * 帖子详情
     * @type {{getPostDetail({dispatch: *}, *=): *}}
     */
    getPostDetail({dispatch}, payload) {
        state.tid = payload.tid
        return new Promise((resolve, reject) => {
            axios.get(
                '/wmapi/get_post_detail.php',
                {
                    params: {'tid': payload.tid}
                }
            )
                .then(res => {
                    if (res.data.err_code != 0)
                        return
                    resolve(res.data)
                }, err => {
                    reject(err)
                })
                .catch(error => {
                    console.log(error)
                })
        })
    },


    /**
     * 帖子回复
     * @type {{getReplyList({dispatch: *}, *=): *}}
     */
    getReplyList({dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios.get(
                '/wmapi/get_post_detail_comment.php',
                {
                    params: {'tid': payload.tid, 'page_size': payload.page_size, 'page_index': payload.page_index,}
                }
            )
                .then(res => {
                    if (res.data.err_code != 0)
                        return

                    resolve(res.data)
                }, err => {
                    reject(err)
                })
                .catch(error => {
                    console.log(error)
                })
        })
    },
    /**
     * 问答详情
     * @type {{getQuestDetail({dispatch: *}, *=): *}}
     */
    getQuestDetail({dispatch}, payload) {
        state.tid = payload.tid
        return new Promise((resolve, reject) => {
            axios.get(
                '/wmapi/get_question_detail.php',
                {
                    params: {'tid': payload.tid}
                }
            )
                .then(res => {
                    if (res.data.err_code != 0)
                        return
                    resolve(res.data)
                }, err => {
                    reject(err)
                })
                .catch(error => {
                    console.log(error)
                })
        })
    },


    /**
     * 问答回复
     * @type {{getQuestReList({dispatch: *}, *=): *}}
     */
    getQuestReList({dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios.get(
                '/wmapi/get_question_detail_comment.php',
                {
                    params: {'tid': payload.tid, 'page_size': payload.page_size, 'page_index': payload.page_index,}
                }
            )
                .then(res => {
                    if (res.data.err_code != 0)
                        return
                    resolve(res.data)
                }, err => {
                    reject(err)
                })
                .catch(error => {
                    console.log(error)
                })
        })
    }


}

export default {
    state,
    mutations,
    actions
}
