# Base de données KLAP

Ce dossier contient les migrations SQL pour la base de données Supabase.

## Installation du schéma

### Option 1 : Via l'interface Supabase (recommandé)

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez-collez le contenu de `migrations/001_initial_schema.sql`
6. Exécutez la requête

### Option 2 : Via Supabase CLI

```bash
# Installer la CLI Supabase (si pas déjà fait)
npm install -g supabase

# Lier votre projet
supabase link --project-ref your-project-ref

# Exécuter la migration
supabase db push
```

## Structure de la base de données

### Tables principales

#### `sessions`
Stocke les sessions d'enseignement créées par les enseignants.
- Contient le `join_code` pour que les élèves rejoignent
- Status: `draft`, `open`, ou `closed`
- `active_item_id`: question actuellement active

#### `items`
Les questions/étapes d'une session.
- Types supportés: `poll_single`, `poll_multi`, `wordcloud`, `open`, `scale`
- `config`: JSON contenant les options spécifiques au type
- `order_index`: ordre d'affichage

#### `participants`
Les élèves qui ont rejoint une session.
- `participant_id`: UUID généré côté client
- `nickname`: optionnel

#### `responses`
Les réponses des participants aux questions.
- `payload`: JSON contenant la réponse (structure varie selon le type)

#### `moderation`
Gestion de la modération pour les réponses textuelles.
- Status: `pending`, `approved`, `hidden`

## Sécurité (RLS)

Toutes les tables ont des Row Level Security (RLS) policies:

- **Enseignants** (authentifiés): accès complet à leurs propres sessions et données
- **Élèves** (anonymes): peuvent lire les sessions ouvertes et soumettre des réponses
- Les élèves ne peuvent pas modifier ou supprimer des données

## Fonctions utilitaires

### `generate_join_code()`
Génère un code de 6 caractères alphanumériques unique pour rejoindre une session.
