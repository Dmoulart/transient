# Architecture

## IR

| attribute                   | type                  | purpose 
| dataset-transient-id        | uuid                  | identify a unique element of a template.
| dataset-transient-component | string                | identify the transient component which the element is an instance of, it is only placed on the root element of the component.
| dataset-transient-slot      | {slotName}:{id}       | identify the parent element of a slot.  

## Selection

### State

`selected: HTMLElement | null`

### Derived

`selectedComponent: selected.closest(component) if editable`
`selectedSlot: selected && selected === transient-slot if editable`
`selectedText: selected && selected.isContentEditable`

### Transitions

`editable.onClik = selected = editable`
`nonEditable.onClick | escape | panel.onClose = selected = null`
`selectedText.onBlur = applyEdition`

### Text edition

`editing: transientId | null` — un seul nœud éditable à la fois.

#### Promote — `pointerdown` sur un nœud text-éditable

1. `editing = id` → le nœud rend son HTML en une fois (`v-html`), plus de `v-for` : aucun fragment, aucune ancre à l'intérieur
   les composants enfants deviennent `<span data-transient-island contenteditable="false">` (instantané figé)
2. `await nextTick()` — le DOM doit être remplacé avant de poser le caret
3. `node.contentEditable = 'true'` puis `node.focus()`
4. caret via `caretPositionFromPoint(ev.clientX, ev.clientY)`
   sans ça le clic est perdu : le nœud n'était pas éditable au moment du `mousedown`

#### Demote — `focusout` (hors toolbar)

1. parse `node.innerHTML` → `edit-element` / `edit-slot` — **avant** de démonter
   `data-transient-island` se re-parse en « élément inchangé », on ne lit jamais le DOM interne d'un composant
2. `node.removeAttribute('contenteditable')`
3. `editing = null` → Vue reprend le rendu des enfants

#### Invariants

- au repos, aucun `contenteditable` dans le canvas
- pendant l'édition, Vue ne rend rien à l'intérieur du nœud édité
- toolbar en `@mousedown.prevent`, sinon le clic provoque un `focusout` → demote
- `escape` = blur = commit

### Rules

| Nœud                          | Marqueur                   | Sélectionnable        | Text-éditable                      |
| ----------------------------- | -------------------------- | --------------------- | ---------------------------------- |
| HTML du template (`h1`, `p`)  | `data-transient-id`        | oui                   | oui, si contenu = texte seulement  |
| Instance de composant         | `data-transient-component` | oui (props)           | non                                |
| DOM interne d'un composant    | aucun                      | non (remonte au parent) | non                              |
| Zone de slot                  | `data-transient-slot`      | oui                   | oui, si vide ou texte nu           |
| Îlot pendant l'édition        | `data-transient-island`    | —                     | non, atomique                      |
