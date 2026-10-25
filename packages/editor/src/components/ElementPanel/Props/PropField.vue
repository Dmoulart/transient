<template>
  <input v-if="kind === 'string'" :id="id" v-model="text" class="tr-field">

  <SwitchRoot v-else-if="kind === 'boolean'" :id="id" v-model="checked" class="tr-switch">
    <SwitchThumb class="tr-switch-thumb" />
  </SwitchRoot>

  <NumberFieldRoot
    v-else-if="kind === 'integer' || kind === 'decimal'"
    v-model="number"
    :step="1"
    :format-options="{ maximumFractionDigits: kind === 'integer' ? 0 : 10 }"
    class="tr-flex tr-items-center tr-gap-1"
  >
    <NumberFieldDecrement class="tr-icon-btn">
      <span class="tr-i-lucide-minus" aria-hidden="true" />
    </NumberFieldDecrement>
    <NumberFieldInput :id="id" class="tr-field" />
    <NumberFieldIncrement class="tr-icon-btn">
      <span class="tr-i-lucide-plus" aria-hidden="true" />
    </NumberFieldIncrement>
  </NumberFieldRoot>

  <ToggleGroupRoot
    v-else-if="options && options.length <= 4"
    :id="id"
    v-model="choice"
    type="single"
    class="tr-segmented"
  >
    <ToggleGroupItem v-for="option in options" :key="option" :value="option" class="tr-segment">
      {{ option }}
    </ToggleGroupItem>
  </ToggleGroupRoot>

  <SelectRoot v-else-if="options" v-model="choice">
    <SelectTrigger :id="id" class="tr-field tr-flex tr-items-center tr-justify-between">
      <SelectValue />
      <span class="tr-i-lucide-chevron-down" aria-hidden="true" />
    </SelectTrigger>
    <SelectPortal to=".tr-root">
      <SelectContent
        class="tr-menu tr-min-w-[var(--reka-select-trigger-width)] tr-max-h-[var(--reka-select-content-available-height)]"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport>
          <SelectItem v-for="option in options" :key="option" :value="option" class="tr-menu-item">
            <SelectItemText>{{ option }}</SelectItemText>
            <SelectItemIndicator class="tr-i-lucide-check" />
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
  <textarea
    v-else
    :id="id"
    class="tr-field tr-font-mono tr-h-auto tr-py-2"
    rows="3"
    :value="text"
    @change="model = ($event.target as HTMLTextAreaElement).value"
  />
</template>

<script setup lang="ts">
import {
  type BindingValue,
  getTypeKind,
  type TransientProp,
  type TransientType,
} from '@transient/ir'
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  SwitchRoot,
  SwitchThumb,
  ToggleGroupItem,
  ToggleGroupRoot,
} from 'reka-ui'
import { computed } from 'vue'

const props = defineProps<{ id: string; prop: TransientProp }>()

const model = defineModel<BindingValue>()

const kind = computed(() => getTypeKind(props.prop.type))

// enum, or a union of string enums, both become a list of options
const options = computed(() => {
  const type = props.prop.type
  if (typeof type === 'string') return null
  if (type.kind === 'enum') return type.enum
  if (type.kind === 'union' && type.union.every((t) => typeof t !== 'string' && t.kind === 'enum'))
    return type.union.flatMap((t) => (t as TransientType<'enum'>).enum)
  return null
})

const current = computed(() => model.value ?? props.prop.default)

const text = computed({
  get: () => (current.value === undefined ? '' : String(current.value)),
  set: (value: string) => {
    model.value = value
  },
})

// options keep their type: 2 for `1 | 2 | 3`, '2' for `'1' | '2'`
const choice = computed({
  get: () => current.value as string | number | undefined,
  set: (value: string | number | undefined) => {
    model.value = value
  },
})

const checked = computed({
  get: () => current.value === true || current.value === 'true',
  set: (value: boolean) => {
    model.value = value
  },
})

// attributes saved before defaults were typed can still hold strings ("3")
const number = computed({
  get: () =>
    current.value === undefined || current.value === '' ? undefined : Number(current.value),
  set: (value: number | undefined) => {
    model.value = value
  },
})
</script>
