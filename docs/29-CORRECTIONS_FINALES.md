# Corrections finales - 29 janvier 2026

## 📋 Problèmes rapportés

Suite aux tests utilisateur, 4 problèmes ont été identifiés :

1. ✅ **Sondages (single et multi)** : Barres de progression vides malgré des réponses
2. ✅ **Nuage de mots dans Réponses** : N'affiche pas les mots
3. 🔒 **Suppression** : Ne fonctionne ni en live ni depuis la page Réponses
4. ✅ **Échelle** : Fonctionne correctement (pas de bug)

---

## ✅ Corrections appliquées

### 1. Sondages - Structure du payload incorrecte

**Problème** : Le code cherchait `payload.selected` alors que la vraie structure est :
- Poll single : `{ optionId: string }`
- Poll multi : `{ optionIds: string[] }`

**Fichier** : `app/pages/teacher/sessions/responses-[id].vue`

**Correction dans `getPollStats()`** :
```typescript
// AVANT - ❌ Incorrect
if (Array.isArray(payload.selected)) {
  payload.selected.forEach((id: string) => { ... })
} else if (payload.selected) {
  counts[payload.selected] = ...
}

// APRÈS - ✅ Correct
// Poll multi : optionIds array
if (payload.optionIds && Array.isArray(payload.optionIds)) {
  payload.optionIds.forEach((id: string) => {
    counts[id] = (counts[id] || 0) + 1
  })
}
// Poll single : optionId string
else if (payload.optionId) {
  counts[payload.optionId] = (counts[payload.optionId] || 0) + 1
}
```

**Aussi corrigé** : Utilisation de `opt.label` au lieu de `opt.text` (structure correcte de PollOption)

---

### 2. Nuage de mots - Parsing du texte

**Problème** : Le code cherchait `payload.words` (array) alors que la vraie structure est `payload.text` (string avec mots séparés par des virgules).

**Fichier** : `app/pages/teacher/sessions/responses-[id].vue`

**Correction dans `getWordcloudStats()`** :
```typescript
// AVANT - ❌ Incorrect
const words = response.payload.words || []
words.forEach((word: string) => { ... })

// APRÈS - ✅ Correct
if (payload.text) {
  // Parser les mots (séparés par des virgules)
  const words = payload.text
    .split(',')
    .map((w: string) => w.trim().toLowerCase())
    .filter((w: string) => w.length > 0)

  words.forEach((word: string) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })
}
```

**Note** : Utilise la même logique que `WordcloudResults.vue` avec la fonction `processWords()`.

---

### 3. Suppression - RLS Policy manquante

**Problème** : Row Level Security (RLS) de Supabase bloque les suppressions car aucune policy n'autorise les DELETE.

**Solution** : Configuration RLS nécessaire dans Supabase Dashboard.

**Fichiers modifiés pour le diagnostic** :
1. `app/components/OpenResults.vue` - Ajout de logs détaillés
2. `app/pages/teacher/sessions/responses-[id].vue` - Ajout de logs détaillés

**Logs ajoutés** :
```typescript
console.log('[OpenResults] Deleting response:', id)
console.log('[OpenResults] Delete result:', { data, error })
console.log('[OpenResults] Successfully deleted, reloading responses...')
```

**+ Alert en cas d'erreur** :
```typescript
alert('Erreur lors de la suppression : ' + JSON.stringify(error))
```

**📚 Documentation créée** : `docs/28-SETUP_RLS_DELETE.md`

#### Policy RLS à ajouter dans Supabase

```sql
CREATE POLICY "teachers_can_delete_responses"
ON responses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM sessions
    WHERE sessions.id = responses.session_id
    AND sessions.owner_user_id = auth.uid()
  )
);
```

**Explication** :
- Autorise les enseignants authentifiés à supprimer
- Seulement les réponses de LEURS sessions (owner_user_id = auth.uid())
- Bloque la suppression par d'autres utilisateurs

---

## 📁 Fichiers modifiés

1. **app/pages/teacher/sessions/responses-[id].vue**
   - Correction `getPollStats()` : Utilise `optionId` et `optionIds`
   - Correction `getWordcloudStats()` : Parse `text` au lieu de `words`
   - Ajout logs de suppression avec alert d'erreur

2. **app/components/OpenResults.vue**
   - Ajout logs détaillés de suppression avec alert d'erreur

3. **docs/28-SETUP_RLS_DELETE.md** (nouveau)
   - Documentation complète de la configuration RLS
   - SQL pour créer la policy
   - Guide de diagnostic

4. **docs/00-INDEX.md**
   - Ajout référence au nouveau document

---

## 🧪 Tests à effectuer

### Test 1 : Sondages (après correction code)

1. Créer une session avec sondage single et multi
2. Plusieurs élèves votent
3. Aller dans "Voir les réponses"

**Vérifications** :
- ✅ Barres de progression avec les bons pourcentages
- ✅ Nombre de votes correct pour chaque option
- ✅ Les barres sont proportionnelles

