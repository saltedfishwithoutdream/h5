<script>
import CoreEditor from 'core/preview.js'
export default {
  render () {
    return (
      <CoreEditor workId={this.$route.params.workId} />
    )
  }
}
</script>
