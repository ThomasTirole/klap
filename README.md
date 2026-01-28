# KLAP 🎯

**Plateforme d'interaction en classe en temps réel**

KLAP est une alternative open-source et auto-hébergeable à Wooclap, permettant aux enseignants de créer des sessions interactives avec leurs élèves en temps réel.

## ✨ Fonctionnalités

### ✅ Disponibles maintenant

- **Authentification enseignant** : Inscription et connexion sécurisée
- **Gestion de sessions** : Créer, ouvrir, fermer et supprimer des sessions
- **Code de session unique** : Génération automatique de codes à 6 caractères
- **5 types de questions complets** :
  - ✅ Sondages à choix unique
  - ✅ Sondages à choix multiple
  - ✅ Questions ouvertes (texte libre)
  - ✅ Échelles d'évaluation (1-5, 0-10, etc.)
  - ✅ Nuage de mots (affichage visuel impressionnant !)
- **Participation anonyme** : Les élèves n'ont pas besoin de compte
- **Temps réel parfait** : Synchronisation instantanée (<500ms)
  - Questions qui apparaissent automatiquement
  - Résultats qui se mettent à jour en direct
  - Reset propre lors du changement de question
- **Mode Live** : Interface de présentation pour projection en classe
- **Graphiques animés** : Visualisation des résultats en temps réel
- **Design responsive** : Fonctionne sur desktop, tablette et mobile

### 🔜 Améliorations futures (optionnel)

- QR Code pour rejoindre
- Export des résultats (CSV, PDF)
- Templates de sessions
- Modération avancée
- Statistiques détaillées

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/votre-username/klap.git
cd klap

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# 4. Exécuter le schéma SQL dans Supabase
# Aller sur https://app.supabase.com
# SQL Editor → Copier/coller database/migrations/001_initial_schema.sql

# 5. Lancer le serveur de développement
npm run dev
```

Accédez à `http://localhost:3000`

## 📖 Documentation

- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** : Guide d'utilisation complet
- **[PROGRESS.md](./PROGRESS.md)** : État d'avancement du projet
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** : Architecture du code
- **[VISION.md](./VISION.md)** : Vision et objectifs du projet

## 🛠️ Stack Technique

- **Frontend** : Nuxt 3 + Vue 3 + TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Realtime + Auth)
- **Temps Réel** : Supabase Realtime (WebSockets)

## 🎯 Utilisation

### Pour l'enseignant

1. Créez un compte sur `/signup`
2. Créez une session sur `/teacher`
3. Ajoutez des questions
4. Ouvrez la session
5. Lancez le Mode Live et projetez-le
6. Les élèves rejoignent avec le code

### Pour les élèves

1. Allez sur `/join`
2. Entrez le code à 6 caractères
3. Répondez aux questions quand elles apparaissent
4. Voyez les résultats (si activé)

## 📸 Captures d'écran

_À venir_

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir des issues pour signaler des bugs
- Proposer des nouvelles fonctionnalités
- Soumettre des pull requests

## 📝 License

MIT License - Voir [LICENSE](./LICENSE) pour plus de détails

## 💬 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation dans `/docs`

---

**Fait avec ❤️ pour l'éducation**
