# Configuration du Temps Réel (Realtime)

## ⚠️ IMPORTANT : Activer Realtime dans Supabase

Pour que le temps réel fonctionne, vous devez **activer Realtime** sur les tables dans Supabase.

### Méthode 1 : Via le SQL Editor (Recommandé)

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez-collez le contenu de `database/migrations/002_enable_realtime.sql`
6. Exécutez la requête

### Méthode 2 : Via l'interface Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Database** → **Replication**
4. Cherchez les tables suivantes et activez "Enable Realtime" pour chacune :
   - ✅ `sessions`
   - ✅ `items`
   - ✅ `responses`
   - ✅ `participants`

### Vérification

Pour vérifier que Realtime est bien activé, exécutez cette requête SQL :

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Vous devriez voir les 4 tables listées.

## 🔍 Debugging

Si le temps réel ne fonctionne toujours pas après activation :

### 1. Vérifier la connexion WebSocket

Ouvrez la console du navigateur (F12) et regardez l'onglet **Network** → **WS** (WebSockets).
Vous devriez voir une connexion à `wss://...supabase.co/realtime/v1/websocket`

### 2. Vérifier les erreurs dans la console

Regardez la console JavaScript pour des erreurs liées à Supabase ou Realtime.

### 3. Vérifier les permissions RLS

Assurez-vous que les policies Row Level Security permettent bien :
- Aux élèves de lire les sessions et items
- Aux enseignants de lire leurs sessions et les réponses

### 4. Tester manuellement

Dans la console du navigateur, testez :

```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('YOUR_URL', 'YOUR_KEY')

// Tester une subscription
const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sessions'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## ⚡ Comment ça fonctionne

### Côté Élève
Quand l'élève rejoint une session, il s'abonne aux changements de la table `sessions` :
- Si `active_item_id` change → La nouvelle question s'affiche
- Si `status` change → L'élève voit si la session est fermée

### Côté Enseignant (Mode Live)
Quand l'enseignant active une question, il s'abonne aux nouvelles lignes dans `responses` :
- Quand un élève répond → La réponse est ajoutée en temps réel au graphique

### Délai normal
- Le temps réel Supabase a un délai de **~100-500ms** (très acceptable)
- Les changements doivent être quasi-instantanés

## 🐛 Problèmes courants

### "Les changements ne se propagent pas"
→ Realtime n'est pas activé. Suivez les étapes ci-dessus.

### "WebSocket connection failed"
→ Vérifiez votre clé Supabase et votre connexion internet.

### "Changes detected but UI doesn't update"
→ Problème de réactivité Vue. Vérifiez que les refs sont bien utilisés.

### "Too many connections"
→ Fermez les anciens onglets ou redémarrez l'application.
