# TODO - KLAP

## 🎨 UX/UI - Amélioration Tailwind

### TODO: Audit HTML → Tailwind
**Objectif** : Analyser tous les composants et pages pour identifier les éléments en HTML pur et les convertir en composants Tailwind modernes.

**Pourquoi ?**
- Cohérence visuelle
- Meilleure UX
- Animations et transitions fluides
- Style moderne et professionnel

**À faire** :
1. Scanner tous les fichiers `.vue` dans `app/`
2. Identifier les éléments HTML standards :
   - `<select>` basiques → Dropdowns custom Tailwind
   - `<input type="radio">` → Radio cards visuels
   - `<input type="checkbox">` → Checkboxes stylisés
   - `<button>` simples → Boutons avec icônes et variants
   - `<table>` → Grilles Tailwind avec hover states
   - Autres éléments de formulaire

3. Créer des composants réutilisables :
   - `BaseSelect.vue` - Dropdown Tailwind
   - `BaseRadio.vue` - Radio button stylisé
   - `BaseCheckbox.vue` - Checkbox stylisé
   - `BaseInput.vue` - Input avec variants
   - `BaseButton.vue` - Bouton avec icônes/loading

4. Remplacer progressivement dans les pages/composants

**Priorité** : 🟡 Moyen (après Phase 1 complète)

**Temps estimé** : 6-8 heures

---

## 📋 Fonctionnalités - Phase 1 (à terminer)

### 1. Duplication de session
- [ ] Bouton "Dupliquer" dans le menu des sessions
- [ ] Copie session + items + config
- [ ] Nouveau join_code généré
- [ ] Status remis à 'draft'

**Temps estimé** : 3-4 heures

### 2. Export CSV
- [ ] Bouton dans page "Voir les réponses"
- [ ] Export de toutes les réponses
- [ ] Format : question, participant_id, réponse, timestamp
- [ ] Compatible Excel/Google Sheets

**Temps estimé** : 2-3 heures

---

## 🚀 Fonctionnalités - Phase 2

### Timer sur questions
- [ ] Champ "Durée limite" dans QuestionBuilder
- [ ] Composant Timer.vue avec compte à rebours
- [ ] Fermeture automatique après expiration
- [ ] Sync temps réel entre enseignant et élèves

**Temps estimé** : 4-5 heures

### Templates de sessions
- [ ] Option "Sauvegarder comme template"
- [ ] Page `/teacher/templates`
- [ ] Table `session_templates` en base
- [ ] Créer session depuis template

**Temps estimé** : 5-6 heures

### Mode examen
- [ ] Toggle "Mode examen" sur session
- [ ] Une seule tentative par participant
- [ ] Pas d'affichage des résultats
- [ ] Verrouillage après réponse

**Temps estimé** : 4-5 heures

---

## 🏢 Fonctionnalités - Phase 3

### Dashboard admin
- [ ] Page `/admin` protégée
- [ ] Liste demandes enseignants en attente
- [ ] Boutons Approuver/Refuser
- [ ] Vue d'ensemble toutes les sessions

**Temps estimé** : 5-6 heures

### Historique et archives
- [ ] Onglets "Actives" / "Archives"
- [ ] Archivage auto après X jours
- [ ] Recherche et filtres
- [ ] Restauration sessions archivées

**Temps estimé** : 4-5 heures

### Export PDF
- [ ] Génération rapport PDF
- [ ] Inclut graphiques et stats
- [ ] Format imprimable
- [ ] Librairie : jspdf + html2canvas

**Temps estimé** : 6-8 heures

### Mode sombre
- [ ] Toggle dans navbar
- [ ] Classes Tailwind dark: mode
- [ ] localStorage pour préférence
- [ ] Cohérence sur toutes les pages

**Temps estimé** : 2-3 heures

---

## 🐛 Bugs connus

_Aucun bug connu actuellement_ ✅

---

## 📝 Notes

### Améliorations UX identifiées
1. ✅ **QuestionTypeSelector** - Dropdown avec icônes (FAIT !)
2. ✅ **QuestionTypeBadge** - Badges colorés avec icônes (FAIT !)
3. ✅ **ActiveQuestionSelector** - Dropdown Mode Live (FAIT !)
4. ⏳ Session cards dans `/teacher` avec preview des questions
5. ⏳ Drag & drop pour réorganiser les questions
6. ⏳ Copier/coller de questions entre sessions
7. ⏳ Recherche/filtres dans la liste des sessions

### Optimisations techniques
- [ ] Lazy loading des composants Results
- [ ] Cache des statistiques côté serveur
- [ ] Optimisation des requêtes SQL (indexes)
- [ ] PWA pour mode hors-ligne

---

**Dernière mise à jour** : 29 janvier 2026
**Prochaine action** : Terminer Phase 1 (Duplication + Export CSV)
