# Correctifs appliqués - 28 janvier 2026

Suite aux tests utilisateur, voici les correctifs appliqués :

## 🐛 Bugs identifiés

### 1. Question active ne s'affiche pas automatiquement côté élève
**Symptôme** : Quand l'enseignant sélectionne une question dans le Mode Live, l'élève doit rafraîchir pour la voir.

**Cause probable** : Realtime n'est pas activé sur la table `sessions` dans Supabase.

**Solution** :
- ✅ Migration SQL créée : `database/migrations/002_enable_realtime.sql`
- ✅ Guide détaillé créé : `REALTIME_SETUP.md`
- ✅ Logs de debug ajoutés dans `useRealtime.ts`

### 2. Réponses ne se mettent pas à jour en temps réel côté enseignant
**Symptôme** : L'enseignant doit cliquer sur "Actualiser" pour voir les nouvelles réponses.

**Cause probable** : Realtime n'est pas activé sur la table `responses`.

**Solution** : Même que le point 1.

### 3. Changement de question ne se propage pas côté élève
**Symptôme** : Quand l'enseignant change de question, l'élève ne voit pas le changement.

**Cause probable** : Lié au point 1 - mise à jour de `active_item_id` non propagée.

**Solution** : Même que le point 1.

### 4. Bouton radio non rempli visuellement
**Symptôme** : Quand l'élève sélectionne une option, le cercle reste vide.

**Cause** : Le sélecteur CSS `peer-checked:` ne fonctionnait pas avec la structure HTML actuelle.

**Solution** :
- ✅ Remplacement par des classes conditionnelles Vue (`:class`)
- ✅ Le cercle se remplit maintenant correctement avec un checkmark blanc

## 📋 Actions requises de votre part

### ÉTAPE CRITIQUE : Activer Realtime dans Supabase

**Vous devez exécuter cette migration SQL dans Supabase :**

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Database** → **Replication** OU **SQL Editor**

#### Option A : Via Replication (Interface graphique)
- Activez "Enable Realtime" sur ces tables :
  - ✅ `sessions`
  - ✅ `items`
  - ✅ `responses`
  - ✅ `participants`

#### Option B : Via SQL Editor (Plus rapide)
```sql
-- Copiez-collez ce code dans le SQL Editor

ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
```

### Vérification

Après avoir activé Realtime, testez à nouveau :

1. **Ouvrez la console du navigateur** (F12)
2. Vous devriez voir des logs comme :
   ```
   [Realtime] Subscribing to session: abc-123...
   [Realtime] Session subscription status: SUBSCRIBED
   ```
3. Quand vous changez de question, vous devriez voir :
   ```
   [Realtime] Session updated: { id: '...', active_item_id: '...' }
   ```

## 🧪 Plan de test

Après avoir activé Realtime :

### Test 1 : Activation de question
1. Enseignant : Ouvre le Mode Live
2. Élève : Rejoint la session (reste sur la page)
3. Enseignant : Sélectionne une question
4. ✅ **Attendu** : La question apparaît automatiquement chez l'élève (sans refresh)

### Test 2 : Réponse en temps réel
1. Enseignant : Mode Live avec question active
2. Élève : Répond à la question
3. ✅ **Attendu** : Le graphique se met à jour instantanément (sans cliquer "Actualiser")

### Test 3 : Changement de question
1. Enseignant : Active question 1
2. Élève : Voit question 1
3. Enseignant : Change pour question 2
4. ✅ **Attendu** : L'élève voit automatiquement question 2 (sans refresh)

### Test 4 : Bouton radio
1. Élève : Clique sur une option
2. ✅ **Attendu** : Le cercle se remplit avec un checkmark blanc sur fond indigo

## 📊 Délai attendu

Une fois Realtime activé :
- Changement de question : **< 500ms**
- Nouvelle réponse : **< 500ms**
- Ouverture/fermeture session : **< 500ms**

## 🔍 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs dans la console** (F12 → Console)
2. **Vérifiez l'onglet Network** → WS (WebSockets) : Une connexion WebSocket doit être établie
3. **Redémarrez le serveur de dev** : `npm run dev`
4. **Videz le cache** : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
5. **Consultez** : `REALTIME_SETUP.md` pour plus de détails

## 📁 Fichiers modifiés/créés

```
app/
└── components/
    └── PollSingleAnswer.vue     ← FIXÉ (bouton radio)
└── composables/
    └── useRealtime.ts           ← AMÉLIORÉ (logs debug)

database/
└── migrations/
    └── 002_enable_realtime.sql  ← NOUVEAU

Documentation/
├── REALTIME_SETUP.md            ← NOUVEAU
└── FIXES_APPLIED.md             ← NOUVEAU (ce fichier)
```

## ✅ Résumé

- **Bug CSS** : ✅ Corrigé immédiatement
- **Bugs Realtime** : ⏳ En attente de l'activation dans Supabase (votre action requise)
- **Debugging** : ✅ Logs ajoutés pour faciliter le troubleshooting
- **Documentation** : ✅ Guides créés

Une fois Realtime activé dans Supabase, **tout devrait fonctionner parfaitement** ! 🚀
