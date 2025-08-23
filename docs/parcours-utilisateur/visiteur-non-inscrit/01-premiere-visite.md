# Parcours Utilisateur : Première Visite (Visiteur Non Inscrit)

## 🎯 Objectif
Documenter tous les parcours possibles pour un visiteur qui découvre O'Ypunu pour la première fois, sans compte utilisateur.

## 👤 Profil Utilisateur
- **Statut** : Non authentifié
- **Objectif** : Découvrir l'application, explorer le contenu disponible
- **Contraintes** : Accès limité aux fonctionnalités publiques uniquement

---

## 🌐 Point d'Entrée : Page d'Accueil (`/`)

### Actions Possibles
1. **Explorer la navigation**
   - Logo O'Ypunu (retour à l'accueil)
   - Liens principaux visibles (sur desktop uniquement)

2. **Navigation Desktop Disponible**
   - 🔍 **Dictionnaire** (`/dictionary`)
   - 👥 **Communauté** (`/communities`)
   - 🔐 **Se connecter** (`/auth/login`)
   - ✨ **S'inscrire** (`/auth/register`)

3. **Navigation Mobile**
   - Menu hamburger révélant les mêmes options
   - Adaptation responsive de l'interface

---

## 🔍 Parcours 1 : Exploration du Dictionnaire

### Étape 1.1 : Accès au Dictionnaire (`/dictionary`)
**Action** : Clic sur "Dictionnaire"
**Résultat** : Redirection vers la page de recherche

### Étape 1.2 : Interface de Recherche
**Fonctionnalités disponibles :**
- Barre de recherche principale
- Filtres de recherche (langues, catégories)
- Suggestions de recherche (si implémentées)

### Étape 1.3 : Effectuer une Recherche
**Action** : Saisir un terme et valider
**Résultat** : Redirection vers `/dictionary/search` avec les résultats

### Étape 1.4 : Consultation des Résultats (`/dictionary/search`)
**Fonctionnalités :**
- Liste des mots trouvés
- Aperçu des définitions
- Filtres additionnels
- Pagination si nécessaire

### Étape 1.5 : Consulter un Mot Spécifique (`/dictionary/word/:id`)
**Action** : Clic sur un mot dans les résultats
**Contenu accessible :**
- Définition complète
- Prononciation (si disponible)
- Exemples d'usage
- Catégorie et langue
- **Limitations** : Pas de favoris, pas de commentaires

---

## 👥 Parcours 2 : Exploration des Communautés

### Étape 2.1 : Accès aux Communautés (`/communities`)
**Action** : Clic sur "Communauté"
**Contenu visible :**
- Liste des communautés publiques
- Aperçu des discussions récentes (lecture seule)
- Statistiques générales

### Étape 2.2 : Limitations Rencontrées
**Fonctionnalités bloquées :**
- ❌ Création de posts
- ❌ Réponse aux discussions
- ❌ Création de communauté
- ❌ Messages privés
- 💡 **Incitation à l'inscription** affichée

---

## 🔐 Parcours 3 : Découverte des Options d'Authentification

### Étape 3.1 : Accès à la Connexion (`/auth/login`)
**Éléments de la page :**
- Formulaire de connexion (email/mot de passe)
- Option "Mot de passe oublié"
- Liens vers l'inscription
- Possibles options de connexion sociale

### Étape 3.2 : Page d'Inscription (`/auth/register`)
**Formulaire d'inscription :**
- Informations personnelles requises
- Conditions d'utilisation
- Politique de confidentialité
- Processus de vérification email

### Étape 3.3 : Récupération de Mot de Passe (`/auth/forgot-password`)
**Action** : Clic sur "Mot de passe oublié"
**Processus :**
- Saisie de l'email
- Envoi d'un lien de réinitialisation
- Redirection vers une page de confirmation

---

## 📄 Parcours 4 : Pages Légales et Informations

### Étape 4.1 : Accès aux Mentions Légales (`/legal/*`)
**Pages disponibles :**
- Conditions générales d'utilisation
- Politique de confidentialité
- Mentions légales
- Contact

---

## 🚫 Limitations pour les Visiteurs Non Inscrits

### Fonctionnalités Interdites
- ❌ Ajout de mots au dictionnaire
- ❌ Ajout de favoris
- ❌ Participation aux discussions
- ❌ Envoi de messages privés
- ❌ Création de profil
- ❌ Proposition de nouvelles langues
- ❌ Accès aux fonctionnalités administratives

### Incitations à l'Inscription
- Messages d'encouragement sur les pages limitées
- Mise en avant des avantages de l'inscription
- CTA (Call-to-Action) stratégiquement placés

---

## 🔄 Points de Conversion Principaux

### Moments Clés pour Inciter à l'Inscription
1. **Après consultation de plusieurs mots** → "Sauvegardez vos recherches en créant un compte"
2. **Tentative d'interaction communautaire** → "Rejoignez la conversation en vous inscrivant"
3. **Découverte d'une langue d'intérêt** → "Contribuez au dictionnaire de votre langue"

### Signaux d'Engagement Élevé
- Consultation de plus de 3 mots
- Tentative d'accès aux fonctionnalités protégées
- Temps passé significatif sur le site
- Navigation entre différentes sections

---

## 📱 Variations Mobile vs Desktop

### Adaptations Mobile
- Menu hamburger pour la navigation
- Interface de recherche optimisée
- Affichage condensé des résultats
- Navigation tactile optimisée

### Fonctionnalités Identiques
- Même contenu accessible
- Mêmes limitations d'accès
- Mêmes points de conversion

---

## 🎯 Objectifs de Conversion

### Objectif Principal
Convertir le visiteur en utilisateur inscrit

### Métriques de Succès
- Taux de pages vues par session
- Temps passé sur le site
- Taux de conversion inscription
- Taux de rebond par section

---

## ⚡ Actions Recommandées Post-Analyse

### Pour Améliorer l'Expérience Visiteur
1. **Optimiser les CTA d'inscription**
2. **Améliorer la découvrabilité du contenu**
3. **Afficher des exemples d'usage concrets**
4. **Créer des parcours guidés pour nouveaux visiteurs**

### Prochaines Étapes
- Le visiteur peut décider de s'inscrire → Voir [Parcours Inscription](../utilisateur-standard/01-inscription-connexion.md)
- Le visiteur peut quitter le site (analyse des points de sortie)