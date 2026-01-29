# Debug : Redirection de fin de session

## 🐛 Problème

Quand l'enseignant ferme la session (statut passe de `open` à `closed`), l'élève n'est pas redirigé vers `/student/end`.

---

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier les logs console côté élève

1. **Ouvrir une session en tant qu'élève** (dans un navigateur/onglet séparé)
2. **Ouvrir la console** (F12)
3. **Côté enseignant** : Fermer la session
4. **Côté élève** : Observer les logs

#### Logs attendus (si tout fonctionne) :

```
[Realtime] Session subscription status: SUBSCRIBED
[Realtime] Session updated: { id: "...", status: "closed", ... }
[Student] Session update received: { previousStatus: "open", newStatus: "closed", ... }
[Student] Session closed detected! Redirecting to end page...
[Student] Executing redirect now...
```

#### Si vous ne voyez AUCUN log :

→ **La subscription n'est pas configurée**
→ Passez à l'Étape 2

#### Si vous voyez seulement :

```
[Realtime] Session subscription status: SUBSCRIBED
```

→ **La subscription est active MAIS ne reçoit pas les UPDATE**
→ Passez à l'Étape 3

#### Si vous voyez :

```
[Student] Session update received: { previousStatus: "open", newStatus: "closed", ... }
[Student] No redirect needed. Previous: open New: closed
```

→ **La condition de redirection n'est pas satisfaite**
→ Il y a un bug dans la logique, mais normalement ça devrait dire "Session closed detected!"

---

### Étape 2 : Vérifier que Realtime est activé sur la table `sessions`

1. **Ouvrir Supabase Dashboard**
2. Aller dans **Database** → **Replication**
3. Vérifier que la table **`sessions`** est cochée

**Si elle n'est PAS cochée** :
- ✅ Cocher `sessions`
- Cliquer sur **Save**
- Retester

---

### Étape 3 : Vérifier les policies RLS sur `sessions`

La subscription Realtime peut être bloquée par RLS.

#### Dans Supabase SQL Editor, exécuter :

```sql
-- Vérifier les policies existantes
SELECT * FROM pg_policies WHERE tablename = 'sessions';
```

#### Policy SELECT requise pour Realtime :

Les utilisateurs anonymes (élèves) doivent pouvoir **lire** les sessions :

```sql
-- Si cette policy n'existe pas, la créer
CREATE POLICY "Allow anyone to read sessions"
ON sessions
FOR SELECT
USING (true);
```

**Explication** : Supabase Realtime utilise SELECT pour vérifier les permissions avant d'envoyer les UPDATE.

---

### Étape 4 : Tester manuellement la subscription

Dans la console élève (F12), exécuter ce code pour tester :

```javascript
// Récupérer l'ID de session depuis l'URL
const sessionCode = window.location.pathname.split('/').pop()

// Tester la subscription
const testChannel = window.$nuxt.$supabase
  .channel('test-session')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions',
    filter: `join_code=eq.${sessionCode}`
  }, (payload) => {
    console.log('TEST: Session updated!', payload)
  })
  .subscribe((status) => {
    console.log('TEST: Subscription status:', status)
  })

// Maintenant, côté enseignant, fermer la session
// Si vous voyez "TEST: Session updated!" → La subscription fonctionne
// Si vous ne voyez rien → Problème de config Supabase
```

---

### Étape 5 : Vérifier que le statut change bien en base

1. **Ouvrir Supabase Dashboard**
2. Aller dans **Database** → **Tables** → **sessions**
3. Trouver votre session (par `join_code`)
4. **Avant de fermer** : Vérifier que `status = 'open'`
5. **Côté enseignant** : Fermer la session
6. **Actualiser la table** (F5)
7. **Vérifier que** `status = 'closed'`

**Si le statut ne change PAS** :
- Le bouton "Fermer la session" ne fonctionne pas
- Vérifier le code dans `/teacher/sessions/[id].vue`

---

## ✅ Solutions selon le diagnostic

### Solution 1 : Realtime pas activé

```sql
-- Dans Supabase Dashboard → Database → Replication
-- Cocher la table "sessions"
```

### Solution 2 : Policy RLS manquante

```sql
-- Dans Supabase SQL Editor
CREATE POLICY "Allow anyone to read sessions"
ON sessions
FOR SELECT
USING (true);
```

### Solution 3 : Le statut ne change pas

Vérifier le code de fermeture de session :

**Fichier** : `app/pages/teacher/sessions/[id].vue`

```typescript
const closeSession = async () => {
  if (!session.value) return
  try {
    session.value = await updateSession(session.value.id, { status: 'closed' })
    console.log('[Teacher] Session closed:', session.value)
  } catch (error) {
    console.error('Error closing session:', error)
  }
}
```

Vérifier que `updateSession()` fait bien un UPDATE en base.

---

## 🔧 Solution alternative : Utiliser un watcher reactif

Si Realtime ne fonctionne toujours pas, on peut utiliser un polling :

**Fichier** : `app/pages/student/[code].vue`

```typescript
// Ajouter un watcher qui vérifie le statut toutes les 2 secondes
let pollInterval: NodeJS.Timeout | null = null

onMounted(async () => {
  // ... code existant ...

  // Polling de secours si Realtime ne fonctionne pas
  pollInterval = setInterval(async () => {
    if (!session.value) return

    const { data } = await supabase
      .from('sessions')
      .select('status')
      .eq('id', session.value.id)
      .single()

    if (data && data.status === 'closed' && session.value.status === 'open') {
      console.log('[Student] Session closed detected via polling!')
      router.push('/student/end')
    }
  }, 2000) // Vérifier toutes les 2 secondes
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  // ... code existant ...
})
```

**Note** : C'est une solution de secours, moins élégante que Realtime mais fonctionnelle.

---

## 📋 Checklist de vérification

Avant de conclure que ça ne marche pas :

- [ ] Realtime activé sur la table `sessions` (Database → Replication)
- [ ] Policy SELECT existe sur `sessions` (`USING (true)`)
- [ ] Console élève montre `[Realtime] Session subscription status: SUBSCRIBED`
- [ ] Fermer la session change bien `status` en base de `open` à `closed`
- [ ] L'élève est bien sur une session avec `status = 'open'` avant de fermer
- [ ] Pas d'erreur dans la console (ni côté élève ni côté enseignant)

---

## 🎯 Test final

### Setup :
1. Session ouverte (`status = 'open'`)
2. Élève connecté sur `/student/CODE`
3. Console élève ouverte (F12)

### Action :
Enseignant clique sur **"Fermer la session"**

### Résultat attendu :
```
[Realtime] Session updated: { ..., status: "closed" }
[Student] Session update received: { previousStatus: "open", newStatus: "closed", ... }
[Student] Session closed detected! Redirecting to end page...
[Student] Executing redirect now...
```

Puis redirection vers `/student/end` après 1 seconde.

---

**Date** : 29 janvier 2026
**Statut** : En diagnostic
**Priorité** : 🔴 Haute
