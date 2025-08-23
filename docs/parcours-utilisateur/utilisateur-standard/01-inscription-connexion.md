# Parcours Utilisateur : Inscription et Connexion

## 🎯 Objectif
Documenter tous les parcours possibles pour qu'un visiteur crée un compte et se connecte à O'Ypunu.

## 👤 Profil Utilisateur
- **Point de départ** : Visiteur non inscrit
- **Objectif** : Créer un compte et accéder aux fonctionnalités
- **Statut final** : Utilisateur authentifié avec le rôle "USER"

---

## 🚀 Parcours 1 : Inscription Complète

### Étape 1.1 : Accès au Formulaire d'Inscription (`/auth/register`)
**Points d'entrée possibles :**
- Clic sur "S'inscrire" dans le header
- Redirection depuis une tentative d'accès à une fonctionnalité protégée
- Lien depuis la page de connexion

### Étape 1.2 : Remplissage du Formulaire
**Informations requises :**
- ✅ **Email** (validation format + unicité)
- ✅ **Nom d'utilisateur** (validation unicité)
- ✅ **Mot de passe** (critères de sécurité)
- ✅ **Confirmation mot de passe**
- ✅ **Acceptation des CGU**

**Validations temps réel :**
- Format email valide
- Nom d'utilisateur disponible
- Force du mot de passe
- Correspondance des mots de passe

### Étape 1.3 : Soumission du Formulaire
**Action** : Clic sur "Créer mon compte"

**Cas de Succès :**
- Compte créé avec le rôle "USER"
- Email de vérification envoyé
- Redirection vers page de confirmation

**Cas d'Erreur :**
- Email déjà utilisé → Message d'erreur + lien vers connexion
- Nom d'utilisateur pris → Suggestions alternatives
- Problème serveur → Message d'erreur générique

### Étape 1.4 : Vérification Email (`/auth/verify-email/:token`)
**Actions utilisateur :**
- Consulter l'email de vérification reçu
- Clic sur le lien de vérification

**Résultats possibles :**
- ✅ **Succès** : Email vérifié → Redirection vers page d'accueil connecté
- ❌ **Token expiré** : Message d'erreur + possibilité de renvoyer l'email
- ❌ **Token invalide** : Message d'erreur + redirection inscription

---

## 🔐 Parcours 2 : Connexion Standard

### Étape 2.1 : Accès au Formulaire de Connexion (`/auth/login`)
**Points d'entrée possibles :**
- Clic sur "Se connecter" dans le header
- Redirection depuis une page protégée
- Lien depuis la page d'inscription

### Étape 2.2 : Remplissage du Formulaire
**Informations requises :**
- ✅ **Email ou nom d'utilisateur**
- ✅ **Mot de passe**
- ⚡ **Option "Se souvenir de moi"** (optionnelle)

### Étape 2.3 : Soumission du Formulaire
**Action** : Clic sur "Se connecter"

**Cas de Succès :**
- Authentification réussie
- Mise à jour du token de session
- Redirection vers :
  - Page d'origine (si redirection depuis page protégée)
  - Tableau de bord utilisateur par défaut
  - Page d'accueil connecté

**Cas d'Erreur :**
- ❌ **Email/mot de passe incorrect** : Message d'erreur + lien mot de passe oublié
- ❌ **Compte non vérifié** : Message + possibilité de renvoyer l'email de vérification
- ❌ **Compte suspendu/banni** : Message informatif
- ❌ **Trop de tentatives** : Blocage temporaire + message

---

## 🔄 Parcours 3 : Récupération de Mot de Passe

### Étape 3.1 : Demande de Réinitialisation (`/auth/forgot-password`)
**Action** : Clic sur "Mot de passe oublié" depuis la page de connexion

**Formulaire :**
- ✅ **Email** du compte à récupérer

### Étape 3.2 : Soumission de la Demande
**Cas de Succès :**
- Email de récupération envoyé
- Redirection vers page de confirmation
- Instructions affichées

**Cas d'Erreur :**
- Email non trouvé → Message d'erreur + lien vers inscription
- Email récemment envoyé → Message de limitation temporelle

### Étape 3.3 : Réinitialisation (`/auth/reset-password/:token`)
**Actions :**
- Clic sur le lien reçu par email
- Saisie du nouveau mot de passe

**Formulaire :**
- ✅ **Nouveau mot de passe**
- ✅ **Confirmation nouveau mot de passe**

**Résultats :**
- ✅ **Succès** : Mot de passe mis à jour + connexion automatique
- ❌ **Token expiré/invalide** : Message d'erreur + redirection

---

## 🌐 Parcours 4 : Connexion Sociale (Si Implémentée)

