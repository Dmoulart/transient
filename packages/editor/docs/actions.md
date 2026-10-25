# Actions

## Vocabulaire
- Sélection : aucune | composant | slot vide | slot en édition
- Flux : sens dans lequel les frères s'enchaînent dans le parent
  (calculé depuis le style du parent, voir « Règle du flux »)
- Modèle de contenu d'un slot : inline ou bloc, déduit de l'élément qui le rend
  (voir « Règle du modèle de contenu »)

## Actions (le quoi)
| Action           | Cible     | Effet                                                |
|------------------|-----------|------------------------------------------------------|
| insert-after     | composant | insère un composant juste après, même slot           |
| delete           | composant | supprime le composant                                |
| edit-slot        | slot      | passe le slot en édition (texte libre)               |
| insert-component | slot en édition | insère un composant au curseur                 |

Remplir un slot est une seule action : on entre en édition, puis on tape du texte
ou on insère un composant. Pas de choix « texte ou composant » en amont.

## Affordances (le comment, par état)
### Composant sélectionné
- Label + Supprimer : coin haut-gauche, toujours
- `+` (insert-after) : milieu du bord de fin de flux

### Slot vide
- clic dans la bbox → edit-slot, curseur dedans, placeholder « Tapez du texte ou / »
- `+` au centre → edit-slot puis ouvre le menu de composants

### Slot en édition
- taper → texte libre
- `/` → menu de composants (même menu que le `+`)

## Règle du modèle de contenu
Le texte libre est toujours autorisé. Le modèle ne filtre que les composants proposés :
- inline (parent `p`, `h1`–`h6`, `span`, `a`, `button`, `label`…) → composants inline uniquement
- bloc (tout le reste : `div`, `section`, flex, grid…) → tous les composants

Un slot « blocs uniquement » passera par une annotation explicite, quand un cas réel le demandera.

## Règle du flux
block / column → bas ; row / inline → droite ;
*-reverse et rtl inversent ; grid suit grid-auto-flow
