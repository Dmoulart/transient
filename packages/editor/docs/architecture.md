# Architecture

## DOM IR

Every IR node is rendered between two comments

- open: `<!--tst:{type}:{key}[:{name}]-->`
- close: `<!--/tst:{key}-->`

| type        | key                    | name                 |
| ----------- | ---------------------- | -------------------- |
| `element`   | element id             | tag (`div`)          |
| `component` | instance id            | component (`Button`) |
| `slot`      | `{ownerId}:{slotName}` | —                    |

Invariants:

- markers are well nested
- a key is unique in the page, so a close marker always matches exactly one open marker

```html
<!--tst:element:3c2e:h1-->
<h1>Bienvenue</h1>
<!--/tst:3c2e-->
<!--tst:component:a91c:Button-->
<button>
  <!--tst:slot:a91c:default-->
  <!--tst:element:7d10:strong-->
  <strong>Envoyer</strong>
  <!--/tst:7d10-->
  maintenant
  <!--/tst:a91c:default-->
</button>
<!--/tst:a91c-->
```

## Selection

Only IR nodes can be selected.
A pointerdown or focus on DOM that belongs to no IR node resolves to the nearest enclosing IR node.

That resolved node is the state; the three targets are derived from it and can coexist.

| target      | derived as                             | action                                                       |
| ----------- | -------------------------------------- | ------------------------------------------------------------ |
| `element`   | the resolved node, if an element       | open richtext editor if text only                            |
| `slot`      | nearest enclosing slot (or itself)     | highlight, add button when empty, open richtext if text only |
| `component` | nearest enclosing instance (or itself) | highlight, open props panel                                  |

## Richtext edition

When richtext edition mode is active a few rules apply.
A new html element is created. The "edition container".
Its goal si to secure the browser text edition by isolating the zone ownership from Vue.

1. A parent element is created. data-tst-ghost is used to avoid capture of the container.
2. Every created Vue component in the zone (already present or added) is marked with "contentEditable=false"

On focusout an edit event is dispatched and the edition container is removed, its descendants are preserved.
