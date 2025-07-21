<script lang="ts">
import { createCommentVNode } from 'vue'
export default {
  props: {
    content: String,
  },
  setup(props) {
    return () => createCommentVNode(props.content || '')
  },
}
</script>