### Étape 4.1 : Authentification Sociale
**Action** : Clic sur bouton de connexion sociale (Google, Facebook, etc.)

### Étape 4.2 : Autorisation Externe
- Redirection vers le fournisseur de service
- Autorisation des permissions
- Retour vers O'Ypunu

### Étape 4.3 : Traitement du Retour (`/auth/social-auth-success`)
**Nouveaux utilisateurs :**
- Création automatique du compte
- Rôle "USER" par défaut
- Pas de vérification email nécessaire

**Utilisateurs existants :**
- Connexion directe
- Mise à jour des informations si nécessaire

---

## 📱 Interface Post-Connexion

### Changements Visuels Immédiats
**Header/Navigation :**
- Masquage des boutons "Se connecter" et "S'inscrire"
- Affichage du profil utilisateur
- Activation des liens protégés :
  - 🔍 **Recherche** (`/dictionary`)
  - ⭐ **Favoris** (`/favorites`)
  - 💬 **Messages** (`/messaging`)
  - 👥 **Communauté** (`/communities`)

**Navigation Mobile :**
- Menu étendu avec options utilisateur
- Profil accessible
- Notifications visibles

### Nouvelles Fonctionnalités Accessibles
- ✅ **Ajout aux favoris** sur les mots
- ✅ **Participation aux discussions** communautaires
- ✅ **Envoi/réception de messages privés**
- ✅ **Gestion du profil personnel**
- ✅ **Notifications système**

---

## 👤 Parcours 5 : Première Configuration du Profil

### Étape 5.1 : Accès au Profil (`/profile`)
**Actions possibles :**
- Clic sur l'avatar/nom dans le header
- Navigation directe

### Étape 5.2 : Consultation du Profil Vide
**Informations visibles :**
- Nom d'utilisateur
- Email (partiellement masqué)
- Date d'inscription
- Statistiques (toutes à zéro)

### Étape 5.3 : Édition du Profil (`/profile/edit`)
**Champs modifiables :**
- ✏️ **Prénom**
- ✏️ **Nom**
- ✏️ **Bio/Description**
- ✏️ **Localisation**
- ✏️ **Site web**
- 🖼️ **Photo de profil**

**Validations :**
- Formats d'images acceptés
- Taille maximale des fichiers
- Longueur des champs texte

---

## 🔄 Parcours 6 : Déconnexion

### Action de Déconnexion
**Points d'accès :**
- Menu dropdown du profil
- Bouton dédié dans l'interface

**Processus :**
- Invalidation du token de session
- Nettoyage du localStorage/sessionStorage
- Redirection vers page d'accueil non connecté

---

## ⚠️ Gestion des Erreurs et Cas Particuliers

### Problèmes de Réseau
- Messages d'erreur informatifs
- Possibilité de réessayer
- Sauvegarde des données en cours de saisie

### Sessions Expirées
- Détection automatique
- Redirection vers page de connexion
- Possibilité de retourner à la page d'origine après reconnexion

### Comptes Suspendus/Bannis
- Messages explicatifs
- Information sur les recours possibles
- Contact administrateur

---

## 📊 États Utilisateur Possibles

### Après Inscription Réussie
- **Statut** : `active`
- **Rôle** : `user`
- **Permissions** : Fonctionnalités utilisateur standard
- **Email vérifié** : `true` (après vérification)

### Données Utilisateur Initiales
```json
{
  "role": "user",
  "status": "active",
  "isActive": true,
  "emailVerified": true,
  "stats": {
    "totalWords": 0,
    "approvedWords": 0,
    "pendingWords": 0,
    "rejectedWords": 0
  }
}
```

---

## 🎯 Points de Friction Potentiels

### Inscription
1. **Validation email trop stricte**
2. **Critères de mot de passe complexes**
3. **Processus de vérification email long**

### Connexion
1. **Messages d'erreur peu clairs**
2. **Pas de récupération automatique de session**
3. **Interface non responsive sur mobile**

---

## ✨ Prochaines Étapes

Une fois connecté, l'utilisateur peut :
- Explorer les fonctionnalités → [Parcours Utilisateur Standard](02-navigation-standard.md)
- Découvrir les fonctionnalités avancées
- Évoluer vers un rôle contributeur → [Parcours Contributeur](../contributeur/01-demande-contribution.md)

---

## 🔍 Métriques de Succès

### Inscription
- Taux de conversion visiteur → inscrit
- Taux de vérification email
- Temps moyen d'inscription

### Connexion
- Taux de connexion réussie
- Temps moyen de connexion
- Taux d'utilisation "Se souvenir de moi"

### Récupération
- Taux d'utilisation du mot de passe oublié
- Taux de réinitialisation réussie