# Parcours Contributeur : Ajout de Contenu au Dictionnaire

## 🎯 Objectif
Documenter tous les parcours possibles pour qu'un contributeur ajoute du contenu (mots, catégories, langues) au dictionnaire O'Ypunu.

## 👤 Profil Utilisateur
- **Statut** : Utilisateur connecté avec rôle "CONTRIBUTOR"
- **Permissions** : Ajout de mots, catégories et proposition de langues
- **Responsabilité** : Qualité et exactitude du contenu ajouté

---

## 🔍 Navigation Contributeur Enrichie

### Nouvelles Options Disponibles
- ➕ **Ajouter un mot** (`/dictionary/add`)
- ➕ **Ajouter une catégorie** (`/dictionary/add-category`)
- ➕ **Proposer une langue** (`/languages/add`)
- ✏️ **Modifier** les mots existants (`/dictionary/edit/:id`)
- 📊 **Statistiques** contributeur étendues

---

## 📝 Parcours 1 : Ajout d'un Nouveau Mot

### Étape 1.1 : Accès au Formulaire d'Ajout (`/dictionary/add`)
**Vérifications d'accès :**
- ✅ AuthGuard : Utilisateur connecté
- ✅ RoleGuard : Rôle CONTRIBUTOR minimum
- 🔒 Redirection si droits insuffisants

### Étape 1.2 : Interface du Formulaire d'Ajout de Mot

#### Section Informations de Base
**Champs obligatoires :**
- 📝 **Mot** (terme à ajouter)
- 🌍 **Langue** (sélection depuis liste existante)
- 📚 **Catégorie** (sélection ou création)
- 📖 **Définition principale**

