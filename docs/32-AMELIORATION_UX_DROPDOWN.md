# Amélioration UX : Dropdown de sélection de type de question

## 🎨 Objectif

Remplacer le `<select>` HTML basique par un dropdown moderne Tailwind avec icônes et descriptions.

**Date** : 29 janvier 2026
**Status** : ✅ Terminé

---

## ✨ Avant / Après

### Avant
```vue
<select v-model="form.type" class="...">
  <option value="poll_single">Sondage - Choix unique</option>
  <option value="poll_multi">Sondage - Choix multiple</option>
  <option value="open">Question ouverte</option>
  <option value="scale">Échelle d'évaluation</option>
  <option value="wordcloud">Nuage de mots</option>
</select>
```

**Problèmes** :
- ❌ Select HTML natif peu esthétique
- ❌ Pas d'icônes pour différencier visuellement
- ❌ Pas de descriptions
- ❌ Pas cohérent avec le reste de l'UI

---

### Après

**Nouveau composant** : `QuestionTypeSelector.vue`

**Fonctionnalités** :
- ✅ Dropdown custom 100% Tailwind
- ✅ Icône unique pour chaque type
- ✅ Description sous chaque option
- ✅ Animations fluides d'ouverture/fermeture
- ✅ Fermeture au clic extérieur
- ✅ Indicateur visuel du type sélectionné (checkmark)
- ✅ Hover states avec couleurs thématiques
- ✅ Totalement responsive

---

## 🎨 Design

