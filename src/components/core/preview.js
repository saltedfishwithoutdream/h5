import { mapState, mapActions, mapMutations } from 'vuex'
import Vue from 'vue'

import 'core/support/index.js'
import 'core/styles/index.scss'
import 'core/styles/scrollbar.scss'
import 'animate.css'

import FixedTools from 'core/editor2/fixed-tools/index'
import EditorRightPanel from 'core/editor2/right-panel/index'
import EditorCanvas from 'core/editor2/canvas/index'
import EditorActionMenu from 'core/editor2/header/action-menu'
import EditorLeftPanel from 'core/editor2/left-panel/index'

import PreviewDialog from 'core/editor2/modals/preview.vue'
import ScriptViewDialog from 'core/editor2/modals/script-view.vue'
import ScriptListDialog from 'core/editor2/modals/script-list.vue'

import Header from '@/components/common/header/index'
import Feedback from '@/components/common/feedback/index'
import AdjustLineV from 'core/support/adjust-line/vertical'

import store from 'core/store/index'
import router from 'core/router/index'
import i18n from '@/locales'
import '@/plugins/index'

function AdjustHoc (WrappedComponent) {
  return {
    props: WrappedComponent.props,
    data: () => ({
      show: true
    }),
    computed: {
      displayStyle () {
        return {
          display: this.show ? 'block' : 'none'
        }
      },
      iconType () {
        return `vertical-${this.show ? 'right' : 'left'}`
      }
    },
    render (h) {
      return (
        <div class="collapse-indicator-wrapper">
          <WrappedComponent
            attrs={this.$attrs}
            props={this.$props}
            on={this.$listeners}
            scopedSlots={this.$scopedSlots}
            class="component-wrapper"
            style={this.displayStyle} />
          <div class="indicator-wrapper">
            <span class="indicator" onClick={() => { this.show = !this.show }}>
              <a-icon type={this.iconType} />
            </span>
          </div>
        </div>
      )
    }
  }
}

const AdjustLeftPanel = AdjustHoc(EditorLeftPanel)

window.EditorApp = new Vue() // event bus
const CoreEditor = {
  name: 'CoreEditor',
  store,
  i18n,
  router,
  props: {
    workId: {
      type: [Number, String]
    }
  },
  data: () => ({
    previewDialogVisible: false,
    propsPanelWidth: 320
  }),
  computed: {
    ...mapState('editor', {
      work: state => state.work
    }),
    ...mapState('dialog', [
      'editScript_dialog',
      'viewScript_dialog',
      'createScript_dialog',
      'allScriptList_dialog'
    ])
  },
  methods: {
    ...mapActions('editor', ['fetchWork']),
    ...mapMutations('dialog', ['updateDialog']),
    handlePreview () { this.previewDialogVisible = true }
  },
  render (h) {
    return (
      <div>
          <div style="display: none"><AdjustLeftPanel /></div>
          <EditorCanvas />
      </div>
    )
  },
  created () {
    if (this.workId) {
      this.fetchWork(this.workId)
    } else {
      this.$message.error('no work id!')
    }
  }
}

// Vue install, Vue.use 会调用该方法。
CoreEditor.install = (Vue, opts = {}) => {
  Vue.component(CoreEditor.name, CoreEditor)
}

// 通过script标签引入Vue的环境
if (typeof window !== 'undefined' && window.Vue) {
  CoreEditor.install(window.Vue)
}

export default CoreEditor
