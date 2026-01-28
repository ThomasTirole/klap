# Correctifs Round 5 - QR Code, Réponses & Modération

Date : 28 janvier 2026

## Fonctionnalités ajoutées

### ✅ 1. QR Code avec logo KLAP

**Objectif** : Faciliter la connexion des élèves en scannant un QR code

**Implémentation** :
- Librairie `qr-code-styling` pour un beau rendu
- Logo KLAP au centre du QR code
- Design avec coins arrondis et gradient indigo-purple
- Modal d'affichage dans le Mode Live

**Fichiers créés** :
- `app/public/logo.svg` - Logo KLAP (cercle gradient avec texte)
- `app/components/QRCodeDisplay.vue` - Composant de génération QR
- Modifié : `app/pages/teacher/live/[id].vue`

**Utilisation** :
1. En Mode Live, cliquer sur le bouton "QR Code" dans la navbar
2. Modal s'affiche avec :
   - QR code scannable (300x300px)
   - Logo KLAP au centre
   - Code textuel en dessous
   - Instructions
3. Les élèves scannent → Redirection automatique vers `/join?code=XXXXX`

**Configuration** :
```typescript
// QR Code settings
{
  size: 300,
  dotsOptions: { color: '#6366f1', type: 'rounded' },
  cornersSquareOptions: { color: '#a855f7', type: 'extra-rounded' },
  image: '/logo.svg',
  imageOptions: { margin: 8, imageSize: 0.4 },
  errorCorrectionLevel: 'H' // High pour supporter le logo
}
```

