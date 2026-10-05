# UX de l'éditeur

Pour chaque état : comment on le déduit → ce qu'on affiche.

## Composant sélectionné

### Bloc
- **Déduction** : `display` calculé ≠ `inline*`, parent en flux vertical.
- **Affichage** : cadre teal, étiquette, supprimer, props, « + » en bas.

### Dans une rangée
- **Déduction** : parent en `flex-direction: row` ou `grid`.
- **Affichage** : idem bloc, « + » à droite.

### Inline
- **Déduction** : `display` calculé `inline*`.
- **Affichage** : cadre teal, étiquette, supprimer, props. Pas de « + ».

## Slot mis en évidence

### Slot de texte, rempli
- **Déduction** : `defineSlots` texte, sinon conteneur texte (`p`, `h*`, `span`, `button`, inline), sinon contient du texte.
- **Affichage** : pointillés ambre. Clic → édition.

### Slot de texte, vide
- **Déduction** : slot de texte sans contenu.
- **Affichage** : pointillés ambre, nom du slot. Clic → édition, texte d'aide « Écrire, ou / pour insérer ».

### Slot de mise en page, rempli
- **Déduction** : `defineSlots` blocs, sinon conteneur `flex`/`grid`, sinon ne contient que des composants.
- **Affichage** : pointillés ambre.

### Slot de mise en page, vide
- **Déduction** : slot de mise en page sans contenu.
- **Affichage** : pointillés ambre, nom du slot, « + » au centre.

### Fallback affiché
- **Déduction** : clé du fragment de slot en `_fb`.
- **Affichage** : comme un slot vide. Le fallback n'est pas éditable, il disparaît dès qu'on écrit.

### Slot non rendu
- **Déduction** : présent dans le template, absent de `index.slots()` (masqué par une prop).
- **Affichage** : rien sur le canvas, signalé dans le panneau de props.

### Slot répété
- **Déduction** : plusieurs emplacements de même nom dans `index.slots()`.
- **Affichage** : chaque copie en pointillés. On n'édite que la copie cliquée.

## Édition de texte

- **Déduction** : `editing` défini.
- **Affichage** : trait ambre plein, halo, onglet `✎ #slot`. Barre du composant masquée. `/` → panneau de composants, insertion au curseur.
