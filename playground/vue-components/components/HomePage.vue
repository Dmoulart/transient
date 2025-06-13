<template>
  <main>
    <h1>Hello {{ user }}</h1>
    <p>Welcome abord !</p>
  </main>
  <Section>
    OK
    <template #footer> footer !</template>
  </Section>
</template>
<script setup lang="ts">
const user = "john";
</script>
