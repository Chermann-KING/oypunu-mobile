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