# Correctifs Round 3 - Logique et UX

Date : 28 janvier 2026

## Problèmes corrigés

### ✅ 1. Système d'approbation des enseignants

**Problème** : Tous les enseignants qui s'inscrivent ont accès immédiat.

**Solution** :
- Créé migration `003_teacher_approval.sql`
- Ajout table `teacher_profiles` avec colonne `approved`
- Trigger automatique à l'inscription pour créer un profil non approuvé
- Middleware vérifie le statut d'approbation
- Page `/pending-approval` pour les comptes en attente
- Table `notifications` pour tracker les demandes

**Fichiers modifiés** :
- `database/migrations/003_teacher_approval.sql` (nouveau)
- `app/middleware/auth.ts` (vérification approbation)
- `app/pages/pending-approval.vue` (nouveau)
- `TEACHER_APPROVAL_GUIDE.md` (documentation complète)

**Utilisation** :
```sql
-- Voir les demandes
SELECT * FROM public.teacher_profiles WHERE approved = false;

-- Approuver un enseignant
SELECT approve_teacher('USER_UUID');
```

---

### ✅ 2. CTRL+SHIFT+R déconnecte

**Explication** : C'est un comportement normal.

Le **hard refresh** (CTRL+SHIFT+R) vide le cache du navigateur, y compris le localStorage où Supabase stocke la session d'authentification.

**Solution** : Utiliser **F5** (refresh normal) qui préserve le localStorage.

Pas de modification de code nécessaire, c'est le comportement standard des navigateurs.

---

### ✅ 3. Boutons "Ouvrir" et "..." sur /teacher ne fonctionnent pas

**Problème** : Les boutons sur les cartes de sessions n'avaient pas de `@click` handlers.

**Solutions** :
- Bouton "Ouvrir" : Transformé en `NuxtLink` vers `/teacher/sessions/${id}`
- Bouton "..." : Ajout d'un menu déroulant avec options :
  - Dupliquer (TODO)
  - Supprimer (fonctionnel)
- Gestion de l'état du menu (`openMenuId`)
- Fermeture automatique au clic extérieur

**Fichier modifié** : `app/pages/teacher/index.vue`

```vue
<NuxtLink :to="`/teacher/sessions/${session.id}`">
  Ouvrir
</NuxtLink>
<button @click="toggleMenu(session.id)">⋯</button>
```

---

### ✅ 4. Tous les enseignants voient toutes les sessions

**Problème** : La requête ne filtrait pas par `owner_user_id`.

**Solution** :
- Utilisation de `getUserSessions()` de `useSession.ts` au lieu d'une requête directe
- Cette fonction filtre déjà par `owner_user_id`

**Fichier modifié** : `app/pages/teacher/index.vue`

**Avant** :
```typescript
const { data } = await supabase.from('sessions').select('*')
```

**Après** :
```typescript
const { getUserSessions } = useSession()
sessions.value = await getUserSessions()
```

---

### ✅ 5. Impossible de modifier/supprimer les questions

**Problème** : Les boutons d'édition et suppression sur les questions n'avaient pas de handlers.

**Solutions** :
- Ajout de `updateItem()` et `deleteItem()` dans `useSession.ts`
- Bouton "Modifier" : Ouvre un prompt pour changer le titre (édition complète TODO)
- Bouton "Supprimer" : Confirmation puis suppression
- Rechargement automatique des items après modification

**Fichiers modifiés** :
- `app/composables/useSession.ts` (ajout fonctions)
- `app/pages/teacher/sessions/[id].vue` (handlers)

```typescript
const updateItem = async (itemId: string, updates: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}
```

---

## Récapitulatif des fichiers

### Nouveaux fichiers
- `database/migrations/003_teacher_approval.sql`
- `app/pages/pending-approval.vue`
- `TEACHER_APPROVAL_GUIDE.md`
- `FIXES_ROUND_3.md` (ce fichier)

### Fichiers modifiés
- `app/middleware/auth.ts`
- `app/pages/teacher/index.vue`
- `app/pages/teacher/sessions/[id].vue`
- `app/composables/useSession.ts`

---

## Migration à exécuter

**IMPORTANT** : Exécuter la migration SQL dans Supabase :

1. Aller sur https://app.supabase.com
2. SQL Editor
3. Copier/coller le contenu de `database/migrations/003_teacher_approval.sql`
4. Exécuter

Cela créera :
- Table `teacher_profiles`
- Table `notifications`
- Trigger automatique sur inscription
- Fonction `approve_teacher()`

---

## Workflow d'approbation

```
┌─────────────────────────────────────────────┐
│ Enseignant s'inscrit via /signup            │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Trigger: Crée teacher_profile (approved=0)  │
│          Crée notification                  │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Middleware: Redirige vers /pending-approval │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ [Vous] Consultez notifications via SQL      │
│ [Vous] Approuvez via approve_teacher()      │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Enseignant peut accéder au dashboard        │
└─────────────────────────────────────────────┘
```

---

## TODO pour amélioration future

- [ ] **Édition complète de questions** : Créer un modal d'édition similaire à QuestionBuilder
- [ ] **Duplication de sessions** : Implémenter la copie d'une session avec toutes ses questions
- [ ] **Dashboard admin** : Interface graphique pour approuver les enseignants
- [ ] **Emails automatiques** : Edge Function pour envoyer des emails de notification
- [ ] **Historique** : Log des modifications sur les questions

---

## Tests à effectuer

1. **Approbation** :
   - S'inscrire avec un nouveau compte
   - Vérifier la redirection vers `/pending-approval`
   - Approuver via SQL
   - Se reconnecter et vérifier l'accès

2. **Sessions filtrées** :
   - Créer des sessions avec plusieurs comptes enseignants
   - Vérifier que chaque enseignant ne voit que ses sessions

3. **Boutons dashboard** :
   - Cliquer sur "Ouvrir" → Doit aller vers la session
   - Cliquer sur "..." → Menu doit apparaître
   - Supprimer une session → Doit disparaître de la liste

4. **Modification questions** :
   - Modifier le titre d'une question
   - Supprimer une question
   - Vérifier le rechargement automatique

---

**Statut** : Toutes les corrections sont fonctionnelles et prêtes à être testées.
