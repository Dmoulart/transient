<template>
  <button
    :class="['button', variant, size, { disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    {{ text }}
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits(['click'])

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
</script>

<style scoped>
.button {
  all: unset;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
  user-select: none;
}

.button:active:not(.disabled) {
  transform: scale(0.98);
}

.button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button.primary {
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
}

.button.primary:hover:not(.disabled) {
  background-color: #0056b3;
}

.button.secondary {
  background-color: #f3f4f6;
  color: #111827;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.button.secondary:hover:not(.disabled) {
  background-color: #e5e7eb;
}

.button.outline {
  border: 2px solid #007bff;
  color: #007bff;
}

.button.outline:hover:not(.disabled) {
  background-color: rgba(0, 123, 255, 0.1);
}

.button.danger {
  background-color: #dc3545;
  color: white;
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.2);
}

.button.danger:hover:not(.disabled) {
  background-color: #c82333;
}

.button.sm {
  font-size: 12px;
  padding: 8px 16px;
}

.button.md {
  font-size: 14px;
}

.button.lg {
  font-size: 16px;
  padding: 14px 24px;
}
</style>
