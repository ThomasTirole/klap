# Guide d'utilisation KLAP

## 🎯 Cycle complet d'utilisation

### Pour l'Enseignant

#### 1. Créer un compte
1. Allez sur `/signup`
2. Créez votre compte avec email et mot de passe
3. Vous serez redirigé vers votre dashboard

#### 2. Créer une session
1. Sur le dashboard (`/teacher`), cliquez sur "Nouvelle Session"
2. Donnez un titre à votre session (ex: "Cours de Math - Chapitre 3")
3. Un code unique de 6 caractères est généré automatiquement

#### 3. Ajouter des questions
1. Dans les détails de la session, cliquez sur "+ Ajouter une question"
2. Remplissez le formulaire :
   - **Titre** : La question principale
   - **Description** (optionnel) : Précisions supplémentaires
   - **Options** : Au moins 2 réponses possibles
   - **Afficher les résultats** : Cochez si vous voulez que les élèves voient les résultats après avoir répondu
3. Cliquez sur "Créer la question"

#### 4. Ouvrir la session
1. Dans les détails de la session, cliquez sur "Ouvrir la session"
2. Le statut passe de "Brouillon" à "Ouverte"
3. Le code devient actif pour les élèves

#### 5. Lancer le Mode Live
1. Cliquez sur "Mode Live" (bouton avec icône caméra)
2. Vous accédez à l'interface de présentation
3. Sélectionnez une question dans le menu déroulant ou utilisez les flèches ← →
4. Dès qu'une question est sélectionnée :
   - Les élèves la voient **instantanément**
   - Les résultats s'affichent **en temps réel** à mesure que les élèves répondent

#### 6. Gérer la session
- **Changer de question** : Utilisez le sélecteur ou les flèches
- **Fermer la session** : Retournez aux détails et cliquez sur "Fermer la session"
- **Supprimer** : Bouton rouge "Supprimer" dans les détails

---

### Pour les Élèves

#### 1. Rejoindre une session
1. Allez sur `/join`
2. Entrez le code à 6 caractères fourni par l'enseignant
3. Cliquez sur "Rejoindre"

#### 2. Attendre la question
- Si la session n'est pas ouverte : Message "Session en attente"
- Si aucune question n'est active : Message "En attente"
- **Pas besoin de rafraîchir** : La question apparaît automatiquement !

#### 3. Répondre
1. Une fois la question affichée, sélectionnez votre réponse
2. Cliquez sur "Valider ma réponse"
3. Confirmation : ✓ "Réponse enregistrée !"

#### 4. Voir les résultats (si activé)
- Si l'enseignant a activé l'option, les résultats apparaissent après votre réponse
- Vous voyez les pourcentages et le nombre de votes par option

---

## ⚡ Fonctionnalités Temps Réel

### Synchronisation automatique

**Côté Élève :**
- Quand l'enseignant active une question → **elle apparaît instantanément** sur l'écran des élèves
- Quand l'enseignant change de question → **changement automatique** sans rafraîchir
- Quand l'enseignant ferme la session → **notification automatique**

**Côté Enseignant :**
- Quand un élève répond → **le graphique se met à jour en direct**
- Les compteurs de votes s'incrémentent en temps réel
- Pas besoin de rafraîchir la page

---

## 📊 Types de Questions

### Sondage à Choix Unique ✅ (Disponible)
- Les élèves sélectionnent **une seule** réponse
- Résultats affichés en graphique à barres
- Pourcentages calculés automatiquement

### Prochainement 🚧
- **Sondage à Choix Multiple** : Plusieurs réponses possibles
- **Nuage de Mots** : Les élèves écrivent des mots
- **Question Ouverte** : Réponses textuelles
- **Échelle** : Notation de 1 à 5 ou catégories

---

## 🔐 Sécurité & Vie Privée

### Anonymat des élèves
- **Pas de compte requis** pour les élèves
- Un ID unique est généré automatiquement par navigateur
- L'enseignant ne voit **que les réponses**, pas les identités

### Protection des données
- Row Level Security (RLS) activé sur toutes les tables
- Les élèves ne peuvent accéder qu'aux sessions ouvertes
- Les enseignants ne voient que leurs propres sessions

---

## 💡 Conseils d'utilisation

### En classe
1. **Préparez vos questions à l'avance** : Créez votre session en mode "Brouillon"
2. **Affichez le code** : Écrivez-le au tableau ou projetez-le
3. **Laissez le temps** : Donnez 30-60 secondes aux élèves pour rejoindre
4. **Gardez le Mode Live ouvert** : Projetez-le pour que tout le monde voie les résultats
5. **Naviguez fluidement** : Utilisez les flèches ← → pour changer rapidement de question

### À distance
1. Partagez le code dans le chat
2. Utilisez le Mode Live pour montrer les résultats en partage d'écran
3. Les élèves peuvent participer depuis n'importe quel appareil

### Tips
- **Questions courtes** : Les élèves lisent plus vite
- **Options claires** : Évitez les ambiguïtés
- **Variez les types** : Alternez questions simples et complexes (quand disponibles)
- **Projetez les résultats** : Créer de l'engagement en classe

---

## 🐛 Résolution de problèmes

### L'élève ne voit pas la question
- Vérifiez que la session est **ouverte**
- Vérifiez qu'une question est **active** dans le Mode Live
- Demandez à l'élève de rester sur la page (pas besoin de rafraîchir)

### Les résultats ne se mettent pas à jour
- Le temps réel est activé, patientez 1-2 secondes
- Si le problème persiste, rafraîchissez la page

### Le code ne fonctionne pas
- Vérifiez que la session est **ouverte**
- Le code est sensible à la casse (mais converti en majuscules automatiquement)
- Vérifiez qu'il n'y a pas d'espaces avant/après

### Problème de connexion Supabase
- Vérifiez que votre fichier `.env` contient les bonnes clés
- Redémarrez le serveur de développement

---

## 📱 Compatibilité

### Navigateurs supportés
- Chrome/Edge (recommandé)
- Firefox
- Safari
- Opera

### Appareils
- 💻 Desktop (optimal)
- 📱 Mobile (fonctionnel)
- 📱 Tablette (fonctionnel)

### Connexion requise
- ✅ Internet requis (WebSockets pour le temps réel)
- Minimum 1 Mbps recommandé

---

## 🚀 Raccourcis clavier (Mode Live)

- `←` : Question précédente
- `→` : Question suivante
- `Échap` : Quitter le Mode Live (à venir)

---

## 📞 Support

Pour tout problème ou suggestion :
- Issues GitHub : [github.com/votre-repo/klap/issues](https://github.com)
- Documentation complète : Voir `PROGRESS.md` et `PROJECT_STRUCTURE.md`
