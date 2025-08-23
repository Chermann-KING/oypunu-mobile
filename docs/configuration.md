# 📱 Configuration O'Ypunu Mobile

## 🌐 Configuration des environnements

L'app mobile peut être configurée pour différents environnements via le fichier `.env`.

### ⚙️ Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|------------------|
| `EXPO_PUBLIC_API_URL` | URL de l'API backend | `https://oypunu-production.up.railway.app/api` |
| `EXPO_PUBLIC_WEBSOCKET_URL` | URL WebSocket | `https://oypunu-production.up.railway.app` |
| `EXPO_PUBLIC_ENABLE_LOGGING` | Activer les logs détaillés | `true` |
| `EXPO_PUBLIC_TIMEOUT` | Timeout des requêtes (ms) | `10000` |

### 🏠 Développement local

Pour tester avec un backend local :

1. **Trouvez votre IP locale** :
   ```bash
   ip route get 1 | awk '{print $7}' | head -1
   ```

2. **Modifiez le `.env`** :
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api
   EXPO_PUBLIC_WEBSOCKET_URL=http://YOUR_IP:3000
   ```

3. **Redémarrez Expo** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npx expo start
   ```

### ☁️ Production Railway (recommandé pour mobile)

Configuration par défaut optimisée pour les tests mobiles :

```env
EXPO_PUBLIC_API_URL=https://oypunu-production.up.railway.app/api
EXPO_PUBLIC_WEBSOCKET_URL=https://oypunu-production.up.railway.app
```

### 🔧 Debug de configuration

L'app affiche automatiquement la configuration au démarrage dans les logs :

```
🔧 [Config] Environment Configuration:
📍 API URL: https://oypunu-production.up.railway.app/api
🔌 WebSocket URL: https://oypunu-production.up.railway.app
🏷️  Environment: DEVELOPMENT
📊 Logging: ENABLED
⏱️  Timeout: 10000ms
```

### ⚠️ Notes importantes

- **Variables Expo** : Les variables `EXPO_PUBLIC_*` ne sont lues qu'au démarrage
- **Mobile vs localhost** : `localhost` ne fonctionne pas sur mobile (utilisez l'IP locale)
- **HTTPS requis** : Pour la production, utilisez toujours HTTPS
- **Redémarrage requis** : Toute modification des variables `.env` nécessite un redémarrage d'Expo

### 🎯 Configuration actuelle

La configuration actuelle utilise **l'API Railway** pour une compatibilité maximale avec les tests mobiles.

Pour basculer entre les configurations, modifiez simplement le fichier `.env` et redémarrez Expo.