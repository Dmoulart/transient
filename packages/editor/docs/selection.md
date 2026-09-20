# Selection

## State

`selected: HTMLElement | null`

## Derived

`selectedComponent: selected.closest(component) if editable`
`selectedSlot: selected && selected === transient-slot if editable`
`selectedText: selected && selected.isContentEditable`

## Transitions

`editable.onClik = selected = editable`
`nonEditable.onClick | escape | panel.onClose = selected = null`
`selectedText.onBlur = applyEdition`
