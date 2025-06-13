<template>Virgile {{ sandwich ? 'miam' : 'pas miam' }}</template>

<script setup lang="ts">
defineProps<{ sandwich: boolean }>()
</script>
