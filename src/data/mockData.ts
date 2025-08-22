import { Word, Message, CommunityActivity, User } from '../types';

export const mockWords: Word[] = [
  {
    id: "1",
    word: "Mbote",
    language: "Lingala", 
    pronunciation: "m-bo-te",
    definition: "Bonjour, salutation amicale en lingala",
    category: "Salutations",
    author: "KamerounLinguist",
    timeAgo: "il y a 2h",
    isFavorite: false,
  },
  {
    id: "2", 
    word: "Akwaaba",
    language: "Twi",
    pronunciation: "ak-waa-ba", 
    definition: "Bienvenue, mot d'accueil en twi (Ghana)",
    category: "Salutations",
    author: "GhanaExpert",
    timeAgo: "il y a 5h",
    isFavorite: true,
  },
  {
    id: "3",
    word: "Ubuntu",
    language: "Zulu", 
    pronunciation: "u-bun-tu",
    definition: "Philosophie africaine de l'humanité et de la solidarité",
    category: "Philosophie",
    author: "SouthAfricaWisdom", 
    timeAgo: "il y a 1j",
    isFavorite: false,
  },
  {
    id: "4",
    word: "Asante",
    language: "Swahili",
    pronunciation: "a-san-te",
    definition: "Merci, expression de gratitude en swahili",
    category: "Politesse",
    author: "SwahiliMaster",
    timeAgo: "il y a 3h",
    isFavorite: true,
  },
  {
    id: "5",
    word: "Sawubona",
    language: "Zulu",
    pronunciation: "sa-wu-bo-na",
    definition: "Bonjour, salutation respectueuse en zulu",
    category: "Salutations",
    author: "ZuluSpeaker",
    timeAgo: "il y a 6h",
    isFavorite: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    contactName: "Marie Linguiste",
    lastMessage: "Merci pour la traduction en bambara !",
    timestamp: "il y a 1h",
    unreadCount: 2,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "2",
    contactName: "Ahmed Traducteur",
    lastMessage: "Peux-tu vérifier cette définition ?",
    timestamp: "il y a 3h",
    unreadCount: 0,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "3",
    contactName: "Fatou Sénégal",
    lastMessage: "Nouveau mot en wolof ajouté",
    timestamp: "il y a 1j",
    unreadCount: 1,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
];

export const mockCommunityActivity: CommunityActivity[] = [
  {
    id: "1",
    type: "word_added",
    user: "KamerounLinguist",
    content: "a ajouté le mot 'Mbote' en Lingala",
    timestamp: "il y a 2h"
  },
  {
    id: "2",
    type: "translation",
    user: "GhanaExpert",
    content: "a traduit 'Akwaaba' en français",
    timestamp: "il y a 5h"
  },
  {
    id: "3",
    type: "comment",
    user: "SouthAfricaWisdom",
    content: "a commenté la définition d'Ubuntu",
    timestamp: "il y a 1j"
  },
];

export const mockUser: User = {
  id: "current_user",
  name: "Utilisateur O'Ypunu",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  wordsAdded: 23,
  favorites: 45,
  contributions: 67,
};