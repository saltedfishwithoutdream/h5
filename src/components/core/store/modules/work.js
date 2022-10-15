import Element from 'core/models/element'
import strapi from '@/utils/strapi'
import Page from 'core/models/page'
import Work from 'core/models/work'
import { AxiosWrapper, handleError } from '@/utils/http.js'
// import router from '@/router.js'
import { takeScreenshot, downloadPoster } from '@/utils/canvas-helper.js'

function setLoading (commit, loadingName, isLoading) {
  commit('loading/update', { type: loadingName, payload: isLoading }, { root: true })
}

export const actions = {
  previewWork ({ commit }, payload = {}) {
    commit('previewWork', payload)
  },
  deployWork ({ commit }, payload = {}) {
    commit('previewWork', payload)
  },
  updateWork ({ commit, state }, payload = {}) {
    // update work with strapi
    const work = {
      ...state.work,
      ...payload
    }
    commit('setWork', work)
  },
  /**
   * isSaveCover {Boolean} 保存作品时，是否保存封面图
   * loadingName {String} saveWork_loading, previewWork_loading
   * 预览作品之前需要先保存，但希望 用户点击保存按钮 和 点击预览按钮 loading_name 能够不同（虽然都调用了 saveWork）
   * 因为 loading 效果要放在不同的按钮上
   */
  saveWork ({ commit, dispatch, state, id }, { isSaveCover = false, loadingName = 'saveWork_loading', successMsg = '保存作品成功' } = {}) {
    console.log(state.work)
    const fn = (callback) => {
      new AxiosWrapper({
        dispatch,
        commit,
        loading_name: loadingName,
        successMsg
        // customRequest: strapi.updateEntry.bind(strapi)
      }).put(`/dp/models/luban/records/${state.work.id}`, {
        data: {
          page: state.work,
          name: window.__record.name,
          __link__: `${window.location.origin}/#/editor/${state.work.id}`
        }
        // name: 'test',
        // effective_status: 1,
        // publish_status: 1,
        // sort: 8071690000,
        // start_time: '',
        // stop_time: '',
        // tag: ''
      }).then(callback)
    }
    return new Promise((resolve, reject) => {
      if (isSaveCover) {
        setLoading(commit, 'uploadWorkCover_loading', true)
        // takeScreenshot().then(file => {
        //   dispatch('uploadCover', { file }).then(() => {
        //     setLoading(commit, 'uploadWorkCover_loading', false)
        //     fn(resolve)
        //   }) // uploadCover
        // }) // takeScreenshot
        fn(resolve)
      } else {
        fn(resolve)
      }
    })
  },
  fetchWork ({ commit, dispatch, state }, workId) {
    // return strapi.getEntry('works', workId).then(entry => {
    //   commit('setWork', entry)
    //   commit('setEditingPage')
    // }).catch(handleError)
    new AxiosWrapper({
      dispatch,
      commit
    }).get(`/dp/models/luban/records/${workId}`).then(data => {
      const resData = data?.data?.data?.data
      const initContent = {"id":51904,"title":"标题","description":"描述","cover_image_url":"","pages":[{"uuid":1665726103672,"title":"","elements":[{"name":"lbp-background","pluginType":"lbp-background","uuid":"lbp-background_b0fbba3d-aa47-4994-3145-bd29d301c57c","pluginProps":{"uuid":"lbp-background_b0fbba3d-aa47-4994-3145-bd29d301c57c","imgSrc":"","backgroundColor":"rgba(255, 255, 255, 0.2)","waterMarkText":"水印文字","waterMarkFontSize":16,"waterMarkRotate":10,"waterMarkColor":"rgba(184, 184, 184, 0.2)"},"commonStyle":{"top":100,"left":100,"width":100,"height":40,"textAlign":"center","color":"#000000","backgroundColor":"rgba(255, 255, 255, 0)","fontSize":14,"margin":{"top":{"value":0,"unit":"px"},"right":{"value":0,"unit":"px"},"bottom":{"value":0,"unit":"px"},"left":{"value":0,"unit":"px"}},"padding":{"top":{"value":0,"unit":"px"},"right":{"value":0,"unit":"px"},"bottom":{"value":0,"unit":"px"},"left":{"value":0,"unit":"px"}},"border":{"top":{"value":0,"unit":"px"},"right":{"value":0,"unit":"px"},"bottom":{"value":0,"unit":"px"},"left":{"value":0,"unit":"px"},"color":{"value":"#000"},"style":{"value":"solid"}},"border-style":"solid","boxModelPart":""},"events":[],"methodList":[],"scripts":[],"animations":[]}]}],"is_publish":false,"is_template":false,"page_mode":"h5_swipper","height":568,"width":320,"published_at":"2022-10-14T05:41:43.792Z","created_at":"2022-10-14T05:41:43.795Z","updated_at":"2022-10-14T05:41:43.795Z","datasources":[]}
      if (!resData.page || !resData.page.id) {
        resData.page = initContent
      }
      commit('setWork', { ...resData?.page, id: workId })
      window.__record = resData
      commit('setEditingPage')
    }).catch(handleError)
  },
  setWorkAsTemplate ({ commit, state, dispatch }, workId) {
    new AxiosWrapper({
      dispatch,
      commit,
      // name: 'editor/formDetailOfWork',
      loading_name: 'setWorkAsTemplate_loading',
      successMsg: '设置为模板成功'
    }).post(`/works/set-as-template/${workId || state.work.id}`)
  },
  uploadCover ({ commit, state, dispatch }, { file } = {}) {
    const formData = new FormData()
    formData.append('files', file, `${+new Date()}.png`)
    formData.append('workId', state.work.id)
    return new AxiosWrapper({
      dispatch,
      commit,
      name: 'editor/setWorkCover',
      loading_name: 'uploadWorkCover_loading',
      successMsg: '上传封面图成功!'
    // }).post(`/works/uploadCover/${state.work.id}`, formData)
    }).post(`/upload/`, formData)
  },
  downloadPoster ({ commit, state, dispatch }) {
    downloadPoster()
  }
}

// mutations
export const mutations = {
  /**
   *
   * @param {*} state
   * @param {Object} payload
   *
    value example: [
      {
        "id": 1,
        "name": "1567769149231.png",
        "hash": "1660b11229e7473b90f99a9f9afe7675",
        "sha256": "lKl7f_csUAgOjf0VRYkBZ64EcTjvt4Dt4beNIhELpTU",
        "ext": ".png",
        "mime": "image/png",
        "size": "6.57",
        "url": "/uploads/1660b11229e7473b90f99a9f9afe7675.png",
        "provider": "local",
        "public_id": null,
        "created_at": "2019-09-06T11:25:49.255Z",
        "updated_at": "2019-09-06T11:25:49.261Z",
        "related": []
      }
    ]
   */
  setWorkCover (state, { type, value }) {
    const [cover] = value
    state.work.cover_image_url = cover.url
  },
  setWork (state, work) {
    window.__work = work
    work.pages = work.pages.map(page => {
      page.elements = page.elements.map(element => new Element(element))
      return new Page(page)
    })
    state.work = new Work(work)
  },
  previewWork (state, { type, value }) {},
  deployWork (state, { type, value }) {},
  formDetailOfWork (state, { type, value }) {
    state.formDetailOfWork = value
  }
}
