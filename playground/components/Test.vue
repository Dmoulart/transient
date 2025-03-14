<template>
  <div><slot /></div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
const props = withDefaults(
  defineProps<{
    text: string;
    display: boolean;
    maybeDisplay?: boolean;
    env: "prod" | "dev";
    version: 0 | 1 | 2;
    level: number;
  }>(),
  {
    version: 0,
    text: "ok",
  }
);
</script>
