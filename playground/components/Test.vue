<template>
  <div>Hello</div>
</template>
<script setup lang="ts">
type ComplexProp = { key: string; val: string };
defineProps<{
  points: number;
  obj: { key: string; val: string };
  complex: ComplexProp;
}>();
</script>
