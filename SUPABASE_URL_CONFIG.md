# Configuration de l'URL de redirection Supabase

## Problème

Par défaut, Supabase redirige vers `localhost:3000` après l'inscription/confirmation d'email.

Votre app est déployée sur Vercel : `https://klap-steel.vercel.app/`

## Solution

### 1. Configurer l'URL du site dans Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet KLAP
3. Allez dans **Authentication** → **URL Configuration**
4. Configurez les URLs suivantes :

**Site URL** :
```
https://klap-steel.vercel.app
```

**Redirect URLs** (ajoutez les deux) :
```
https://klap-steel.vercel.app/**
http://localhost:3000/**
```

Le deuxième est pour garder le développement local fonctionnel.

### 2. Email Templates

Dans **Authentication** → **Email Templates**, vérifiez que les templates utilisent :

```
{{ .SiteURL }}
```

Au lieu de hardcoder `localhost:3000`.

Par exemple, le template de confirmation devrait ressembler à :

```html
<h2>Confirmez votre inscription</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
```

### 3. Variables d'environnement (si besoin)

Si vous avez besoin de gérer différentes URLs selon l'environnement :

**Dans Vercel** (pour production) :
- `NUXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NUXT_PUBLIC_SUPABASE_KEY` : Votre anon key
- `NUXT_PUBLIC_SITE_URL` : `https://klap-steel.vercel.app`

**En local** (`.env`) :
- `NUXT_PUBLIC_SITE_URL` : `http://localhost:3000`

### 4. Configuration avancée (optionnel)

Si vous utilisez des domaines personnalisés ou plusieurs environnements :

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
})
```

## Vérification

Après configuration :

1. Créez un nouveau compte
2. Vérifiez l'email reçu
3. Le lien de confirmation devrait pointer vers `https://klap-steel.vercel.app/...`

## Domaine personnalisé (futur)

Si vous configurez un domaine personnalisé (ex: `klap.votredomaine.com`) :

1. Ajoutez le domaine dans Vercel
2. Mettez à jour la **Site URL** dans Supabase
3. Ajoutez le domaine dans **Redirect URLs**

## Troubleshooting

### L'email pointe toujours vers localhost

- Vérifiez que vous avez bien sauvegardé dans Supabase
- Attendez quelques minutes (cache)
- Testez avec un nouveau compte

### Erreur "Invalid redirect URL"

- Vérifiez que l'URL est bien dans la liste **Redirect URLs**
- N'oubliez pas le `/**` à la fin

### Ça marche en prod mais pas en local

- Assurez-vous d'avoir `http://localhost:3000/**` dans les Redirect URLs
- Vérifiez votre `.env` local

## Résumé des étapes

```
1. Supabase → Authentication → URL Configuration
2. Site URL = https://klap-steel.vercel.app
3. Redirect URLs = https://klap-steel.vercel.app/** ET http://localhost:3000/**
4. Sauvegarder
5. Tester avec un nouveau compte
```

C'est tout ! 🎯
