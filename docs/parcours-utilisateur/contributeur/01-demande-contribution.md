# Parcours Contributeur : Demande de Contribution

## 🎯 Objectif
Documenter le processus complet pour qu'un utilisateur standard devienne contributeur O'Ypunu.

## 👤 Profil Utilisateur
- **Point de départ** : Utilisateur connecté avec rôle "USER"
- **Motivation** : Volonté de contribuer au dictionnaire
- **Objectif** : Obtenir le statut "CONTRIBUTOR"

---

## 🚀 Parcours 1 : Découverte du Besoin de Contribution

### Étape 1.1 : Moments de Prise de Conscience
**Situations déclenchantes :**
- 🔍 **Mot non trouvé** lors d'une recherche
- 📝 **Définition incomplète** ou incorrecte découverte
- 🌍 **Langue maternelle** peu représentée
- 💡 **Connaissance spécialisée** dans un domaine

### Étape 1.2 : Tentative d'Ajout de Contenu
**Actions bloquées pour utilisateur standard :**
- Tentative d'accès à `/dictionary/add` → Redirection avec message
- Clic sur "Ajouter un mot" → Modal d'explication
- Découverte des limitations de rôle

### Étape 1.3 : Message d'Encouragement à Contribuer
**Contenu du message :**
- ✨ **Explication** des avantages contributeur
- 🎯 **Invitation** à faire une demande
- 📋 **Lien direct** vers le formulaire de demande
- 💡 **Exemples** de contributions possibles

---

## 📝 Parcours 2 : Remplissage de la Demande de Contribution

### Étape 2.1 : Accès au Formulaire (`/contributor-request`)
**Prérequis vérifié :**
- ✅ Utilisateur connecté (AuthGuard)
- ✅ Rôle "USER" minimum (RoleGuard)
- ❌ Redirection si déjà contributeur

### Étape 2.2 : Interface du Formulaire
**Sections du formulaire :**

#### Informations Personnelles
- 👤 **Nom complet** (pré-rempli depuis le profil)
- 📧 **Email** (pré-rempli, non modifiable)
- 📍 **Localisation** (optionnel)
- 🌐 **Site web/Portfolio** (optionnel)

#### Expérience Linguistique
- 🌍 **Langues maîtrisées** (sélection multiple)
  - Niveau de maîtrise pour chaque langue
  - Langue(s) native(s)
  - Langues d'étude/travail
- 📚 **Domaines d'expertise** (littérature, technique, médical, etc.)
- 🎓 **Formation linguistique** (diplômes, certifications)

#### Motivation et Engagement
- ✍️ **Lettre de motivation** (obligatoire, 200-1000 caractères)
  - Pourquoi souhaitez-vous contribuer ?
  - Quelle est votre expérience avec les dictionnaires ?
  - Comment comptez-vous contribuer ?
- ⏰ **Disponibilité** (heures par semaine approximative)
- 🎯 **Objectifs de contribution**

#### Engagement et Responsabilités
- ✅ **Acceptation des règles** de contribution
- ✅ **Engagement qualité** (vérifications, sources)
- ✅ **Respect de la communauté**

### Étape 2.3 : Validation du Formulaire
**Validations côté client :**
- 📝 **Champs obligatoires** remplis
- 📏 **Longueur de motivation** respectée
- 🌍 **Au moins une langue** sélectionnée
- ✅ **Cases d'engagement** cochées

**Validations côté serveur :**
- 🚫 **Pas de demande** en cours pour cet utilisateur
- ✉️ **Email valide** et vérifié
- 📊 **Historique utilisateur** suffisant (ancienneté, activité)

### Étape 2.4 : Soumission de la Demande
**Action** : Clic sur "Soumettre ma demande"

**Processus côté serveur :**
- 💾 **Création** de l'enregistrement de demande
- ✉️ **Email de confirmation** envoyé au candidat
- 📧 **Notification** envoyée aux administrateurs
- 🏷️ **Statut initial** : "pending"

