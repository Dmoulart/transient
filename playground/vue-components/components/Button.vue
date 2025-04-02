<template>
  <button>
    {{ text }}
  </button>
</template>
<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  size: "s" | "m" | "l" | "xl";
  variant: "primary" | "secondary";
  text: string;
}>();
</script>
