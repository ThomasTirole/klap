# Guide d'approbation des enseignants

## Vue d'ensemble

KLAP utilise un système d'approbation manuelle pour les comptes enseignants. Cela permet de contrôler qui peut créer des sessions et éviter les abus.

## Comment ça fonctionne

### 1. Inscription d'un enseignant

Quand un enseignant s'inscrit via `/signup` :
1. Un compte est créé dans `auth.users`
2. Un profil est automatiquement créé dans `teacher_profiles` avec `approved = false`
3. Une notification est créée dans la table `notifications`
4. L'enseignant est redirigé vers `/pending-approval`

### 2. Page d'attente

L'enseignant voit une page explicative indiquant que :
- Sa demande a été enregistrée
- Il doit attendre l'approbation d'un admin
- Il sera notifié par email une fois approuvé

### 3. Middleware de protection

Le middleware `auth.ts` vérifie automatiquement si l'enseignant est approuvé :
- Si non approuvé → Redirigé vers `/pending-approval`
- Si approuvé → Accès normal au dashboard

## Pour vous : Approuver un enseignant

### Option 1 : Via Supabase SQL Editor (Recommandé)

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet KLAP
3. Allez dans **SQL Editor**
4. Exécutez cette requête pour voir les demandes en attente :

```sql
SELECT
  tp.id,
  tp.email,
  tp.requested_at,
  tp.approved
FROM public.teacher_profiles tp
WHERE tp.approved = false
ORDER BY tp.requested_at DESC;
```

5. Pour approuver un enseignant, copiez son `user_id` et exécutez :

```sql
SELECT approve_teacher('USER_ID_ICI');
```

Exemple :
```sql
SELECT approve_teacher('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

### Option 2 : Via Table Editor

1. Allez dans **Table Editor** > `teacher_profiles`
2. Trouvez l'enseignant à approuver
3. Double-cliquez sur la cellule `approved`
4. Changez `false` → `true`
5. Double-cliquez sur `approved_at` et mettez la date actuelle

## Notifications par email (Optionnel)

Pour recevoir un email automatiquement quand quelqu'un s'inscrit :

### Vérifier les notifications en attente

```sql
SELECT
  n.type,
  n.recipient_email,
  n.data,
  n.created_at,
  n.sent
FROM public.notifications n
WHERE n.type = 'new_teacher_request'
  AND n.sent = false
ORDER BY n.created_at DESC;
```

### Configuration email (à faire plus tard)

Pour automatiser l'envoi d'emails, vous devrez :

1. Créer une **Supabase Edge Function** qui :
   - Écoute les nouvelles lignes dans `notifications`
   - Envoie un email via un service (Resend, SendGrid, etc.)
   - Marque la notification comme `sent = true`

2. Ou utiliser un **webhook externe** (Zapier, Make, n8n)

Pour l'instant, vous pouvez simplement consulter la table `notifications` dans Supabase pour voir les nouvelles demandes.

## Gestion courante

### Voir tous les enseignants approuvés

```sql
SELECT
  tp.email,
  tp.approved,
  tp.approved_at,
  tp.requested_at
FROM public.teacher_profiles tp
WHERE tp.approved = true
ORDER BY tp.approved_at DESC;
```

### Révoquer l'approbation d'un enseignant

```sql
UPDATE public.teacher_profiles
SET approved = false, approved_at = NULL
WHERE email = 'enseignant@example.com';
```

### Supprimer un enseignant complètement

```sql
-- Cela supprimera aussi toutes ses sessions (CASCADE)
DELETE FROM auth.users
WHERE email = 'enseignant@example.com';
```

## Flux complet

```
Enseignant s'inscrit
        ↓
Compte créé (approved = false)
        ↓
Notification créée
        ↓
Enseignant voit page "En attente"
        ↓
[Vous] Consultez les demandes via SQL
        ↓
[Vous] Approuvez via approve_teacher()
        ↓
Enseignant peut se connecter et accéder au dashboard
```

## Migration à exécuter

N'oubliez pas d'exécuter le fichier de migration :

```sql
-- Copiez le contenu de database/migrations/003_teacher_approval.sql
-- Et exécutez-le dans Supabase SQL Editor
```

Cela va créer :
- Table `teacher_profiles`
- Table `notifications`
- Triggers automatiques
- Fonction `approve_teacher()`

## Notes importantes

1. **Les enseignants existants** : Si vous avez déjà des comptes enseignants, vous devrez les approuver manuellement
2. **CTRL+SHIFT+R déconnecte** : C'est normal, le hard refresh vide le cache. Utilisez F5 pour un refresh normal.
3. **Personnalisation** : Dans `003_teacher_approval.sql`, ligne 54, changez `'admin@klap.app'` par votre email

## Troubleshooting

### Un enseignant ne peut pas se connecter après approbation

Vérifiez que :
```sql
SELECT approved FROM public.teacher_profiles WHERE email = 'email@example.com';
```
Retourne `true`

### Les notifications ne se créent pas

Vérifiez que le trigger existe :
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_teacher_profile_created';
```

## Améliorations futures possibles

- Dashboard admin pour gérer les approbations
- Envoi automatique d'emails
- Système de rôles (admin, enseignant, modérateur)
- Historique des approbations
- Raisons de refus
