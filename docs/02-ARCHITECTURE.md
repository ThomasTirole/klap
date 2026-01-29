# Structure du projet KLAP

## Organisation des dossiers

```
klap/
├── app/                    # Dossier principal de l'application (Nuxt 4)
│   ├── app.vue            # Point d'entrée de l'application
│   ├── components/        # Composants Vue réutilisables
│   │   ├── session/      # Composants liés aux sessions (à créer)
│   │   ├── item/         # Composants liés aux questions (à créer)
│   │   ├── student/      # Composants interface élève (à créer)
│   │   └── teacher/      # Composants interface enseignant (à créer)
│   ├── composables/       # Composables Vue (logique réutilisable)
│   │   ├── useSupabase.ts # Client Supabase
│   │   ├── useAuth.ts    # Authentification
│   │   └── useSession.ts # Gestion sessions
│   ├── middleware/        # Middleware Nuxt
│   │   └── auth.ts       # Protection routes enseignant
│   └── pages/             # Routes de l'application (auto-routing Nuxt)
│       ├── index.vue     # Page d'accueil
│       ├── login.vue     # Connexion enseignant
│       ├── signup.vue    # Inscription enseignant
│       ├── join.vue      # Rejoindre une session
│       ├── teacher/      # Pages enseignant
│       │   ├── index.vue # Dashboard
│       │   └── sessions/
│       │       ├── new.vue   # Créer session
│       │       └── [id].vue  # Détail session
│       └── student/      # Pages élève
│           └── [code].vue # Session élève
├── assets/                # Fichiers statiques (images, CSS custom)
├── database/              # Schémas et migrations SQL
│   └── migrations/
│       └── 001_initial_schema.sql
├── server/                # Code côté serveur (API)
│   └── api/              # API routes (si nécessaire)
├── types/                 # Types TypeScript
│   └── database.ts       # Types pour le schéma DB
├── public/                # Fichiers publics statiques
├── .env                   # Variables d'environnement (non versionnée)
├── .env.example          # Template des variables d'environnement
├── nuxt.config.ts        # Configuration Nuxt
├── tailwind.config.js    # Configuration Tailwind
└── tsconfig.json         # Configuration TypeScript
```

## Conventions de nommage

### Composants
- **PascalCase** pour les noms de fichiers : `SessionCard.vue`, `QuestionBuilder.vue`
- Préfixer par domaine : `TeacherDashboard.vue`, `StudentAnswer.vue`

### Composables
- **camelCase** avec préfixe `use` : `useSupabase.ts`, `useSession.ts`, `useRealtime.ts`

### Pages
- **kebab-case** ou **[param]** pour les routes dynamiques
- Exemple : `join.vue`, `[code].vue`, `[id].vue`

### Types
- **PascalCase** pour les types : `Session`, `Item`, `Response`
- Suffixer avec le type : `SessionStatus`, `ItemType`

## Flux de données

### Enseignant
1. Login → `/login`
2. Dashboard → `/teacher`
3. Créer session → `/teacher/sessions/new`
4. Mode live → `/teacher/live/[sessionId]`

### Élève
1. Rejoindre → `/join` (avec code)
2. Session → `/student/[code]`
3. Répondre aux questions en temps réel

## Prochaines étapes

1. ✅ Structure de dossiers créée
2. ⏳ Définir les types TypeScript
3. ⏳ Créer les composables de base
4. ⏳ Créer les layouts
5. ⏳ Implémenter les pages
