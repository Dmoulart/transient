<template>
  <div><slot /></div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  text: string;
}>();
</script>
