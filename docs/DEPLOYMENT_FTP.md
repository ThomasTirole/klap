# Configuration du déploiement FTP Infomaniak

Ce document explique comment configurer le déploiement automatique vers l'hébergement Infomaniak via FTP pour le domaine **klap-it.ch**.

## 📋 Prérequis

Avant de commencer, vous devez avoir :
- Un compte Infomaniak avec un hébergement web
- Les identifiants FTP de votre hébergement
- L'URL de votre compte Supabase et la clé API

## 🔐 Configuration des Secrets GitHub

Pour que le déploiement fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

### Accéder aux Secrets

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### Secrets à configurer

#### 1. FTP_SERVER
- **Nom** : `FTP_SERVER`
- **Valeur** : L'adresse du serveur FTP Infomaniak (généralement au format `ftp.dc3-xyz.infomaniak.ch` ou `ftp.klap-it.ch`)
- **Comment trouver** : Dans votre panneau Infomaniak → Hébergement Web → Accès FTP → Serveur FTP

#### 2. FTP_USERNAME
- **Nom** : `FTP_USERNAME`
- **Valeur** : Votre nom d'utilisateur FTP
- **Comment trouver** : Dans votre panneau Infomaniak → Hébergement Web → Accès FTP → Nom d'utilisateur

#### 3. FTP_PASSWORD
- **Nom** : `FTP_PASSWORD`
- **Valeur** : Votre mot de passe FTP
- **Comment trouver** : Utilisez le mot de passe que vous avez défini, ou réinitialisez-le dans le panneau Infomaniak → Hébergement Web → Accès FTP → Modifier le mot de passe

#### 4. SUPABASE_URL
- **Nom** : `SUPABASE_URL`
- **Valeur** : L'URL de votre projet Supabase (ex: `https://xxxxx.supabase.co`)
- **Comment trouver** : Dans votre projet Supabase → Settings → API → Project URL

#### 5. SUPABASE_KEY
- **Nom** : `SUPABASE_KEY`
- **Valeur** : La clé publique (anon key) de votre projet Supabase
- **Comment trouver** : Dans votre projet Supabase → Settings → API → Project API keys → anon/public

## 🚀 Déploiement automatique

Une fois les secrets configurés, le déploiement se fait automatiquement :

### Déclencheurs
Le workflow GitHub Actions se déclenche :
- **Automatiquement** : À chaque push sur la branche `main`
- **Manuellement** : Via l'onglet "Actions" dans GitHub (bouton "Run workflow")

### Processus de déploiement
1. ✅ Checkout du code
2. ✅ Installation de Node.js 18
3. ✅ Installation des dépendances npm
4. ✅ Build de l'application Nuxt (génération statique)
5. ✅ Upload des fichiers vers le serveur FTP Infomaniak

## 📁 Structure de déploiement

Le workflow déploie le contenu du dossier `.output/public/` généré par Nuxt vers la racine de votre hébergement FTP.

### Configuration du serveur-dir
Dans le workflow, `server-dir: /` signifie que les fichiers seront déployés à la racine de votre hébergement FTP. Si vous avez besoin de déployer dans un sous-dossier, modifiez cette valeur (ex: `server-dir: /public_html/`).

## 🔍 Vérification

Pour vérifier que le déploiement fonctionne :

1. Allez sur l'onglet **Actions** de votre repository GitHub
2. Vous verrez l'historique des déploiements
3. Cliquez sur un déploiement pour voir les détails et logs
4. Visitez votre site : **https://klap-it.ch**

## ⚠️ Notes importantes

### Première exécution
- Le premier déploiement peut prendre plus de temps (installation des dépendances)
- Les déploiements suivants seront plus rapides grâce au cache npm

### Sécurité
- Ne commitez **JAMAIS** vos identifiants FTP ou clés Supabase dans le code
- Utilisez toujours les GitHub Secrets
- Les secrets sont chiffrés et ne sont jamais exposés dans les logs

### Dossier .output
- Le dossier `.output/` est automatiquement généré lors du build
- Il est déjà dans `.gitignore` et ne doit pas être commité
- Seul son contenu public est déployé sur le serveur FTP

## 🆘 Dépannage

### Le déploiement échoue
1. Vérifiez que tous les secrets sont correctement configurés
2. Vérifiez les logs dans l'onglet Actions de GitHub
3. Testez vos identifiants FTP avec un client FTP (FileZilla, etc.)

### Le site ne s'affiche pas correctement
1. Vérifiez que les variables d'environnement Supabase sont correctes
2. Assurez-vous que le `server-dir` pointe vers le bon dossier
3. Vérifiez les permissions des fichiers sur le serveur FTP

### Erreur de connexion FTP
- Vérifiez que votre hébergement Infomaniak autorise les connexions FTP
- Assurez-vous que le port FTP est bien ouvert (généralement port 21)
- Vérifiez l'adresse du serveur FTP dans le panneau Infomaniak

## 📚 Ressources

- [Documentation Infomaniak FTP](https://www.infomaniak.com/fr/support)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nuxt Generate Documentation](https://nuxt.com/docs/getting-started/deployment)
