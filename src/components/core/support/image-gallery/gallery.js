import './gallery.scss'
import PersonalTab from './tabs/personal.js'
import PixabayTab from './tabs/pixabay.js'
import { v4 } from 'uuid'
import { generateFileName, getOSSClient } from './ali-upload.js'
import _ from 'lodash'

export default {
  name: 'lbs-image-gallery',
  components: {
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    tabs: [
      {
        value: 'personal',
        label: '我的图库'
      },
      {
        value: 'pixabay',
        label: 'Pixabay图库'
      }
    ],
    activeTab: 'personal',
    innerVisible: false,
    pixabayList: [],
    loading: false,
    fileList: []
  }),
  computed: {
  },
  watch: {
    visible (value) {
      this.innerVisible = value
    }
  },
  methods: {
    showGallery () {
      this.innerVisible = true
    },
    handleClose () {
      this.innerVisible = false
    },
    changeTab ({ key }) {
      this.activeTab = key
    },
    handleSelectImage (item) {
      this.handleClose()
      this.$emit('change', item.url)
    },
    renderContent () {
      switch (this.activeTab) {
        case 'personal':
          return <PersonalTab onChangeItem={item => {
            this.handleSelectImage(item)
          }}/>
        case 'pixabay':
          return <PixabayTab onChangeItem={item => {
            this.handleSelectImage(item)
          }}/>
      }
    },
    renderDefaultActivator () {
      const activatorWithoutImg = (
        <div
          class="default-activator cursor-pointer empty-bg-activator"
          onClick={this.showGallery}
        >
          <a-upload
            name="files"
            custom-request={ this.customUpload }
            beforeUpload={this.handleBeforeUpload}
            fileList={this.fileList}
            onChange={this.handleChange}>
            <slot>
              <a-icon type="plus" />
              {/* <a-button>
                <a-icon type="upload" /> Click to Upload
              </a-button> */}
            </slot>
          </a-upload>
        </div>
      )

      const activatorWithImg = (
        <div onClick={this.showGallery}>
          <div class="default-activator cursor-pointer "><img src={this.value} width="50%" style={{ margin: 'auto' }} /></div>
          <div class="flex-space-between" style="margin-top: 8px;">
          <a-upload
            style={{ 'line-height': 0 }}
            name="files"
            custom-request={ this.customUpload }
            beforeUpload={this.handleBeforeUpload}
            fileList={this.fileList}
            onChange={this.handleChange}>
              <a-button size="small">
                更换
              </a-button>
          </a-upload>
            {/* <a-button size="small" onClick={e => {
              e.stopPropagation()
            }}>裁剪</a-button> */}
            <a-button size="small" onClick={(e) => {
              e.stopPropagation()
              this.handleSelectImage({ url: '' })
            }}>移除</a-button>
          </div>
        </div>
      )
      return (this.value ? activatorWithImg : activatorWithoutImg)
    },
    handleBeforeUpload (file) {
      // return this.beforeUpload(file)
    },
    handleChange (info) {
      console.log('handleChange---', info.file)
      this.loading = true
      const status = info.file.status
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        this.loading = false
        this.uploadSuccess(info)
        this.$message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    },
    async customUpload (opts) {
      const uid = v4()
      try {
          const client = await getOSSClient()
          const previewFile = { status: 'doing', uid: uid, name: opts.file.name }
          this.fileList = [previewFile]
          // this.updateValue()
          
          const result = await client.put(`daneng/${generateFileName(opts.file.name)}`, opts.file)
          console.log('上传成功----', result)
          this.$emit('change', result.url)
          // opts.onSuccess('/' + result.name, opts.file)
          const suffix = (opts.file.name.split('.')[opts.file.name.split('.').length - 1]).toLowerCase()
          previewFile.path = '/' + result?.name
          previewFile.name = opts.file?.name
          previewFile.status = 'done'
          previewFile.suffix = suffix
          // this.fileList.splice(this.fileList?.length-1, 1, previewFile);
          this.fileList = [previewFile]
          // this.updateValue()
          console.log(this.fileList)
      } catch (ex) {
          const index = _.findIndex(this.fileList, (f) => f.uid === uid)
          if (index !== -1) {
              this.fileList.splice(index, 1)
          }
          this.$message.error(ex.toString())
      }
    }
  },
  render (h) {
    return (
      <div>
        <a-input value={this.value} onChange={e => {
          this.$emit('change', e) // #309
        }} placeholder="输入图片链接/上传"></a-input>
        <slot>{this.renderDefaultActivator()}</slot>
        {/* <a-modal
          closable
          title="图片库"
          width="65%"
          visible={this.innerVisible}
          onOk={this.handleClose}
          onCancel={this.handleClose}
          bodyStyle={{ margin: 0, padding: 0 }}
        >
          <a-layout style="height: 500px; position: relative;">
            <a-layout-sider width="200px" style="background-color: white;">
              <a-menu mode="inline" defaultSelectedKeys={['personal']} onClick={this.changeTab}>
                {
                  this.tabs.map((tab, index) => (
                    <a-menu-item key={tab.value} >
                      <a-icon type="user" />
                      <span>{tab.label}</span>
                    </a-menu-item>
                  ))
                }
              </a-menu>
            </a-layout-sider>
            <a-layout-content>
              {this.renderContent()}
            </a-layout-content>
          </a-layout>
        </a-modal> */}
      </div>
    )
  }
}
