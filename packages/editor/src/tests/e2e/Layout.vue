<script setup lang="ts">
import Tile from './Actions/Tile.vue'
import DefaultSlot from './Slots/DefaultSlot.vue'
import InlineSlot from './Slots/InlineSlot.vue'
import TitledSlot from './Slots/TitledSlot.vue'
</script>

<!-- entering edit mode must not move anything: one slot per kind of content (layout.e2e.ts) -->
<template>
  <main class="min-h-screen bg-[#0C1222] text-white">
    <div class="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <DefaultSlot
        >Inline text with <b>bold</b>, <i>italic</i> and a <a href="#">link</a>.</DefaultSlot
      >

      <DefaultSlot>
        Indented template text
        <strong>spread over</strong>
        several lines.
      </DefaultSlot>

      <DefaultSlot
        ><h2 class="text-xl font-semibold">Blocks heading</h2>
        <p>First paragraph.</p>
        <p>Second paragraph.</p></DefaultSlot
      >

      <DefaultSlot>
        <h2 class="text-xl font-semibold">Indented heading</h2>
        <p>Indented paragraph.</p>
      </DefaultSlot>

      <DefaultSlot
        ><ul class="list-disc pl-5">
          <li>List item one</li>
          <li>List item two</li>
        </ul></DefaultSlot
      >

      <DefaultSlot
        >Loose text before
        <p>a paragraph in between</p>
        loose text after.</DefaultSlot
      >

      <DefaultSlot
        ><p>Paragraph above the tile.</p>
        <Tile label="Tile between" />
        <p>Paragraph below.</p></DefaultSlot
      >

      <DefaultSlot
        ><p>An <InlineSlot>inline slot</InlineSlot> inside a paragraph.</p></DefaultSlot
      >

      <TitledSlot title="Titled"
        ><p>Paragraph right after the title.</p>
        <p>A justified paragraph that wraps over several lines.</p></TitledSlot
      >
    </div>
  </main>
</template>
