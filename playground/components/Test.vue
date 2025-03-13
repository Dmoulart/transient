<template>
  <div><slot /></div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
type Complex = { key: string; value: { someVal: boolean } };
const props = defineProps<{ hello: string; complex: Complex }>();
</script>
