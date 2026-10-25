<script setup lang="ts">
import Tile from './Actions/Tile.vue'
import DefaultSlot from './Slots/DefaultSlot.vue'
import EmptySlot from './Slots/EmptySlot.vue'
</script>

<template>
  <main class="min-h-screen bg-[#0C1222] text-white">
    <div class="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <div class="flex flex-col gap-2">
        <Tile label="A" />
        <Tile label="B" />
      </div>

      <div class="flex flex-row gap-2">
        <Tile label="C" />
        <Tile label="D" />
      </div>

      <EmptySlot />

      <DefaultSlot><Tile label="E" /></DefaultSlot>
    </div>
  </main>
</template>
