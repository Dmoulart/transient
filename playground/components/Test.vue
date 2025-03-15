<template>
  <div><slot /></div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";

type Data = {
  hello: boolean;
};
const props = defineProps<{
  text: string;
  display: boolean;
  maybeDisplay?: boolean;
  env: "prod" | "dev";
  version: 0 | 1 | 2;
  level: number;
  data: Data;
}>();
</script>
