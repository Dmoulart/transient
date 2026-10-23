import { ref } from "vue";

const slashMenu = {
  open: ref(false),
  rect: ref<DOMRect | null>(null),
};

export function useSlashMenu() {
  return slashMenu;
}
