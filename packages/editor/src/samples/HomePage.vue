<template>
  <main>
    <h1>Hello {{ user }}</h1>
    <p>Welcome abord !</p>
    <Button>Contact</Button>
    <Section level="h1">
      <template #footer> Footer ! </template>
    </Section>
  </main>
</template>
<script setup lang="ts">
import Button from './Button.vue'
import Section from './Section.vue'

const user = 'john'
</script>
