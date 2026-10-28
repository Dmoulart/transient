<script setup lang="ts">
import { ToolbarButton, ToolbarRoot, ToolbarSeparator } from 'reka-ui'
import { ref } from 'vue'

defineProps<{ isDirty: boolean; canUndo?: boolean; canRedo?: boolean }>()

const emit = defineEmits<{
  undo: []
  redo: []
  publish: []
}>()

const editing = ref(true)
</script>

<template>
  <div class="tr-toolbar-dock">
    <button v-if="!editing" type="button" class="tr-edit-fab" @click="editing = true">
      <span class="tr-i-lucide-pencil" />
      Éditer
    </button>

    <ToolbarRoot v-else class="tr-toolbar" aria-label="Édition">
      <ToolbarButton class="tr-mode-toggle" aria-pressed="true" @click="editing = false">
        <span class="tr-mode-switch"><span class="tr-mode-thumb" /></span>
        Édition
      </ToolbarButton>
      <ToolbarSeparator class="tr-toolbar-sep" />
      <ToolbarButton
        class="tr-icon-btn"
        aria-label="Annuler"
        :disabled="!canUndo"
        @click="emit('undo')"
        ><span class="tr-i-lucide-undo-2" /></ToolbarButton
      >
      <ToolbarButton
        class="tr-icon-btn"
        aria-label="Rétablir"
        :disabled="!canRedo"
        @click="emit('redo')"
        ><span class="tr-i-lucide-redo-2" /></ToolbarButton
      >
      <!-- <ToolbarButton class="tr-icon-btn" aria-label="Insérer un composant" @click="openInsert"
        ><span class="tr-i-lucide-square-plus" /></ToolbarButton
      >
      <ToolbarButton class="tr-icon-btn" aria-label="Arbre des composants" @click="openTree"
        ><span class="tr-i-lucide-layers" /></ToolbarButton
      > -->
      <ToolbarSeparator class="tr-toolbar-sep" />
      <span class="tr-status" :data-state="isDirty ? 'pending' : 'saved'" aria-live="polite">
        <span class="tr-status-dot" />{{ isDirty ? `Modifié` : 'À jour' }}
      </span>
      <ToolbarButton class="tr-btn-primary" :disabled="!isDirty" @click="emit('publish')"
        >Publier</ToolbarButton
      >
    </ToolbarRoot>
  </div>
</template>
