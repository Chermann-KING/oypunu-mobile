# 🏗️ O'Ypunu Mobile - Guide Architecture SOLID

## 📋 Vue d'ensemble

Ce document est le guide de référence pour l'architecture SOLID de l'application mobile O'Ypunu. Il doit être consulté à chaque étape de développement et mis à jour après chaque phase validée.

---

## 🎯 Principes SOLID Appliqués

### **S** - Single Responsibility Principle (SRP)
> Chaque classe/module doit avoir une seule raison de changer

**Applications dans le projet :**
- Séparation stricte des services (API, cache, storage)
- Composants avec responsabilités uniques
- Stores Zustand spécialisés par domaine

### **O** - Open/Closed Principle (OCP)
> Ouvert à l'extension, fermé à la modification

**Applications dans le projet :**
- Interfaces pour tous les services
- Factory patterns pour les composants
- Plugin system pour les fonctionnalités

### **L** - Liskov Substitution Principle (LSP)
> Les objets dérivés doivent pouvoir remplacer leurs objets de base

**Applications dans le projet :**
- Implémentations interchangeables des services
- Interfaces cohérentes pour tous les adapters
- Polymorphisme respecté dans les composants

### **I** - Interface Segregation Principle (ISP)
> Plusieurs interfaces spécifiques valent mieux qu'une interface générale

**Applications dans le projet :**
- Interfaces granulaires par fonctionnalité
- Séparation des contrats API
- Props spécifiques par composant

### **D** - Dependency Inversion Principle (DIP)
> Dépendre d'abstractions, pas de concrets

**Applications dans le projet :**
- Injection de dépendances via Context
- Services abstraits injectés
- Configuration externalisée

---

## 🏗️ Architecture Générale

```
src/
├── 📁 core/                    # Couche infrastructure SOLID
│   ├── interfaces/             # Contrats abstraits (ISP + DIP)
│   ├── services/              # Implémentations concrètes (SRP)
│   ├── adapters/              # Adaptateurs externes (OCP)
│   └── providers/             # Injection de dépendances (DIP)
├── 📁 features/               # Modules métier (SRP)
│   ├── auth/                  # Authentification
│   ├── dictionary/            # Dictionnaire
│   ├── favorites/             # Gestion des favoris
│   ├── community/             # Communautés
│   ├── messaging/             # Messagerie temps réel
│   └── profile/               # Profil utilisateur
├── 📁 shared/                 # Composants réutilisables (OCP)
│   ├── components/            # UI génériques
│   ├── hooks/                 # Logic partagée
│   └── utils/                 # Utilitaires
└── 📁 design-system/          # Design system isolé (SRP)
```

---

## 📊 Statut de Progression

### ✅ **PHASE 0 - État Initial**
**Date :** 2025-01-22
**Statut :** Analysé

