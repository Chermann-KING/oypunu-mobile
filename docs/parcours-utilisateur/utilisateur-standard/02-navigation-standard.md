# Parcours Utilisateur : Navigation Standard (Utilisateur Connecté)

## 🎯 Objectif
Documenter tous les parcours possibles pour un utilisateur connecté avec le rôle "USER" dans O'Ypunu.

## 👤 Profil Utilisateur
- **Statut** : Authentifié
- **Rôle** : USER
- **Permissions** : Fonctionnalités utilisateur standard
- **Limitations** : Pas d'ajout de contenu au dictionnaire

---

## 🏠 Point de Départ : Interface Connectée

### Navigation Principale Disponible
- 🔍 **Recherche** (`/dictionary`) - Recherche dans le dictionnaire
- ⭐ **Favoris** (`/favorites`) - Mots sauvegardés
- 💬 **Messages** (`/messaging`) - Messagerie privée
- 👥 **Communauté** (`/communities`) - Discussions et communautés
- 👤 **Profil** - Menu dropdown avec options

---

## 🔍 Parcours 1 : Recherche et Consultation du Dictionnaire

### Étape 1.1 : Accès à la Recherche (`/dictionary`)
**Interface enrichie pour utilisateur connecté :**
- Barre de recherche avec historique personnel
- Suggestions basées sur les recherches précédentes
- Filtres avancés (langues préférées)

### Étape 1.2 : Effectuer une Recherche
**Fonctionnalités supplémentaires :**
- Sauvegarde automatique de l'historique
- Suggestions personnalisées
- Recherches sauvegardées