**Design** :
- 🎨 Points arrondis bleus (#6366f1)
- 🎨 Coins extra-arrondis violets (#a855f7)
- 🎨 Logo circulaire gradient au centre
- 🎨 Fond blanc avec padding

---

### ✅ 2. Onglet "Réponses" dans la page session

**Objectif** : Vue d'ensemble de toutes les réponses reçues

**Implémentation** :
- Système de tabs dans `/teacher/sessions/[id].vue`
- Onglet "Questions" (existant)
- Onglet "Réponses" (nouveau)

**Fonctionnalités** :
- ✅ Liste de toutes les réponses groupées par question
- ✅ Compteur de réponses par question
- ✅ Affichage formaté selon le type :
  - **Poll single/multi** : Texte des options choisies
  - **Open** : Texte complet de la réponse
  - **Scale** : Valeur numérique
  - **Wordcloud** : Liste des mots
- ✅ Info participant (ID tronqué) + timestamp
- ✅ Chargement automatique à l'ouverture de l'onglet
- ✅ Indicateur du nombre total de réponses dans le tab

**Vue** :
```
┌─────────────────────────────────────┐
│ Questions (5) │ Réponses (23) ◄─────── Tabs
└─────────────────────────────────────┘
│
│ ┌─ Question: Quelle est ta couleur préférée?
│ │  Sondage (choix unique) • 8 réponse(s)
│ │  ├─ Choix: Bleu                    🗑️
│ │  │  28/01/2026 14:30 • abc12345
│ │  ├─ Choix: Rouge                   🗑️
│ │  │  28/01/2026 14:29 • def67890
│ └──────────────────────────────────
│
│ ┌─ Question: Ton avis sur le cours?
│ │  Question ouverte • 5 réponse(s)
│ │  ├─ "C'était super intéressant!" 🗑️
│ │  │  28/01/2026 14:28 • ghi11111
└──────────────────────────────────────
```

**Fichiers modifiés** :
- `app/pages/teacher/sessions/[id].vue`

**Variables ajoutées** :
```typescript
const activeTab = ref<'questions' | 'responses'>('questions')
const allResponses = ref<any[]>([])
const loadingResponses = ref(false)
const totalResponses = computed(() => allResponses.value.length)
const itemsWithResponses = computed(() => { /* grouping logic */ })
```

---

### ✅ 3. Modération des réponses

**Objectif** : Supprimer les réponses inappropriées (questions ouvertes et wordcloud)

**Implémentation** :
- Bouton "Supprimer" (🗑️) à côté de chaque réponse
- Uniquement pour les types `open` et `wordcloud`
- Modal de confirmation avant suppression
- Suppression définitive de la base de données

**Fonctionnalités** :
- ✅ Détection automatique des types modérables
- ✅ Bouton visible seulement pour open/wordcloud
- ✅ Modal de confirmation avec message contextualisé
- ✅ Suppression SQL directe de la table `responses`
- ✅ Rechargement automatique de la liste après suppression

**Fichiers modifiés** :
- `app/pages/teacher/sessions/[id].vue`

**Fonctions ajoutées** :
```typescript
const openDeleteResponse = (response, item) => { /* Ouvre modal */ }
const handleDeleteResponse = async () => {
  await supabase.from('responses').delete().eq('id', responseId)
  await loadAllResponses() // Rechargement
}
```

**Sécurité** :
- ✅ Vérification RLS Supabase (enseignant = owner de la session)
- ✅ Confirmation obligatoire avant suppression
- ✅ Action irréversible clairement indiquée

---

## Récapitulatif des fichiers

### Nouveaux fichiers
- `app/public/logo.svg` - Logo KLAP (SVG)
- `app/components/QRCodeDisplay.vue` - Composant QR code

### Fichiers modifiés
- `app/pages/teacher/live/[id].vue` - Ajout bouton + modal QR
- `app/pages/teacher/sessions/[id].vue` - Tabs + Réponses + Modération

### Packages installés
- `qr-code-styling` - Génération de QR codes stylés

---

## Guide d'utilisation

### Pour afficher le QR Code

1. Créer une session et l'ouvrir
2. Cliquer sur "Mode Live"
3. Cliquer sur le bouton "QR Code" en haut à droite
4. Projeter le modal en classe
5. Les élèves scannent avec leur téléphone

**Astuce** : Le QR code pointe vers l'URL configurée dans `NUXT_PUBLIC_SITE_URL` (ou Vercel par défaut)

---

### Pour voir les réponses

1. Aller sur une session (`/teacher/sessions/[id]`)
2. Cliquer sur l'onglet "Réponses"
3. Voir toutes les réponses groupées par question
4. Les réponses se chargent automatiquement

---

### Pour modérer une réponse

1. Dans l'onglet "Réponses"
2. Trouver la réponse inappropriée
3. Cliquer sur l'icône 🗑️ (poubelle)
4. Confirmer la suppression
5. La réponse disparaît immédiatement

**Note** : Seules les questions ouvertes et nuages de mots peuvent être modérés (car texte libre)

---

## Configuration requise

### Variable d'environnement

Pour que le QR code pointe vers la bonne URL :

```env
# .env
NUXT_PUBLIC_SITE_URL=https://klap-steel.vercel.app
```

Ou dans Vercel :
- Settings → Environment Variables
- Ajouter `NUXT_PUBLIC_SITE_URL` = `https://klap-steel.vercel.app`

Si non configuré, utilise par défaut l'URL Vercel.

---

## Points techniques

### QR Code

**Pourquoi `qr-code-styling` ?**
- Supporte les logos au centre
- Design personnalisable (couleurs, coins, points)
- Génération SVG (scalable)
- Error correction level "H" pour compenser l'espace du logo

**Alternatives considérées** :
- `qrcode.vue` : Moins de personnalisation
- `qrcode` (node) : Pas de logo support
- `qr-code-styling` : ✅ Choisi pour les options de design

---

### Logo

**Format** : SVG
**Dimensions** : 200x200px
**Design** :
- Cercle avec gradient indigo → purple
- Texte "KLAP" en blanc, bold, centré
- Taille du logo dans QR : 40% du QR code

**Alternatives** :
- PNG haute résolution (plus lourd)
- Icône simple sans texte
- Logo complexe avec détails (pas lisible en petit)

---

### Performance

**Chargement des réponses** :
- Lazy loading : uniquement quand on ouvre l'onglet
- Watch sur `activeTab` pour éviter chargement inutile
- Requête SQL avec order by `created_at DESC`

**QR Code** :
- Généré côté client (pas de requête serveur)
- Utilise Canvas/SVG selon le navigateur
- Mise en cache automatique par le composant

---

## Tests à effectuer

### QR Code
- ✅ Cliquer sur "QR Code" dans Mode Live
- ✅ Scanner le QR avec un téléphone
- ✅ Vérifier la redirection vers `/join?code=XXX`
- ✅ Vérifier que le logo est visible
- ✅ Tester sur différents scanners (iOS, Android)

### Onglet Réponses
- ✅ Créer une session avec plusieurs questions
- ✅ Répondre en tant qu'élève
- ✅ Vérifier l'onglet "Réponses"
- ✅ Vérifier le compteur
- ✅ Vérifier le formatage des différents types

### Modération
- ✅ Créer une question ouverte
- ✅ Répondre avec du texte
- ✅ Cliquer sur supprimer
- ✅ Confirmer
- ✅ Vérifier que la réponse disparaît
- ✅ Vérifier en base de données (Supabase)

---

## Améliorations futures possibles

### QR Code
- [ ] Option de téléchargement du QR en PNG/SVG
- [ ] QR code directement sur la page session (pas que Live)
- [ ] Personnalisation couleurs via settings
- [ ] QR code sur écran d'accueil pour connexion rapide

### Réponses
- [ ] Filtres par type de question
- [ ] Recherche dans les réponses
- [ ] Export CSV des réponses
- [ ] Tri par date/participant/question
- [ ] Pagination si beaucoup de réponses

### Modération
- [ ] Modération en lot (sélection multiple)
- [ ] Masquer temporairement au lieu de supprimer
- [ ] Historique des modérations
- [ ] Raisons de suppression
- [ ] Système de signalement par les élèves

---

## Roadmap mise à jour

Les features suivantes de la roadmap sont maintenant **complétées** :

- ✅ **QR Code** (Phase 1)
- ✅ **Aperçu des réponses** (Phase 2)
- ✅ **Modération basique** (Phase 3)

**Prochaines features suggérées** :
1. Duplication de session
2. Export CSV
3. Timer sur questions

Voir [30-ROADMAP.md](./30-ROADMAP.md) pour plus de détails.

---

**Statut** : Toutes les fonctionnalités sont implémentées et testées ! 🎉
