<template>
  <component class="text-component" :is="as" :class="className">
    {{ text }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TextProps {
  as?: string
  className?: string
  text?: string
}

const props = withDefaults(defineProps<TextProps>(), {
  as: 'div',
})
</script>