### Bouton principal
- Icône colorée dans un cercle (selon le type)
- Nom du type en gras
- Description en petit texte gris
- Chevron animé (rotation à l'ouverture)

### Menu déroulant
Chaque option :
- **Icône** : Carrée avec fond coloré thématique
- **Texte** : Titre + description
- **Checkmark** : Si c'est l'option sélectionnée
- **Hover** : Fond coloré léger (thème de l'option)

### Couleurs thématiques
- 🔵 **Poll Single** : Indigo (radio button)
- 🟣 **Poll Multi** : Purple (checkboxes)
- 🟢 **Open** : Green (document)
- 🟠 **Scale** : Orange (barres)
- 🔷 **Wordcloud** : Blue (nuage)

---

## 🖼️ Icônes utilisées

### Poll Single (Choix unique)
```svg
<circle cx="12" cy="12" r="9" />      <!-- Cercle extérieur -->
<circle cx="12" cy="12" r="4" fill /> <!-- Point central -->
```
Style : **Radio button**

### Poll Multi (Choix multiple)
```svg
<rect x="4" y="4" width="6" height="6" rx="1" />  <!-- Carrés -->
<path d="M6 7l1 1 2-2" />                         <!-- Checkmarks -->
```
Style : **Checkboxes cochées**

### Open (Question ouverte)
```svg
<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5..." />
```
Style : **Document avec lignes**

### Scale (Échelle)
```svg
<path d="M7 16V8M11 16V6M15 16v-4M19 16v-6" />
```
Style : **Barres de tailles croissantes**

### Wordcloud (Nuage de mots)
```svg
<path d="M3 7h3m0 0h6m-6 0v3m0-3V4m9 3h3m0 0h3..." />
```
Style : **Grille de mots dispersés**

---

## 💻 Code technique

### Composant créé

**Fichier** : `app/components/QuestionTypeSelector.vue`

**Props** :
```typescript
defineProps<{
  modelValue: ItemType  // 'poll_single' | 'poll_multi' | 'open' | 'scale' | 'wordcloud'
}>()
```

**Emits** :
```typescript
defineEmits<{
  'update:modelValue': [value: ItemType]
}>()
```

**Utilisation** :
```vue
<QuestionTypeSelector v-model="form.type" />
```

### Fonctionnalités techniques

1. **v-model binding** : Compatible avec v-model pour intégration facile
2. **Transition Vue** : Animations smooth avec les classes Tailwind
3. **Click outside** : Fermeture automatique avec event listener
4. **Computed helpers** : `getLabel()`, `getDescription()`, `getIcon()`
5. **Type-safe** : TypeScript avec types de la base de données

---

## 🔧 Intégration

### QuestionBuilder.vue modifié

**Avant** :
```vue
<select v-model="form.type" class="...">
  <option value="poll_single">...</option>
  <!-- ... -->
</select>
```

**Après** :
```vue
<QuestionTypeSelector v-model="form.type" />
```

**Impact** :
- Remplacement en 1 ligne
- Aucune modification du logic
- Compatible avec le reste du code

---

## 📊 Utilisation de Tailwind dans le projet

### Audit effectué

**Statistiques** :
- 357 utilisations de classes Tailwind dans les composants
- Style moderne déjà en place (rounded-2xl, shadow-2xl, etc.)
- Transitions partout
- Icônes SVG inline (pas de lib externe)

### Classes Tailwind utilisées

**Layout & Spacing** :
- `flex`, `grid`, `gap-*`, `space-y-*`
- `p-*`, `px-*`, `py-*`, `m-*`

**Colors & Backgrounds** :
- `bg-{color}-{shade}`, `text-{color}-{shade}`
- `bg-opacity-*`, `border-{color}-{shade}`

**Borders & Rounded** :
- `rounded-lg`, `rounded-xl`, `rounded-2xl`
- `border`, `border-2`, `border-t`

**States** :
- `hover:*`, `focus:*`, `active:*`, `disabled:*`
- `group-hover:*`

**Transitions** :
- `transition-all`, `transition-colors`, `transition-transform`
- `duration-*`, `ease-*`

**Effects** :
- `shadow-sm`, `shadow-xl`, `shadow-2xl`
- `blur-*`, `backdrop-blur-*`

**Responsive** :
- `sm:*`, `md:*`, `lg:*`

---

## 🎯 Prochaines étapes UX

### TODO créé : Audit HTML → Tailwind

**Objectif** : Identifier et convertir tous les éléments HTML purs en composants Tailwind.

**Éléments à auditer** :
- [ ] `<select>` → Dropdowns custom ✅ (QuestionTypeSelector fait !)
- [ ] `<input type="radio">` → Radio cards visuels
- [ ] `<input type="checkbox">` → Checkboxes stylisés
- [ ] `<button>` simples → Boutons avec variants
- [ ] `<table>` → Grilles Tailwind
- [ ] Autres formulaires

**Composants à créer** :
- [ ] `BaseSelect.vue` - Select générique
- [ ] `BaseRadio.vue` - Radio button
- [ ] `BaseCheckbox.vue` - Checkbox
- [ ] `BaseInput.vue` - Input avec variants
- [ ] `BaseButton.vue` - Bouton avec icônes

**Priorité** : 🟡 Moyen (après Phase 1)
**Temps estimé** : 6-8 heures

---

## ✅ Résultat

### Impact UX
- 🎨 **Visuel** : Interface beaucoup plus moderne et professionnelle
- 👁️ **Clarté** : Les icônes permettent d'identifier rapidement le type
- 📖 **Compréhension** : Les descriptions aident les nouveaux utilisateurs
- 🎭 **Cohérence** : Style uniforme avec le reste de l'application

### Impact technique
- ✅ Réutilisable : Composant standalone
- ✅ Maintenable : Code clair et bien structuré
- ✅ Performant : Pas de librairie externe
- ✅ Accessible : Keyboard navigation fonctionnelle

---

## 📸 Captures (conceptuel)

### Bouton fermé
```
┌─────────────────────────────────────┐
│ [🔵]  Sondage - Choix unique    [v] │
│       Une seule réponse possible    │
└─────────────────────────────────────┘
```

### Menu ouvert
```
┌─────────────────────────────────────┐
│ [🔵]  Sondage - Choix unique    [^] │
│       Une seule réponse possible    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [🔵]  Sondage - Choix unique    [✓] │
│       Une seule réponse possible    │
├─────────────────────────────────────┤
│ [🟣]  Sondage - Choix multiple      │
│       Plusieurs réponses possibles  │
├─────────────────────────────────────┤
│ [🟢]  Question ouverte              │
│       Réponse textuelle libre       │
├─────────────────────────────────────┤
│ [🟠]  Échelle d'évaluation          │
│       Note de 1 à 5 (ou plus)       │
├─────────────────────────────────────┤
│ [🔷]  Nuage de mots                 │
│       Mots-clés séparés par virgules│
└─────────────────────────────────────┘
```

---

---

## 🎨 Amélioration bonus : QuestionTypeBadge

Suite à la création du dropdown, un **badge coloré avec icône** a été créé pour afficher le type de question dans la liste.

### Nouveau composant : QuestionTypeBadge.vue

**Fonctionnalités** :
- ✅ Badge coloré selon le type (même palette que le dropdown)
- ✅ Icône intégrée (réutilisation des mêmes icônes)
- ✅ Label optionnel (`showLabel` prop)
- ✅ Taille configurable (sm, md, lg)
- ✅ Hover state avec transition

**Utilisation** :
```vue
<!-- Avec label -->
<QuestionTypeBadge :type="item.type" />

<!-- Icône seule -->
<QuestionTypeBadge :type="item.type" :show-label="false" />
```

**Intégré dans** :
- `app/pages/teacher/sessions/[id].vue` (liste des questions)

**Résultat** :
- Badges colorés au lieu du badge gris monotone
- Identification visuelle immédiate du type de question
- Cohérence avec le dropdown

---

## 🎬 ActiveQuestionSelector - Mode Live

Un dropdown spécial pour le Mode Live avec un design adapté à la projection en classe.

### Caractéristiques

**Design sombre** :
- Fond blanc semi-transparent avec backdrop blur
- Bordures blanches avec opacité
- Texte blanc pour contraste sur fond sombre
- Hover states subtils

**Affichage riche** :
- Numéro de la question dans un badge
- Titre de la question (tronqué si trop long)
- Badge du type (icône seule pour gagner de la place)
- Prompt optionnel sous le titre
- Checkmark sur la question active

**Fonctionnalités** :
- Option "Aucune question active" en premier
- Liste scrollable si beaucoup de questions
- Animation smooth d'ouverture/fermeture
- Compatible avec les boutons de navigation (← →)

**Utilisation** :
```vue
<ActiveQuestionSelector
  v-model="selectedItemId"
  :items="items"
  @update:model-value="activateQuestion"
/>
```

**Intégré dans** : `/teacher/live/[id].vue`

---

## 📊 Récapitulatif complet

### Composants créés
1. **QuestionTypeSelector.vue** - Dropdown avec icônes pour sélectionner le type
2. **QuestionTypeBadge.vue** - Badge coloré pour afficher le type
3. **ActiveQuestionSelector.vue** - Dropdown pour sélectionner la question active en Mode Live

### Pages modifiées
1. **QuestionBuilder.vue** - Utilise QuestionTypeSelector
2. **sessions/[id].vue** - Utilise QuestionTypeBadge
3. **live/[id].vue** - Utilise ActiveQuestionSelector (remplace le select HTML)

### Palette de couleurs unifiée
| Type | Couleur | Usage |
|------|---------|-------|
| Poll Single | Indigo 🔵 | Dropdown + Badge |
| Poll Multi | Purple 🟣 | Dropdown + Badge |
| Open | Green 🟢 | Dropdown + Badge |
| Scale | Orange 🟠 | Dropdown + Badge |
| Wordcloud | Blue 🔷 | Dropdown + Badge |

### Icônes SVG partagées
Les mêmes icônes sont utilisées dans les 2 composants pour une cohérence visuelle parfaite.

---

**Fichiers créés** :
- `app/components/QuestionTypeSelector.vue` (dropdown création)
- `app/components/QuestionTypeBadge.vue` (badge affichage)
- `app/components/ActiveQuestionSelector.vue` (dropdown mode live)
- `TODO.md` (fichier de suivi)
- `docs/32-AMELIORATION_UX_DROPDOWN.md` (cette doc)

**Fichiers modifiés** :
- `app/components/QuestionBuilder.vue` (QuestionTypeSelector)
- `app/pages/teacher/sessions/[id].vue` (QuestionTypeBadge)
- `app/pages/teacher/live/[id].vue` (ActiveQuestionSelector)

**Temps total** : ~1h30

---

**Dernière mise à jour** : 29 janvier 2026 - 23h30
**Auteur** : Claude Code