### Étape 1.3 : Consultation des Résultats (`/dictionary/search`)
**Nouvelles Actions Possibles :**
- ⭐ **Ajouter aux favoris** (clic sur l'icône étoile)
- 💬 **Signaler un problème** sur un mot
- 📤 **Partager** vers les communautés
- 💾 **Sauvegarder** la recherche

### Étape 1.4 : Page Détail d'un Mot (`/dictionary/word/:id`)
**Fonctionnalités Utilisateur :**
- ⭐ **Gestion des favoris** (ajouter/retirer)
- 💬 **Commentaires** sur le mot (si activé)
- 📊 **Historique de consultation**
- 🔗 **Partage social**

**Limitations Utilisateur Standard :**
- ❌ **Modification du mot**
- ❌ **Suppression**
- ❌ **Ajout de nouveaux mots**

---

## ⭐ Parcours 2 : Gestion des Favoris

### Étape 2.1 : Accès aux Favoris (`/favorites`)
**Interface :**
- Liste de tous les mots favoris
- Organisation par catégories/langues
- Fonctions de recherche dans les favoris
- Tri et filtrage

### Étape 2.2 : Actions sur les Favoris
**Gestion :**
- 👀 **Consulter** un mot favori
- 🗂️ **Organiser** en collections personnelles
- 🗑️ **Retirer** des favoris
- 📤 **Exporter** la liste (si disponible)

### Étape 2.3 : Collections Personnelles
**Fonctionnalités avancées :**
- Création de listes thématiques
- Partage de collections avec d'autres utilisateurs
- Notifications sur mises à jour de mots favoris

---

## 💬 Parcours 3 : Messagerie Privée

### Étape 3.1 : Accès à la Messagerie (`/messaging`)
**Interface :**
- Liste des conversations
- Recherche de contacts
- Notifications de nouveaux messages

### Étape 3.2 : Conversations Existantes
**Actions possibles :**
- 💬 **Répondre** aux messages
- 🖼️ **Envoyer** fichiers/images (si autorisé)
- 🔍 **Rechercher** dans l'historique
- 🗑️ **Supprimer** des messages

### Étape 3.3 : Nouvelle Conversation
**Processus :**
- 🔍 **Rechercher** un utilisateur par nom
- ✉️ **Composer** un nouveau message
- 📤 **Envoyer** le message initial

**Limitations :**
- Peut-être limité aux utilisateurs de même communauté
- Restrictions anti-spam

---

## 👥 Parcours 4 : Participation Communautaire

### Étape 4.1 : Exploration des Communautés (`/communities`)
**Interface utilisateur :**
- Liste des communautés publiques
- Communautés rejointes
- Communautés suggérées
- Recherche de communautés

### Étape 4.2 : Rejoindre une Communauté
**Actions :**
- 👀 **Consulter** les détails d'une communauté
- ➕ **Rejoindre** une communauté publique
- 📨 **Demander** l'accès aux communautés privées

### Étape 4.3 : Participation aux Discussions
**Fonctionnalités :**
- 💬 **Créer** de nouveaux posts/sujets
- 🔄 **Répondre** aux discussions existantes
- 👍 **Liker/Réagir** aux messages
- 📤 **Partager** du contenu

### Étape 4.4 : Gestion de l'Engagement
**Suivi :**
- 📬 **Notifications** des réponses
- 🔖 **Marquer** les discussions intéressantes
- 🔕 **Se désabonner** des notifications
- 📊 **Voir** ses statistiques de participation

---

## 👤 Parcours 5 : Gestion du Profil Personnel

### Étape 5.1 : Consultation du Profil (`/profile`)
**Informations visibles :**
- Données personnelles
- Statistiques d'utilisation
- Historique d'activité récente
- Mots favoris récents

### Étape 5.2 : Modification du Profil (`/profile/edit`)
**Champs modifiables :**
- ℹ️ **Informations personnelles** (nom, prénom, bio)
- 📍 **Localisation**
- 🌐 **Site web**
- 🖼️ **Photo de profil**
- 🔐 **Paramètres de confidentialité**

### Étape 5.3 : Paramètres du Compte
**Configuration :**
- 🔐 **Changer** le mot de passe
- ✉️ **Modifier** l'adresse email
- 🔔 **Préférences** de notification
- 🌍 **Langues préférées**

### Étape 5.4 : Consultation d'Autres Profils (`/profile/:username`)
**Actions sur profil externe :**
- 👀 **Voir** les informations publiques
- 💬 **Envoyer** un message privé
- ➕ **Suivre** l'utilisateur (si fonctionnalité disponible)

---

## 🔔 Parcours 6 : Gestion des Notifications

### Étape 6.1 : Centre de Notifications (`/notifications`)
**Types de notifications :**
- 💬 **Nouveaux messages** privés
- 🔄 **Réponses** aux discussions
- ⭐ **Mises à jour** des mots favoris
- 👥 **Activités** des communautés

### Étape 6.2 : Actions sur Notifications
- ✅ **Marquer** comme lues
- 🗑️ **Supprimer**
- ⚙️ **Configurer** les préférences

---

## 🎯 Parcours 7 : Évolution vers Contributeur

### Étape 7.1 : Découverte des Limitations
**Moments de friction :**
- Tentative d'ajout d'un mot → Message "Seuls les contributeurs peuvent ajouter des mots"
- Découverte de mots manquants
- Envie de contribuer à une langue spécifique

### Étape 7.2 : Demande de Statut Contributeur (`/contributor-request`)
**Processus disponible :**
- 📋 **Remplir** le formulaire de demande
- ✍️ **Expliquer** sa motivation
- 🌍 **Spécifier** les langues de contribution
- 📤 **Soumettre** la demande

**Voir** : [Parcours Contributeur - Demande](../contributeur/01-demande-contribution.md)

---

## ⚠️ Limitations Utilisateur Standard

### Fonctionnalités Restreintes
- ❌ **Ajout de mots** au dictionnaire
- ❌ **Modification de mots** existants
- ❌ **Proposition de nouvelles langues**
- ❌ **Création de catégories**
- ❌ **Accès aux outils d'administration**

### Messages d'Encouragement
- 💡 Incitations à devenir contributeur
- 🎯 Mise en avant des avantages contributeur
- 📈 Progression vers le statut contributeur

---

## 📱 Adaptation Mobile

### Interface Mobile Optimisée
- Navigation par onglets inférieurs
- Menu hamburger pour options secondaires
- Gestes tactiles pour actions rapides (swipe, pinch, etc.)

### Fonctionnalités Spécifiques Mobile
- 📷 **Upload photos** depuis l'appareil
- 📍 **Géolocalisation** pour contenu local
- 🔔 **Notifications push**

---

## 🔐 Sécurité et Confidentialité

### Contrôles de Confidentialité
- 👁️ **Visibilité** du profil (public/privé)
- 💬 **Qui peut** m'envoyer des messages
- 🔔 **Préférences** de notification
- 📊 **Partage** des statistiques

### Sessions et Sécurité
- 🔒 **Déconnexion** automatique
- 🔐 **Sessions** multiples
- ⚠️ **Alertes** de connexion suspecte

---

## 📊 Métriques Utilisateur

### Statistiques Personnelles
- 📖 **Mots consultés** (total)
- ⭐ **Favoris sauvegardés**
- 💬 **Messages envoyés**
- 👥 **Communautés rejointes**
- 🏆 **Badges/Récompenses** obtenus

### Progression
- 📈 **Évolution** dans le temps
- 🎯 **Objectifs** personnels
- 🏅 **Classements** communautaires

---

## 🔄 Parcours de Sortie

### Déconnexion
- 🚪 **Déconnexion simple** (reste dans l'app)
- 🔒 **Déconnexion sécurisée** (toutes les sessions)

### Désactivation de Compte
- ⏸️ **Désactivation temporaire**
- 🗑️ **Suppression définitive**
- 📤 **Export des données** personnelles

---

## ✨ Parcours de Découverte

### Nouvelles Fonctionnalités
- 🆕 **Notifications** de nouvelles features
- 🎯 **Tutoriels intégrés**
- 💡 **Conseils d'utilisation**

### Engagement Continu
- 🏆 **Système de gamification**
- 🎁 **Récompenses** de fidélité
- 📅 **Défis quotidiens/hebdomadaires**

---

## 🎯 Objectifs Utilisateur

### Objectifs Principaux
1. **Recherche efficace** dans le dictionnaire
2. **Sauvegarde** des mots utiles
3. **Participation** aux communautés linguistiques
4. **Apprentissage** et découverte de langues

### Indicateurs de Réussite
- Utilisation régulière des favoris
- Participation active aux discussions
- Retention sur plusieurs sessions
- Progression vers le statut contributeur

---

## 🚀 Prochaines Étapes Possibles

Selon l'engagement de l'utilisateur :
- **Haute implication** → Demande de contribution → [Parcours Contributeur](../contributeur/)
- **Utilisation standard** → Fidélisation et engagement continu
- **Faible utilisation** → Stratégies de réengagement