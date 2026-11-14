import { forEachKeys } from '@transient/core'
import { tryOnScopeDispose } from '@vueuse/core'
import { shallowRef } from 'vue'
import type { Edition, Editions } from '../edition/edition'
import type { Editor, Selection } from './use-editor'

type Hooks = EditionHooks & SelectHooks

type EditionHooks = {
  [type in Edition['type']]: Editions[type]
}

type SelectHooks = {
  select: Selection
}

export type HookHandler<K extends keyof Hooks> = (data: Hooks[K], editor: Editor) => void

export type HooksHandlers = {
  [K in keyof Hooks]: Set<HookHandler<K>>
}

export function useEditorHooks() {
  const hooks = shallowRef<HooksHandlers>({
    'add-component': new Set(),
    'delete-element': new Set(),
    'replace-slot-content': new Set(),
    'move-element': new Set(),
    'update-prop': new Set(),
    select: new Set(),
  })

  function run<T extends keyof HooksHandlers>(hook: T, payload: Hooks[T], editor: Editor) {
    hooks.value[hook].forEach((handler) => {
      handler(payload, editor)
    })
  }

  function on<T extends keyof HooksHandlers>(hook: T, handler: HookHandler<T>) {
    hooks.value[hook].add(handler)

    return () => off(hook, handler)
  }

  function once<T extends keyof HooksHandlers>(hook: T, handler: HookHandler<T>) {
    const stop = on(hook, (data, editor) => {
      handler(data, editor)
      stop()
    })
  }

  function off<T extends keyof HooksHandlers>(hook: T, handler: HookHandler<T>) {
    hooks.value[hook].delete(handler)
  }

  function clear<T extends keyof HooksHandlers>(hook: T) {
    hooks.value[hook].clear()
  }

  function reset() {
    forEachKeys(hooks.value, clear)
  }

  tryOnScopeDispose(reset)

  return { run, on, once, off, clear, reset }
}

export type EditorHooks = ReturnType<typeof useEditorHooks>
