# 📱 O'Ypunu Mobile – App Expo/React Native

[![Expo](https://img.shields.io/badge/Expo-53.x-000020.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.x-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-5.x-4b8b3b.svg)](https://expo.github.io/router/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

> Application mobile d'O'Ypunu, le dictionnaire social multilingue. Construite avec Expo, React Native, Expo Router et NativeWind pour une expérience moderne, rapide et multiplateforme.

## 📋 Table des matières

- ✨ Aperçu
- 🚀 Fonctionnalités
- 🧱 Stack & dépendances clés
- ⚙️ Prérequis
- 📦 Installation & démarrage
- 🧪 Vérifications rapides (doctor, TypeScript)
- 🗂️ Structure du projet
- 🔗 Intégration Backend / API
- 🧰 Scripts NPM
- 🐛 Dépannage (FAQ)
- 🤝 Contribution
- 📄 Licence

## ✨ Aperçu

O'Ypunu Mobile permet d'accéder au dictionnaire collaboratif, aux communautés linguistiques et à la messagerie en mobilité, avec une UI réactive et un design cohérent avec le web.

### Points forts

- Expo (dev server, OTA, build cloud)
- React Native 0.79, React 19, Expo Router 5
- NativeWind (Tailwind RN) pour le style
- React Query pour la gestion des données
- Navigation tabs + écrans dédiés (dictionnaire, communautés, messages, profil)

## 🧱 Stack & dépendances clés

- expo 53.x, expo-router ~5.x
- react 19, react-native 0.79.x
- nativewind 4.x
- @react-navigation/\* 7.x (tabs)
- @tanstack/react-query 5.x
- react-native-gesture-handler, react-native-screens, react-native-safe-area-context
- react-native-svg, @expo/vector-icons

## ⚙️ Prérequis

- Node.js >= 18
- npm >= 9
- Expo CLI (fourni via `npx`)
- Android Studio / Xcode (si build local natif) – facultatif avec Expo Go

## 📦 Installation & démarrage

```bash
# 1) Installer les dépendances
npm install

# 2) Lancer l'application (dev)
npm start

# 3) Ouvrir sur un device
# - Expo Go sur Android/iOS (scanner le QR Code)
# - émulateur Android: npm run android
# - simulateur iOS: npm run ios (macOS requis)
```

Conseil: redémarrer avec cache propre en cas d'issues Metro/Babel:

```bash
expo start -c
```

## 🧪 Vérifications rapides

```bash
# Vérifier l’environnement Expo et corriger si possible
expo doctor --fix-dependencies

# Vérifier TypeScript (sans émettre)
npx tsc --noEmit
```

## 🗂️ Structure du projet

```
oypunu-mobile/
├── app/                    # Expo Router (layouts, tabs, écrans)
├── src/                    # Code source (screens, design-system, data, types)
├── assets/                 # Images et médias
├── babel.config.js         # Config Babel (worklets)
├── tsconfig.json           # TypeScript (moduleResolution: bundler)
├── package.json            # Scripts et dépendances
└── README.md               # Ce fichier
```

## 🔗 Intégration Backend / API

- L’API NestJS (voir `oypunu-backend`) expose les endpoints consommés par l’app mobile.
- Paramétrez votre base URL d’API via une couche de configuration (ex: variable d’environnement Expo ou module de config centralisé) selon vos besoins.

Exemple (pseudo-code):

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";
```

## 🧰 Scripts NPM

```bash
npm start        # Expo start (dev server)
npm run android  # Démarrer sur Android (émulateur/appareil)
npm run ios      # Démarrer sur iOS (simulateur)
npm run web      # Mode web (Expo)
npm test         # Tests Jest
```

## 🐛 Dépannage (FAQ)

1. Alerte Reanimated / Worklets

- Message: “Use `react-native-worklets/plugin` instead of `react-native-reanimated/plugin`”.
- Solution: le fichier `babel.config.js` utilise déjà `react-native-worklets/plugin`. Si l’alerte persiste, lancez `expo start -c` pour vider le cache. Assurez-vous qu’aucun autre fichier Babel dans le monorepo ne référence l’ancien plugin.

2. Erreur TypeScript `customConditions`

- Cause: Expo active `customConditions`; il faut `moduleResolution: "bundler"`.
- Status: corrigé dans `tsconfig.json`.

3. Build bloqué / erreurs Metro

- Essayez de purger le cache: `expo start -c`.
- Réinstallez les dépendances si besoin: `rm -rf node_modules && npm install` (ou suppression via l’explorateur sur Windows).

## 🤝 Contribution

Suivre le même workflow que les apps web/backend:

1. Fork du projet
2. Branche: `feature/ma-fonctionnalite`
3. Commits clairs: `feat(mobile): ...`
4. Pull Request avec description et captures si possible

Qualité code: ESLint, TypeScript strict, tests unitaires au besoin.

## 📄 Licence

Sous licence **MIT**. Voir le fichier `LICENSE` à la racine du monorepo.

---

Made with ❤️ pour la communauté O'Ypunu
