<script setup lang="ts">
import ConditionalSlot from '../tests/e2e/Slots/ConditionalSlot.vue'
import DefaultSlot from '../tests/e2e/Slots/DefaultSlot.vue'
import EmptySlot from '../tests/e2e/Slots/EmptySlot.vue'
import FallbackSlot from '../tests/e2e/Slots/FallbackSlot.vue'
import InlineSlot from '../tests/e2e/Slots/InlineSlot.vue'
import MultiRootSlot from '../tests/e2e/Slots/MultiRootSlot.vue'
import NamedSlots from '../tests/e2e/Slots/NamedSlots.vue'
import PropToggledSlot from '../tests/e2e/Slots/PropToggledSlot.vue'
import ReactiveIsland from './ReactiveIsland.vue'
import RepeatedSlot from '../tests/e2e/Slots/RepeatedSlot.vue'
import SwitchedSlot from '../tests/e2e/Slots/SwitchedSlot.vue'
</script>

<template>
  <main class="min-h-screen bg-[#0C1222] text-white">
    <div class="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 class="text-4xl font-semibold tracking-tight">Slots playground</h1>
      <p class="mb-6 text-white/75">
        Click any text to edit it. A <InlineSlot>highlighted</InlineSlot> slot and a live counter
        <ReactiveIsland /> both sit inside this paragraph.
      </p>

      <DefaultSlot>Plain text in the default slot.</DefaultSlot>

      <DefaultSlot>Text with <b>bold</b>, <i>italic</i> and a <a href="#">link</a>.</DefaultSlot>

      <NamedSlots>
        <template #header>Header slot</template>
        Default slot between two named slots.
        <template #footer>Footer slot</template>
      </NamedSlots>

      <FallbackSlot />

      <FallbackSlot>Content passed, fallback replaced.</FallbackSlot>

      <EmptySlot />

      <ConditionalSlot>
        <template #icon>✦</template>
        Icon slot provided, wrapper rendered.
      </ConditionalSlot>

      <ConditionalSlot>No icon slot, wrapper skipped.</ConditionalSlot>

      <PropToggledSlot>
        <template #header>Header, hidden when showHeader is off</template>
        Always rendered.
        <template #footer>Footer, shown when showFooter is on</template>
      </PropToggledSlot>

      <SwitchedSlot>
        <template #loading>Loading slot</template>
        <template #empty>Empty slot</template>
        <template #ready>Ready slot</template>
      </SwitchedSlot>

      <RepeatedSlot>Same slot rendered count times.</RepeatedSlot>

      <DefaultSlot>
        Outer slot text
        <DefaultSlot>Nested slot, <InlineSlot>inline</InlineSlot> inside.</DefaultSlot>
        more outer text.
      </DefaultSlot>

      <MultiRootSlot>Slot in a component with several root nodes.</MultiRootSlot>
    </div>
  </main>
</template>
