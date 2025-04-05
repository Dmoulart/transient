import PrototypeView from '@/components/PrototypeView.vue'
import { useMouseInElement } from '@vueuse/core'
import { computed, ref } from 'vue'

export function useMouseIsAbove() {
  const prototypeView = document.getElementById('prototype-view')!
  console.log(prototypeView)
  return {
    prototypeView: useMouseInElement(prototypeView),
  }
}
