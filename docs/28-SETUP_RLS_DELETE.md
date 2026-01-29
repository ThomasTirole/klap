# Configuration RLS pour les suppressions

## 🔒 Problème

Les suppressions de réponses ne fonctionnent pas car **Row Level Security (RLS)** bloque les opérations DELETE sur la table `responses`.

## ✅ Solution

Il faut ajouter une policy RLS pour autoriser les enseignants à supprimer les réponses des sessions qu'ils ont créées.

---

## 📋 Étapes dans Supabase Dashboard

### 1. Accéder aux Policies

1. Ouvrir **Supabase Dashboard**
2. Aller dans **Authentication** → **Policies**
3. Sélectionner la table **`responses`**

### 2. Ajouter la policy DELETE pour les enseignants

Cliquer sur **"New Policy"** et configurer :

**Nom de la policy** :
```
Allow teachers to delete responses from their sessions
```

**Policy type** :
```
DELETE
```

**Target roles** :
```
authenticated
```

**USING expression** :
```sql
EXISTS (
  SELECT 1
  FROM sessions
  WHERE sessions.id = responses.session_id
  AND sessions.owner_user_id = auth.uid()
)
```

**Explication** :
- Vérifie que la session existe
- Vérifie que la session appartient à l'enseignant connecté (owner_user_id = auth.uid())
- Permet la suppression seulement si ces deux conditions sont vraies

### 3. Vérifier la policy

Cliquer sur **"Review"** puis **"Save policy"**

---

## 🧪 Test après configuration

1. **En tant qu'enseignant**, créer une session avec une question ouverte
2. Plusieurs élèves répondent
3. **Mode Live** : Cliquer sur 🗑️ à côté d'une réponse
4. Confirmer la suppression
5. ✅ **Vérifier** : La réponse disparaît immédiatement
6. F5 pour actualiser
7. ✅ **Vérifier** : La réponse ne réapparaît PAS

---

## 🔍 Diagnostic

Si la suppression ne fonctionne toujours pas après avoir ajouté la policy :

### Dans la console navigateur (F12)

Rechercher les logs :
```
[OpenResults] Deleting response: xxx-xxx-xxx
[OpenResults] Delete result: { data: ..., error: ... }
```

**Si `error` n'est pas `null`** :
- C'est un problème de RLS → Vérifier que la policy est bien activée
- C'est un problème de permissions → Vérifier que l'enseignant est bien connecté

**Si `data` est vide** :
- La réponse n'existe pas (déjà supprimée ?)
- L'ID est incorrect

**Si tout est OK mais l'UI ne se met pas à jour** :
- Problème de rechargement → Vérifier `loadResponses()`
- Problème de subscription → Vérifier que le DELETE est bien écouté

---

## 📚 Policies RLS complètes pour `responses`

Pour référence, voici toutes les policies nécessaires sur la table `responses` :

### 1. SELECT (lecture) - Pour tout le monde
```sql
CREATE POLICY "Allow anyone to read responses"
ON responses
FOR SELECT
USING (true);
```

### 2. INSERT (création) - Pour les participants anonymes
```sql
CREATE POLICY "Allow anyone to insert responses"
ON responses
FOR INSERT
WITH CHECK (true);
```

### 3. DELETE (suppression) - Pour les enseignants propriétaires
```sql
CREATE POLICY "Allow teachers to delete responses from their sessions"
ON responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM sessions
    WHERE sessions.id = responses.session_id
    AND sessions.owner_user_id = auth.uid()
  )
);
```

### 4. UPDATE (modification) - Pour les enseignants propriétaires (optionnel)
```sql
CREATE POLICY "Allow teachers to update responses from their sessions"
ON responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM sessions
    WHERE sessions.id = responses.session_id
    AND sessions.owner_user_id = auth.uid()
  )
);
```

---

## 🔧 Alternative : SQL direct

Si vous préférez, vous pouvez exécuter directement le SQL dans l'éditeur SQL de Supabase :

```sql
-- Activer RLS sur la table responses (si pas déjà fait)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Policy pour la suppression
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

-- Vérifier que la policy est créée
SELECT * FROM pg_policies WHERE tablename = 'responses';
```

---

## ⚠️ Notes importantes

1. **RLS doit être activé** : `ALTER TABLE responses ENABLE ROW LEVEL SECURITY;`
2. **L'enseignant doit être authentifié** : `auth.uid()` doit retourner son ID
3. **La session doit appartenir à l'enseignant** : `sessions.owner_user_id = auth.uid()`
4. **La suppression anonyme n'est pas autorisée** : C'est voulu pour la sécurité

---

## 🎯 Résultat attendu

Après configuration :
- ✅ Les enseignants peuvent supprimer les réponses de LEURS sessions
- ❌ Les enseignants ne peuvent PAS supprimer les réponses des autres
- ❌ Les élèves ne peuvent PAS supprimer de réponses
- ✅ La suppression est propagée en temps réel à tous les clients

---

**Date** : 29 janvier 2026
**Statut** : Configuration requise
**Priorité** : 🔴 Haute (bloquant pour la modération)
