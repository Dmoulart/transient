<template>
  <button
    data-test="btn"
    :size-attr="size"
    size-lit="size"
    :wolo="wololo"
    :stuff="true"
  >
    {{ text }}
  </button>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
const wololo = "ok";
const props = defineProps<{
  size: "s" | "m" | "l" | "xl";
  variant: "primary" | "secondary";
  text: string;
}>();
</script>