**Respect SOLID actuel :**
- 🔴 **SRP** : Violé (composants avec multiples responsabilités)
- 🔴 **OCP** : Non appliqué (pas d'interfaces)
- 🔴 **LSP** : Non applicable (pas d'héritage)
- 🔴 **ISP** : Non appliqué (pas d'interfaces définies)
- 🔴 **DIP** : Violé (dépendances hardcodées, données mockées)

**Points à corriger :**
- Services API inexistants
- Pas d'injection de dépendances
- Composants monolithiques
- Données mockées dans les composants

---

### ⏳ **PHASE 1 - Fondations** 
**Date prévue :** 2025-01-29
**Statut :** À faire

**Objectifs SOLID :**
- ✅ **SRP** : Services spécialisés (API, Storage, Cache)
- ✅ **OCP** : Interfaces pour tous les services
- ✅ **LSP** : Implémentations interchangeables
- ✅ **ISP** : Contrats granulaires
- ✅ **DIP** : Injection via Context providers

**Livrables attendus :**
- [ ] Interface IApiService + implémentations
- [ ] Interface IStorageService + implémentations  
- [ ] Interface ICacheService + implémentations
- [ ] Context providers pour injection
- [ ] Services d'authentification séparés

---

### ⏳ **PHASE 2 - Dictionnaire Core**
**Date prévue :** 2025-02-12
**Statut :** À faire

**Objectifs SOLID :**
- [ ] Services dictionary respectant SRP
- [ ] Interfaces IDictionaryService + IFavoritesService
- [ ] Module favorites indépendant avec SRP
- [ ] Composants single-purpose
- [ ] Hooks réutilisables (OCP)

**Livrables attendus :**
- [ ] Service favoris avec interface IFavoritesService
- [ ] Hook useFavorites pour la logique réutilisable
- [ ] Store favorites séparé (Zustand)
- [ ] Composants favoris single-purpose
- [ ] Synchronisation favorites avec API backend

---

### ⏳ **PHASE 3 - Social & Communautés** 
**Date prévue :** 2025-02-26
**Statut :** À faire

---

### ⏳ **PHASE 4 - Profil & Administration**
**Date prévue :** 2025-03-12
**Statut :** À faire

---

### ⏳ **PHASE 5 - Fonctionnalités Avancées**
**Date prévue :** 2025-03-26
**Statut :** À faire

---

### ⏳ **PHASE 6 - Production & Testing**
**Date prévue :** 2025-04-09
**Statut :** À faire

---

## 🔧 Standards d'Implémentation SOLID

### 1. Services (SRP + DIP)

```typescript
// ❌ MAUVAIS - Multiple responsabilités
class UserService {
  login() { /* auth logic */ }
  saveToCache() { /* cache logic */ }
  updateProfile() { /* profile logic */ }
  sendEmail() { /* email logic */ }
}

// ✅ BON - Single responsibility + Interface
interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
}

class AuthService implements IAuthService {
  constructor(
    private apiClient: IApiClient,
    private storageService: IStorageService
  ) {}
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Seule responsabilité : authentification
  }
}
```

### 2. Components (SRP + OCP)

```typescript
// ❌ MAUVAIS - Multiple responsabilités
const DictionaryScreen = () => {
  // Logic API + UI + State + Navigation
  const [words, setWords] = useState([]);
  const fetchWords = async () => { /* API call */ };
  const handleNavigation = () => { /* Navigation */ };
  
  return <View>{/* Complex UI */}</View>;
};

// ✅ BON - Single responsibility
interface WordListProps {
  words: Word[];
  onWordSelect: (word: Word) => void;
  onFavoriteToggle: (wordId: string) => void;
}

const WordList: React.FC<WordListProps> = ({ 
  words, 
  onWordSelect, 
  onFavoriteToggle 
}) => {
  // Seule responsabilité : afficher la liste
  return (
    <FlatList
      data={words}
      renderItem={({ item }) => (
        <WordCard 
          word={item}
          onSelect={() => onWordSelect(item)}
          onFavoriteToggle={() => onFavoriteToggle(item.id)}
        />
      )}
    />
  );
};
```

### 3. Hooks personnalisés (OCP + ISP)

```typescript
// Interface spécialisée (ISP)
interface UseWordSearchOptions {
  debounceMs?: number;
  minLength?: number;
  language?: string;
}

// Hook réutilisable (OCP)
const useWordSearch = (options: UseWordSearchOptions = {}) => {
  const dictionaryService = useDictionaryService(); // DIP
  
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  
  const search = useCallback(
    debounce(async (query: string) => {
      if (query.length < (options.minLength || 2)) return;
      
      setLoading(true);
      try {
        const words = await dictionaryService.search({
          query,
          language: options.language,
        });
        setResults(words);
      } finally {
        setLoading(false);
      }
    }, options.debounceMs || 300),
    [dictionaryService, options]
  );
  
  return { results, loading, search };
};
```

### 4. Stores Zustand (SRP)

```typescript
// ❌ MAUVAIS - Store monolithique
interface AppStore {
  user: User | null;
  words: Word[];
  communities: Community[];
  messages: Message[];
  // Trop de responsabilités
}

// ✅ BON - Stores spécialisés
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

interface DictionaryStore {
  searchResults: Word[];
  searchHistory: string[];
  search: (query: string) => Promise<void>;
  clearHistory: () => void;
}

interface FavoritesStore {
  favorites: Word[];
  favoriteIds: Set<string>;
  addFavorite: (word: Word) => Promise<void>;
  removeFavorite: (wordId: string) => Promise<void>;
  toggleFavorite: (word: Word) => Promise<void>;
  isFavorite: (wordId: string) => boolean;
}
```

---

## 📝 Checklist de Validation par Phase

### Phase 1 - Fondations ✅
- [ ] **SRP** : Chaque service a une responsabilité unique
- [ ] **OCP** : Toutes les dépendances externes ont des interfaces
- [ ] **LSP** : Les implémentations respectent leurs contrats
- [ ] **ISP** : Interfaces granulaires et spécialisées
- [ ] **DIP** : Aucune dépendance hardcodée, tout injecté

### Phase 2 - Dictionnaire & Favoris ✅
- [ ] Composants dictionary single-purpose
- [ ] Services dictionary avec interfaces IDictionaryService
- [ ] Module favorites séparé avec IFavoritesService
- [ ] Hooks réutilisables (useDictionary, useFavorites)
- [ ] Stores spécialisés (DictionaryStore + FavoritesStore)
- [ ] Synchronisation API favorites existantes
- [ ] Tests unitaires pour chaque service

---

## 🎯 Métriques SOLID

### Code Quality Gates
- **Cyclomatic Complexity** : < 10 par méthode
- **Method Length** : < 20 lignes
- **Class Responsibilities** : 1 seule par classe
- **Interface Segregation** : Max 5 méthodes par interface
- **Dependency Depth** : Max 3 niveaux

### Architecture Reviews
- Review systématique des interfaces avant implémentation
- Validation SOLID à chaque Pull Request
- Refactoring dès détection de violation

---

## 📚 Ressources et Références

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Design Patterns Utilisés
- **Factory Pattern** : Création des services
- **Observer Pattern** : Stores réactifs
- **Adapter Pattern** : Intégrations externes
- **Strategy Pattern** : Différentes implémentations

---

## 🔄 Historique des Modifications

| Date | Phase | Modifications | Validation |
|------|--------|---------------|------------|
| 2025-01-22 | Init | Création du guide initial | ✅ |
| | | | |

---

**📌 Note importante :** Ce document doit être mis à jour après chaque phase validée. Toute violation des principes SOLID détectée doit être corrigée avant de passer à la phase suivante.

**Prochaine mise à jour prévue :** Fin Phase 1 (2025-01-29)