---

## ⏳ Parcours 3 : Attente et Suivi de la Demande

### Étape 3.1 : Email de Confirmation
**Contenu de l'email utilisateur :**
- ✅ **Confirmation** de réception
- 📋 **Récapitulatif** de la demande
- ⏱️ **Délai de traitement** estimé
- 🔗 **Lien de suivi** de la demande

### Étape 3.2 : Email Admin pour Modération
**Contenu de l'email administrateur :**
- 👤 **Profil** du candidat
- 📊 **Résumé** de la demande
- 🔗 **Lien direct** vers la page de modération
- ⚡ **Actions rapides** (approuver/rejeter/demander plus d'infos)

### Étape 3.3 : États de la Demande
**Statuts possibles :**
- 🟡 **pending** : En attente de révision
- 🔵 **under_review** : En cours d'examen
- 🟢 **approved** : Approuvée, droits accordés
- 🔴 **rejected** : Refusée avec motif
- ⚪ **more_info_requested** : Informations supplémentaires demandées

---

## ⚖️ Parcours 4 : Processus de Modération Admin

### Étape 4.1 : Évaluation de la Demande
**Critères d'évaluation :**
- 📊 **Activité sur la plateforme** (historique, engagement)
- 🌍 **Expertise linguistique** déclarée
- ✍️ **Qualité de la motivation**
- 🎯 **Cohérence** des objectifs
- 🤝 **Respect des règles** communautaires

### Étape 4.2 : Décisions Possibles

#### ✅ Approbation Directe
- Droits contributeur accordés immédiatement
- Email de félicitations avec guide d'accueil
- Activation des nouvelles fonctionnalités

#### ❌ Rejet avec Motif
- Email explicatif avec raisons du refus
- Conseils pour améliorer une future candidature
- Possibilité de re-candidater après délai

#### 📋 Demande d'Informations Supplémentaires
- Questions spécifiques sur l'expertise
- Demande d'exemples de travail
- Clarifications sur la motivation

#### ⏱️ Mise en Attente
- Demande mise en révision spéciale
- Évaluation par plusieurs modérateurs
- Délai prolongé avec notification

---

## 🎉 Parcours 5 : Approbation et Activation des Droits

### Étape 5.1 : Notification d'Approbation
**Email de confirmation :**
- 🎉 **Félicitations** pour l'acceptation
- 🔑 **Activation** des droits contributeur
- 📚 **Guide de démarrage** contributeur
- 🤝 **Informations** sur la communauté contributeur

### Étape 5.2 : Activation du Statut Contributeur
**Changements système :**
- 🏷️ **Rôle utilisateur** : `USER` → `CONTRIBUTOR`
- ✅ **Permissions étendues** activées
- 🆕 **Nouvelles fonctionnalités** débloquées

### Étape 5.3 : Première Connexion Post-Approbation
**Nouvelles options visibles :**
- ➕ **Ajouter un mot** (`/dictionary/add`)
- ➕ **Ajouter une catégorie** (`/dictionary/add-category`)  
- ➕ **Proposer une langue** (`/languages/add`)
- 📊 **Statistiques contributeur** dans le profil

---

## 🚫 Parcours 6 : Refus de la Demande

### Étape 6.1 : Notification de Refus
**Email de refus :**
- 😔 **Message compatissant**
- 📝 **Motifs détaillés** du refus
- 💡 **Suggestions d'amélioration**
- ⏳ **Possibilité de re-candidater** après délai
- 🤝 **Encouragement** à rester membre actif

### Étape 6.2 : Motifs de Refus Possibles
**Raisons techniques :**
- 📊 **Activité insuffisante** sur la plateforme
- ⏱️ **Compte trop récent**
- 🌍 **Expertise linguistique** non démontrée
- ✍️ **Motivation peu convaincante**

**Raisons comportementales :**
- ⚠️ **Historique de violations** des règles
- 🚫 **Comportement inapproprié** en communauté
- 📋 **Non-respect** des consignes du formulaire

### Étape 6.3 : Possibilité de Re-candidature
**Conditions :**
- ⏳ **Délai d'attente** (ex: 3 mois)
- ✅ **Amélioration** des points faibles identifiés
- 📈 **Augmentation** de l'activité sur la plateforme

---

## 🔄 Parcours 7 : Demande d'Informations Complémentaires

### Étape 7.1 : Notification de Demande d'Infos
**Email à l'utilisateur :**
- ❓ **Questions spécifiques** des modérateurs
- 📝 **Formulaire complémentaire** à remplir
- ⏰ **Délai** pour répondre (ex: 15 jours)
- 🔗 **Lien** vers l'interface de réponse

### Étape 7.2 : Interface de Réponse
**Nouvelles questions possibles :**
- 📚 **Exemples concrets** de contributions envisagées
- 🎓 **Preuves** d'expertise linguistique
- ⏰ **Disponibilité détaillée**
- 🎯 **Plan de contribution** sur 6 mois

### Étape 7.3 : Re-soumission
- Même processus de modération
- Évaluation avec les nouvelles informations
- Décision finale (approbation/refus)

---

## 📊 Suivi de la Demande (Interface Utilisateur)

### Étape 8.1 : Page de Statut de Demande
**Informations visibles :**
- 📅 **Date de soumission**
- 🏷️ **Statut actuel** de la demande
- ⏱️ **Temps d'attente** écoulé
- 📋 **Historique** des étapes
- 💬 **Messages** des modérateurs (si applicable)

### Étape 8.2 : Actions Disponibles
**Selon le statut :**
- 📝 **Modifier** la demande (si en attente)
- ❌ **Annuler** la demande
- 📧 **Contacter** les modérateurs
- 📊 **Voir** les critères d'évaluation

---

## ⚠️ Cas Particuliers et Gestion d'Erreurs

### Demandes Multiples
- 🚫 **Interdiction** de soumettre plusieurs demandes
- 🔄 **Possibilité** de modifier une demande en attente
- ⏳ **Gestion** des re-candidatures après refus

### Problèmes Techniques
- 💾 **Sauvegarde** automatique du formulaire
- 🔄 **Récupération** en cas de perte de session
- 📧 **Support technique** disponible

### Cas Limite d'Utilisateurs
- 🎯 **Utilisateurs déjà contributeurs** → Redirection
- 🚫 **Utilisateurs suspendus** → Blocage avec message
- ⏰ **Comptes trop récents** → Message d'attente

---

## 📈 Métriques de Succès

### Côté Candidat
- 📋 **Taux de complétion** du formulaire
- ⏱️ **Temps moyen** de remplissage
- 🔄 **Taux de re-soumission** après demande d'infos

### Côté Modération
- ✅ **Taux d'approbation** global
- ⏰ **Temps moyen** de traitement
- 📊 **Qualité** des nouveaux contributeurs

### Côté Plateforme
- 📈 **Conversion** USER → CONTRIBUTOR
- 🎯 **Rétention** des nouveaux contributeurs
- 📚 **Productivité** post-approbation

---

## 🎯 Objectifs du Processus

### Pour l'Utilisateur
- 🚀 **Processus clair** et transparent
- ⏰ **Délais raisonnables**
- 📋 **Critères explicites**
- 🤝 **Communication bienveillante**

### Pour la Plateforme
- 🔍 **Sélection qualitative** des contributeurs
- ⚖️ **Équilibrage** entre qualité et croissance
- 🛡️ **Protection** de la qualité du contenu
- 📈 **Croissance sustainable** de la communauté

---

## ✨ Prochaines Étapes

Après approbation, le nouveau contributeur peut :
- Commencer à ajouter du contenu → [Parcours Contributeur - Ajout de Contenu](02-ajout-contenu.md)
- Découvrir les outils contributeur avancés
- Participer à la communauté contributeur
- Évoluer vers des responsabilités plus importantes