**Champs optionnels :**
- 🔊 **Prononciation** (phonétique IPA)
- 📝 **Définitions alternatives**
- 🌍 **Traductions** (dans d'autres langues)
- 📚 **Étymologie**
- 🏷️ **Tags/Mots-clés**

#### Section Exemples d'Usage
- 💬 **Phrases d'exemple** (au moins une recommandée)
- 📖 **Contexte d'utilisation**
- 🎯 **Registre de langue** (familier, soutenu, technique, etc.)

#### Section Métadonnées
- 🔍 **Sources** (dictionnaires, livres, documents de référence)
- ⚠️ **Niveau de difficulté**
- 📊 **Fréquence d'usage**

### Étape 1.3 : Validations du Formulaire

#### Validations Côté Client
- ✏️ **Champs obligatoires** remplis
- 📏 **Longueur** des champs respectée
- 🔤 **Format** de la prononciation (si IPA)
- 🌍 **Cohérence** langue/catégorie

#### Validations Côté Serveur
- 🚫 **Mot déjà existant** dans cette langue
- ✅ **Langue valide** et active
- ✅ **Catégorie valide** pour cette langue
- 🔍 **Détection** de contenu inapproprié

### Étape 1.4 : Soumission et Processus de Modération

**Action** : Clic sur "Soumettre le mot"

**Processus automatique :**
- 💾 **Sauvegarde** avec statut "pending"
- 📧 **Notification** aux modérateurs
- ✅ **Confirmation** affichée au contributeur
- 🔗 **Lien** vers le mot en attente de validation

**États possibles du mot :**
- 🟡 **pending** : En attente de modération
- 🟢 **approved** : Approuvé et publié
- 🔴 **rejected** : Refusé avec motif

---

## 🗂️ Parcours 2 : Ajout d'une Nouvelle Catégorie

### Étape 2.1 : Accès au Formulaire de Catégorie (`/dictionary/add-category`)
**Contexte d'utilisation :**
- Besoin d'une catégorie inexistante
- Organisation thématique spécialisée
- Subdivision d'une catégorie trop large

### Étape 2.2 : Formulaire d'Ajout de Catégorie

#### Informations Principales
- 📝 **Nom de la catégorie**
- 🌍 **Langue associée**
- 📖 **Description détaillée**
- 🎯 **Objectif/Usage** de cette catégorie

#### Classification
- 📂 **Catégorie parent** (si sous-catégorie)
- 🏷️ **Tags descriptifs**
- 🎨 **Couleur/Icône** représentative (optionnel)

#### Justification
- ✍️ **Motivation** pour créer cette catégorie
- 📚 **Exemples** de mots qui y appartiendraient
- 📊 **Estimation** du nombre de mots potentiels

### Étape 2.3 : Validation et Approbation
**Processus similaire aux mots :**
- Soumission avec statut "pending"
- Modération par les administrateurs
- Approbation/rejet avec notification

---

## 🌍 Parcours 3 : Proposition d'une Nouvelle Langue

### Étape 3.1 : Accès au Formulaire de Langue (`/languages/add`)
**Cas d'usage :**
- Langue manquante dans le système
- Dialecte spécialisé
- Langue construite (conlang)

### Étape 3.2 : Formulaire Complexe de Proposition de Langue

#### Informations Linguistiques de Base
- 🏷️ **Nom de la langue** (en français et dans la langue)
- 🌍 **Famille linguistique**
- 📍 **Région/Pays** d'usage
- 👥 **Nombre de locuteurs** estimé

#### Codes ISO Standards
- 🔤 **Code ISO 639-1** (2 lettres, si existe)
- 🔤 **Code ISO 639-2** (3 lettres)
- 🔤 **Code ISO 639-3** (3 lettres, identifiant unique)

#### Informations Techniques
- ✍️ **Système d'écriture** (alphabet, script)
- ⬆️ **Direction d'écriture** (LTR, RTL, vertical)
- 🎯 **Statut** (officielle, régionale, minoritaire, éteinte)

#### Justification et Documentation
- 📚 **Sources documentaires**
- 📖 **Dictionnaires existants**
- 🎓 **Références académiques**
- ✍️ **Motivation personnelle**

### Étape 3.3 : Processus de Validation Approfondi
**Évaluation spécialisée :**
- Vérification des codes ISO
- Validation par des experts linguistiques
- Approbation par les administrateurs système

---

## ✏️ Parcours 4 : Modification de Contenu Existant

### Étape 4.1 : Accès à l'Édition (`/dictionary/edit/:id`)
**Points d'accès :**
- Bouton "Modifier" sur la page d'un mot
- Lien depuis les statistiques contributeur
- Correction d'erreurs signalées

### Étape 4.2 : Interface d'Édition
**Formulaire pré-rempli :**
- Toutes les informations existantes
- Historique des modifications
- Commentaires des utilisateurs/modérateurs

#### Types de Modifications Possibles
- 📝 **Amélioration** des définitions
- ➕ **Ajout** d'exemples d'usage
- 🔧 **Correction** d'erreurs factuelles
- 🌍 **Ajout** de traductions
- 📚 **Enrichissement** des étymologies

### Étape 4.3 : Système de Versioning
- 📅 **Historique** des modifications
- 👤 **Auteur** de chaque modification
- 📝 **Raison** de la modification
- 🔄 **Possibilité** de rollback (pour modérateurs)

---

## 📊 Parcours 5 : Suivi des Contributions

### Étape 5.1 : Tableau de Bord Contributeur
**Statistiques personnelles :**
- 📝 **Mots ajoutés** (total, approuvés, en attente, refusés)
- 🗂️ **Catégories créées**
- 🌍 **Langues proposées**
- ✏️ **Modifications effectuées**

### Étape 5.2 : Statut des Contributions en Cours
**Interface de suivi :**
- 🟡 **En attente** de modération
- 🔵 **En révision** par les modérateurs  
- 🟢 **Approuvées** récemment
- 🔴 **Refusées** avec motifs
- 💬 **Demandant** des clarifications

### Étape 5.3 : Notifications de Statut
**Alertes automatiques :**
- ✅ Approbation de contribution
- ❌ Refus avec explications
- 💬 Demande d'informations complémentaires
- 🏆 Badges/récompenses obtenus

---

## 🔄 Parcours 6 : Processus de Révision et Correction

### Étape 6.1 : Demandes de Clarification
**Lorsqu'un modérateur demande des précisions :**
- 📧 **Email de notification**
- 💬 **Commentaires spécifiques** sur les points à améliorer
- 🔗 **Lien direct** vers l'interface de modification
- ⏰ **Délai** pour apporter les corrections

### Étape 6.2 : Interface de Réponse aux Commentaires
- 👀 **Visualisation** des commentaires modérateur
- ✏️ **Modification** directe du contenu
- 💬 **Réponse** aux questions posées
- ✅ **Re-soumission** pour validation

### Étape 6.3 : Cycle Itératif
- Possibilité de plusieurs allers-retours
- Amélioration progressive de la qualité
- Apprentissage pour les futures contributions

---

## 🎯 Parcours 7 : Spécialisations de Contribution

### Étape 7.1 : Contribution par Domaine d'Expertise
**Spécialisation possible :**
- 🏥 **Médical** : Terminologie médicale
- ⚖️ **Juridique** : Vocabulaire légal
- 🔬 **Scientifique** : Termes techniques
- 🎭 **Culturel** : Expressions, traditions

### Étape 7.2 : Outils Spécialisés
**Fonctionnalités avancées :**
- 📚 **Templates** par domaine
- 🔗 **Intégration** avec sources de référence
- 🎯 **Validation** par pairs dans le domaine
- 📊 **Métriques** de qualité spécialisées

---

## ⚠️ Responsabilités et Bonnes Pratiques

### Étape 8.1 : Code de Conduite Contributeur
**Engagements :**
- ✅ **Exactitude** des informations
- 📚 **Vérification** des sources
- 🤝 **Respect** de la communauté
- 🔍 **Qualité** avant quantité

### Étape 8.2 : Gestion des Erreurs et Corrections
**Processus de correction :**
- 🚨 **Signalement** d'erreurs par la communauté
- 🔧 **Correction rapide** par le contributeur
- 📝 **Documentation** des modifications
- 💡 **Apprentissage** pour éviter la récurrence

### Étape 8.3 : Sanctions et Dégradation de Droits
**En cas de problèmes récurrents :**
- ⚠️ **Avertissement** pour erreurs répétées
- 🔒 **Limitation temporaire** des droits
- 👥 **Révision par pairs** obligatoire
- ❌ **Retrait du statut** contributeur (cas extrême)

---

## 🏆 Parcours 8 : Reconnaissance et Gamification

### Étape 8.1 : Système de Badges
**Récompenses possibles :**
- 🥇 **Premier mot** approuvé
- 📚 **Expert** dans un domaine
- 🌍 **Polyglotte** (contributions multilingues)
- ⚡ **Contributeur rapide**
- 🎯 **Qualité exemplaire**

### Étape 8.2 : Classements et Statistiques
**Métriques valorisées :**
- 📊 **Volume** de contributions
- ⭐ **Score qualité** moyen
- 🚀 **Vitesse** d'approbation
- 🤝 **Impact** sur la communauté

### Étape 8.3 : Évolution vers des Rôles Plus Élevés
**Progression possible :**
- 👑 **Contributeur expert** (validation de pairs)
- 🛡️ **Modérateur** de contenu
- ⚙️ **Administrateur** de langue/domaine

---

## 📱 Adaptations Mobile pour Contributeurs

### Interface Mobile Optimisée
- 📝 **Formulaires adaptatifs**
- 🔊 **Enregistrement audio** pour prononciations
- 📷 **Capture d'images** pour références
- ⚡ **Sauvegarde automatique** fréquente

### Fonctionnalités Mobiles Spécifiques
- 🔔 **Notifications push** pour les validations
- 📍 **Géolocalisation** pour langues régionales
- 🎤 **Dictée vocale** pour saisie rapide

---

## 🎯 Métriques de Succès pour les Contributeurs

### Métriques Individuelles
- 📈 **Taux d'approbation** des contributions
- ⏰ **Temps moyen** de validation
- 🎯 **Score qualité** moyen
- 🔄 **Taux de révision** nécessaire

### Métriques Communautaires
- 👥 **Collaboration** entre contributeurs
- 🌍 **Diversité** linguistique des contributions
- 📚 **Enrichissement** du dictionnaire
- 💬 **Feedback positif** de la communauté

---

## ✨ Parcours d'Excellence

### Objectif : Contributeur Expert
- Reconnaissance par la qualité constante
- Privilèges de validation accélérée
- Mentorat de nouveaux contributeurs
- Participation aux décisions communautaires

### Évolution vers l'Administration
Voir : [Parcours Administrateur](../admin/) pour les contributeurs d'excellence