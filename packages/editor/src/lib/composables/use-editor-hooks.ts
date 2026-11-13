import { forEachKeys } from '@transient/core'
import { tryOnScopeDispose } from '@vueuse/core'
import { shallowRef } from 'vue'
import type { Edition, Editions } from '../edition/edition'
import type { Editor } from './use-editor'

export type OnAppliedEdition<T extends Edition> = (edition: T, editor: Editor) => void

type AppliedEditionHooks = {
  [type in Edition['type']]: Set<OnAppliedEdition<Editions[type]>>
}


export function useEditorHooks() {
  const hooks = shallowRef<AppliedEditionHooks>({
    'add-component': new Set(),
    'delete-element': new Set(),
    'replace-slot-content': new Set(),
    'move-element': new Set(),
    'update-prop': new Set(),
  })

  function run<T extends keyof Editions>(type: T, edition: Editions[T], editor: Editor) {
    hooks.value[type].forEach((callback) => {
      callback(edition, editor)
    })
  }

  function on<T extends Edition['type']>(editionType: T, callback: OnAppliedEdition<Editions[T]>) {
    hooks.value[editionType].add(callback)

    return () => off(editionType, callback)
  }

  function off<T extends Edition['type']>(editionType: T, callback: OnAppliedEdition<Editions[T]>) {
    hooks.value[editionType].delete(callback)
  }

  function clear<T extends Edition['type']>(editionType: T) {
    hooks.value[editionType].clear()
  }

  function reset() {
    forEachKeys(hooks.value, clear)
  }

  tryOnScopeDispose(reset)

  return { run, on, off, clear, reset }
}

export type EditorHooks = ReturnType<typeof useEditorHooks>
