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
  avatar: string;
  wordsAdded: number;
  favorites: number;
  contributions: number;
}