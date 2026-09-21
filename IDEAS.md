# Ideas

## Save = PR

L'éditeur sort du code (SFC), pas du JSON. Donc git est le CMS.

- Un rédacteur édite la page en place → save = commit sur une branche → PR + preview deploy.
- Le dev review un diff de SFC, pas un JSON.
- Pas de DB, pas de sync, pas de « publish » : le workflow que l'équipe a déjà.

### Ce que ça supprime

- Backend, auth, stockage, staging, versioning : tout est git.
- Le lock-in : le jour où on retire l'éditeur, le code reste.

### Ce que ça donne gratuitement

- Historique, revert, review, branches, preview.
- Bidirectionnel : le dev retouche le SFC à la main, l'éditeur le re-parse.

### Git sur du contenu

Tout ce que git sait faire sur du code, on l'a sur le contenu et le layout, sans rien construire.

- Bisect visuel : « bon / cassé » à chaque commit, l'éditeur fait le bisect derrière.
- Blame par nœud : l'id transient est stable → historique et revert d'un seul élément.
- Bisect sur une métrique : quel changement de wording a fait chuter la conversion.
- A/B = branches. Le winner se merge.
- Visual regression : screenshot diff entre deux previews, oracle automatique du bisect.
- Timeline : `git log` du SFC → chaque version rendue dans le playground avec la même fixture → scrubber. Le vrai composant, interactif, à chaque étape.
- Diff structurel : ids stables → on sait quel nœud / prop / texte a changé, surligné dans le rendu. Même mécanisme pour une page (preview + donnée épinglée).

### Behaviors

Composants renderless à scoped slot (style `@vueuse/components`). La logique vit dans le code, l'éditeur câble.

- Wrap = ajouter un comportement. Pile de behaviors sur le nœud sélectionné, réordonnable.
- Palette gratuite : introspection de `node_modules` (`UseMouse`, `UseNow`, `UseIntersectionObserver`…) + ceux du projet.
- Les fonctions du scope sont bindables sur les événements : `UseToggle` → `@click="toggle"`, `:open="value"`. Interactivité sans script.
- Épingler un état : `isHovered = true`, `response = []` → designer hover / dark / vide sans les déclencher. Branches cachées d'un `<Show>` en fantôme.
- Les stores du projet exposés en behaviors (`<UseCart v-slot="{ items, add }">`) → pages fonctionnelles, état dans le code.
- Extraire une pile de behaviors en un renderless SFC.
- Playground d'un behavior = table de scope live. `UseFetch` = explorateur d'API.
- Garde-fou : le flux de données est un overlay en lecture, jamais un éditeur de graphe.

### Rayons X (lecture seule, sur la page)

Vue devtools montre un arbre à côté ; ici on dessine sur le rendu, la mémoire spatiale reste.

- Scopes = régions imbriquées autour de leur sous-arbre. Bounding box généralisée.
- Flux = traits : survol d'une valeur → son behavior source, valeur live. Survol d'un behavior → tout ce qu'il alimente.
- « Pourquoi c'est affiché / vide ? » → chaîne de conditions et de sources avec leurs valeurs courantes.
- Code mort grisé : variable de scope sans consommateur, behavior sans lecteur.
- Trois teintes : composant / HTML brut / slot, et d'où chaque slot est rempli.
- Export : diagramme d'archi auto-généré, toujours à jour, pour une PR ou la doc. Onboarding en un coup d'œil.

### Autres

- i18n en place : texte bindé à `$t('key')`, on traduit sur la page en voyant le layout, save écrit la locale.
- Le CMS est un behavior : `<UseStoryblok v-slot="{ story }">`. Le CMS devient une source, pas l'éditeur.
- Permissions = `CODEOWNERS`. Zéro auth à construire.
- Le dev déclare la surface d'édition : composant figé, prop contrainte (`maxLength`).
- `data-transient-id` stables = test ids gratuits → enregistrer une interaction → test Playwright.
- a11y live : axe-core en overlay sur le vrai DOM pendant la frappe, PR bloquée si régression.
- Avant/après en swipe pour le rédacteur et le reviewer, diff de code à côté.
- Aller-retour Figma via Code Connect : vraies instances dans les deux sens.
- Copier-coller entre projets : IR portable, composants manquants → stub. Coller du HTML → mappé sur les composants.

### Ouvertures

- Extraire une sélection en composant → génère un SFC, infère les props, remplace les occurrences.
- Commentaires ancrés sur un nœud → atterrissent dans la PR.
- Distribution : plugin Vite, `?edit` sur l'URL, écriture des fichiers via le dev server.
