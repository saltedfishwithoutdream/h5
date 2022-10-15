import { v4 } from 'uuid'
import { generateFileName, getOSSClient } from '../ali-upload.js'
import _ from 'lodash'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    handleClose: {
      type: Function,
      default: () => {}
    },
    uploadSuccess: {
      type: Function,
      default: () => {}
    },
    beforeUpload: {
      type: Function,
      default: (file) => file
    }
  },
  computed: {
  },
  data: () => ({
    loading: false,
    fileList: []
  }),
  methods: {
    handleBeforeUpload (file) {
      return this.beforeUpload(file)
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
          console.log('上传成功----', result);
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
      <a-upload
        name="files"
        custom-request={ this.customUpload }
        beforeUpload={this.handleBeforeUpload}
        fileList={this.fileList}
        onChange={this.handleChange}>
        <slot>
          <a-button>
            <a-icon type="upload" /> Click to Upload
          </a-button>
        </slot>
      </a-upload>
    )
  },
  mounted () {
  }
}
