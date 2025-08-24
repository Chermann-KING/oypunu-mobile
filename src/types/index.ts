export interface Word {
  id: string;
  word: string;
  language: string;
  pronunciation: string;
  definition: string;
  category: string;
  author: string;
  timeAgo: string;
  isFavorite: boolean;
}

export interface DetailedWord extends Word {
  // Informations supplémentaires disponibles dans les détails
  etymology?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      examples: string[];
    }>;
  }>;
  languageInfo?: {
    id: string;
    name: string;
    nativeName?: string;
    flagEmoji?: string;
    iso639_1?: string;
    iso639_3?: string;
  };
  categoryInfo?: {
    id: string;
    name: string;
  };
  authorInfo?: {
    id: string;
    username?: string;
    name?: string;
  };
  audioFiles?: Array<{
    url: string;
    type: string;
    language?: string;
  }>;
  // Nouvelles informations détaillées
  synonyms?: Array<{
    id: string;
    word: string;
    language: string;
  }>;
  antonyms?: Array<{
    id: string;
    word: string;
    language: string;
  }>;
  translations?: Array<{
    id: string;
    word: string;
    language: string;
    languageName: string;
  }>;
  examples?: string[]; // Exemples regroupés de toutes les définitions
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}

export interface CommunityActivity {
  id: string;
  type: 'word_added' | 'translation' | 'comment';
  user: string;
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar: string;
  role: 'user' | 'contributor' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  wordsAdded: number;
  favorites: number;
  contributions: number;
  createdAt: string;
  updatedAt: string;
}