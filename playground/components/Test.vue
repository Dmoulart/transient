<template>
  <div><slot /></div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps<{ hello: string }>();
</script>
