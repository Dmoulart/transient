import type { Component } from 'vue'

export type FieldRule = {
  component: string
  prop: string
  use: Component
}

export type FieldRules = FieldRule[]