### Test 2 : Nuage de mots (après correction code)

1. Créer une session avec wordcloud
2. Plusieurs élèves soumettent des mots
3. Aller dans "Voir les réponses"

**Vérifications** :
- ✅ Liste des mots avec leur compteur
- ✅ Triés par fréquence décroissante
- ✅ Aucun mot en double (normalisés en minuscules)

### Test 3 : Suppression (après configuration RLS)

**Pré-requis** : Avoir appliqué la policy RLS dans Supabase

1. Mode Live avec question ouverte
2. Plusieurs réponses affichées
3. Cliquer sur 🗑️
4. Confirmer

**Vérifications dans la console (F12)** :
```
[OpenResults] Deleting response: xxx-xxx-xxx
[OpenResults] Delete result: { data: [...], error: null }
[OpenResults] Successfully deleted, reloading responses...
[Realtime] Response deleted: { old: {...} }
```

**Si erreur** :
```
[OpenResults] Delete error: { code: '42501', message: 'new row violates row-level security policy' }
```
→ La policy RLS n'est pas correctement configurée

**Vérifications UI** :
- ✅ Réponse disparaît immédiatement
- ✅ Actualiser (F5) : réponse reste supprimée
- ✅ Aller dans "Voir les réponses" : réponse n'y est pas
- ✅ Synchronisation temps réel : disparaît dans tous les onglets

---

## 🔍 Diagnostic si la suppression ne fonctionne toujours pas

### Étape 1 : Vérifier les logs console

Ouvrir la console navigateur (F12) et chercher :

1. **Message de départ** :
   ```
   [OpenResults] Deleting response: xxx
   ```
   → ✅ La fonction est bien appelée

2. **Résultat de la suppression** :
   ```
   [OpenResults] Delete result: { data: ..., error: ... }
   ```

   **Si `error` n'est pas `null`** :
   - Lire le message d'erreur dans l'alert
   - C'est probablement un problème RLS
   - Vérifier que la policy est activée dans Supabase

   **Si `data` est vide `[]`** :
   - La réponse n'existe déjà plus
   - Ou l'ID est incorrect

   **Si `error` est `null` et `data` contient la réponse** :
   - ✅ La suppression en base a fonctionné
   - Le problème est dans le rechargement UI

3. **Rechargement** :
   ```
   [OpenResults] Successfully deleted, reloading responses...
   ```
   → ✅ Le rechargement est lancé

4. **Subscription temps réel** :
   ```
   [Realtime] Response deleted: { old: {...} }
   ```
   → ✅ L'événement DELETE est bien reçu

### Étape 2 : Vérifier dans Supabase Dashboard

1. Aller dans **Database** → **Tables** → **responses**
2. Chercher la réponse par son ID
3. **Si elle est encore là** : La suppression SQL a échoué (problème RLS)
4. **Si elle n'est pas là** : La suppression a fonctionné (problème UI)

### Étape 3 : Tester la policy manuellement

Dans l'éditeur SQL de Supabase :

```sql
-- Vérifier que la policy existe
SELECT * FROM pg_policies WHERE tablename = 'responses';

-- Tester une suppression manuelle (remplacer les IDs)
DELETE FROM responses
WHERE id = 'votre-response-id';

-- Si erreur "violates row-level security policy"
-- → La policy n'est pas correcte ou pas activée
```

### Étape 4 : Vérifier l'authentification

```sql
-- Vérifier que vous êtes bien connecté comme enseignant
SELECT auth.uid();  -- Doit retourner votre owner_user_id

-- Vérifier que la session vous appartient
SELECT * FROM sessions WHERE id = 'session-id' AND owner_user_id = auth.uid();
```

---

## 📚 Documentation associée

- **[28-SETUP_RLS_DELETE.md](./28-SETUP_RLS_DELETE.md)** : Configuration RLS complète
- **[27-CORRECTIONS_SUITE.md](./27-CORRECTIONS_SUITE.md)** : Corrections précédentes
- **[04-SETUP_REALTIME.md](./04-SETUP_REALTIME.md)** : Configuration temps réel

---

## ✅ Résumé

| Problème | Status | Action requise |
|----------|--------|----------------|
| Sondages vides | ✅ Corrigé | Code mis à jour |
| Wordcloud vide | ✅ Corrigé | Code mis à jour |
| Suppression bloquée | 🔒 Config RLS | Ajouter policy dans Supabase |
| Échelle | ✅ OK | Aucune |

**Prochaine étape** :
1. Tester les sondages et wordcloud → Devrait fonctionner immédiatement
2. Configurer RLS dans Supabase (suivre `28-SETUP_RLS_DELETE.md`)
3. Tester la suppression → Devrait fonctionner après config RLS

---

**Date** : 29 janvier 2026
**Durée** : ~1 heure
**Status** : Code corrigé, configuration RLS requise
