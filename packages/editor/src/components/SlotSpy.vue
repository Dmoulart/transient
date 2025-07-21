<script lang="ts">
import { createCommentVNode } from 'vue'
export default {
  name: 'SlotSpy',
  props: {
    ownerId: String,
    slotName: String,
    editable: Boolean,
  },
  setup(props) {
    return () => createCommentVNode('transient-slot-spy')
  },
  mounted() {
    const spy: Comment = this.$el

    if (!spy.parentElement) {
      throw new Error('Slot spy expects a parent element')
    }

    if (this.editable) {
      spy.parentElement.contentEditable = 'true'
    }

    spy.parentElement.dataset.transientSlot = `${this.slotName}:${this.ownerId}`
  },
}
</script>
