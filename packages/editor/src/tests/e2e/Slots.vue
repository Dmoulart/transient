<script setup lang="ts">
import ReactiveIsland from '../../samples/ReactiveIsland.vue'
import ConditionalSlot from './Slots/ConditionalSlot.vue'
import DefaultSlot from './Slots/DefaultSlot.vue'
import EmptySlot from './Slots/EmptySlot.vue'
import FallbackSlot from './Slots/FallbackSlot.vue'
import InlineSlot from './Slots/InlineSlot.vue'
import MultiRootSlot from './Slots/MultiRootSlot.vue'
import NamedSlots from './Slots/NamedSlots.vue'
import PropToggledSlot from './Slots/PropToggledSlot.vue'
import RepeatedSlot from './Slots/RepeatedSlot.vue'
import SwitchedSlot from './Slots/SwitchedSlot.vue'
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

      <DefaultSlot><strong style="color: crimson">Crimson <em>emphasis</em></strong> next to <span class="tag">twin</span><span class="tag">twin</span>.</DefaultSlot>

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
