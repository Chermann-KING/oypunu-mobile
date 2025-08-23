# 🔐 Configuration de la Connexion Sociale

## 📱 État Actuel

La connexion sociale est **implémentée** dans l'application mobile avec support pour :
- 🔵 **Google OAuth**
- 📘 **Facebook Login**
- ⚫ **X (Twitter) OAuth**

## ⚙️ Configuration Requise

### 1. 🔵 Google OAuth

**Étapes de configuration :**

1. **Google Cloud Console**
   - Créez un projet dans [Google Cloud Console](https://console.cloud.google.com)
   - Activez l'API Google+ et/ou People API
   - Créez des identifiants OAuth 2.0

2. **Configuration Expo**
   ```bash
   # Dans votre .env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=votre-google-client-id
   ```

3. **Redirect URI**
   - Ajoutez votre URI de redirection dans Google Console
   - Format : `exp://127.0.0.1:19000/--/` (développement)

### 2. 📘 Facebook Login

**Étapes de configuration :**

1. **Meta for Developers**
   - Créez une app dans [Meta for Developers](https://developers.facebook.com)
   - Configurez Facebook Login

2. **Configuration Expo**
   ```bash
   # Dans votre .env
   EXPO_PUBLIC_FACEBOOK_APP_ID=votre-facebook-app-id
   ```

3. **App Domain**
   - Configurez les domaines autorisés dans Facebook Console

### 3. ⚫ X (Twitter) OAuth

**Étapes de configuration :**

1. **Twitter Developer Portal**
   - Créez une app dans [Developer Portal](https://developer.twitter.com)
   - Configurez OAuth 2.0

2. **Configuration Expo**
   ```bash
   # Dans votre .env
   EXPO_PUBLIC_TWITTER_CLIENT_ID=votre-twitter-client-id
   ```

## 🏗️ Architecture Implémentée

### Services
- **`SocialAuthService`** : Gère les flows OAuth pour tous les providers
- **`AuthService`** : Intègre les résultats OAuth avec l'API backend
- **`useAuth` hook** : Expose `socialLogin()` pour l'interface

### Interface Utilisateur
- **`SocialLoginButton`** : Composant réutilisable avec branding approprié
- **Intégré dans** :
  - ✅ `LoginScreen` : Boutons au-dessus du formulaire email/mot de passe
  - ✅ `RegisterScreen` : Options de création de compte social

### Flow de Connexion
```
1. User clique sur bouton social (Google/Facebook/X)
2. SocialAuthService → OAuth flow externe
3. Récupération tokens + user info du provider
4. AuthService → POST /auth/social/{provider} avec tokens
5. Backend valide et retourne JWT + user O'Ypunu
6. Stockage local + navigation vers profil
```

## 🎯 État des Fonctionnalités

| Provider | Interface | Service OAuth | Backend API | Status |
|----------|-----------|---------------|-------------|---------|
| Google   | ✅ | 🟡 Config req. | ✅ | Prêt après config |
| Facebook | ✅ | 🟡 Config req. | ✅ | Prêt après config |
| Twitter  | ✅ | 🟡 Config req. | ✅ | Prêt après config |

**Légende :**
- ✅ Implémenté et fonctionnel
- 🟡 Implémenté mais nécessite configuration
- ❌ Non implémenté

## 🚀 Utilisation

Une fois configuré, les utilisateurs peuvent :

1. **Depuis LoginScreen** : Cliquer sur "Continuer avec Google/Facebook/X"
2. **Depuis RegisterScreen** : Créer un compte avec un provider social
3. **Flow unifié** : Même expérience que login/register classique

## 🔧 Développement Local

Pour tester sans configuration complète :
- Les boutons affichent un message informatif
- Aucun crash, interface propre
- Documentation claire pour la production

## 📝 Notes Importantes

- **Sécurité** : Les tokens OAuth ne sont jamais stockés, seuls les JWT O'Ypunu le sont
- **Fallback** : La connexion email/mot de passe reste disponible
- **UX** : Interface adaptative selon l'état de configuration
- **Conformité** : Respect du parcours utilisateur documenté