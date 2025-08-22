/**
 * @fileoverview Messaging Service Interface
 * Follows SOLID principles - Single Responsibility for real-time messaging
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'word_share' | 'system';
  timestamp: string;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: string;
  replyToId?: string; // For message replies
  metadata?: {
    wordId?: string; // For word_share messages
    imageUrl?: string; // For image messages
    audioUrl?: string; // For audio messages
    audioDuration?: number; // For audio messages in seconds
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group conversations
  avatar?: string; // For group conversations
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isMuted: boolean;
}

export interface ConversationParticipant {
  userId: string;
  username: string;
  avatar?: string;
  role?: 'member' | 'admin'; // For group conversations
  joinedAt: string;
  lastSeenAt?: string;
  isOnline: boolean;
  isTyping: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  participants: {
    userId: string;
    status: 'sent' | 'delivered' | 'read';
    timestamp: string;
  }[];
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

/**
 * Messaging service interface
 * Handles real-time messaging and conversations
 */
export interface IMessagingService {
  // Conversations management

  /**
   * Get all user's conversations
   */
  getConversations(): Promise<Conversation[]>;

  /**
   * Get conversation by ID
   */
  getConversationById(id: string): Promise<Conversation>;

  /**
   * Create direct conversation with another user
   */
  createDirectConversation(userId: string): Promise<Conversation>;

  /**
   * Create group conversation
   */
  createGroupConversation(data: {
    name: string;
    participantIds: string[];
    avatar?: string;
  }): Promise<Conversation>;

  /**
   * Update conversation settings
   */
  updateConversation(id: string, data: Partial<Pick<Conversation, 'name' | 'avatar'>>): Promise<Conversation>;

  /**
   * Archive/unarchive conversation
   */
  toggleConversationArchive(id: string): Promise<{ isArchived: boolean }>;

  /**
   * Mute/unmute conversation
   */
  toggleConversationMute(id: string): Promise<{ isMuted: boolean }>;

  /**
   * Leave conversation (group only)
   */
  leaveConversation(id: string): Promise<void>;

  /**
   * Delete conversation
   */
  deleteConversation(id: string): Promise<void>;

  // Messages management

  /**
   * Get messages from conversation
   */
  getMessages(conversationId: string, limit?: number, before?: string): Promise<{
    messages: Message[];
    hasMore: boolean;
  }>;

  /**
   * Send text message
   */
  sendMessage(data: {
    conversationId: string;
    content: string;
    replyToId?: string;
  }): Promise<Message>;

  /**
   * Send image message
   */
  sendImageMessage(data: {
    conversationId: string;
    imageFile: File;
    caption?: string;
  }): Promise<Message>;

  /**
   * Send audio message
   */
  sendAudioMessage(data: {
    conversationId: string;
    audioFile: File;
    duration: number;
  }): Promise<Message>;

  /**
   * Share word in conversation
   */
  shareWord(data: {
    conversationId: string;
    wordId: string;
    message?: string;
  }): Promise<Message>;

  /**
   * Edit message (only text messages, within time limit)
   */
  editMessage(messageId: string, newContent: string): Promise<Message>;

  /**
   * Delete message
   */
  deleteMessage(messageId: string): Promise<void>;

  /**
   * Mark messages as read
   */
  markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<void>;

  /**
   * Mark all messages in conversation as read
   */
  markConversationAsRead(conversationId: string): Promise<void>;

  // Participants management (group conversations)

  /**
   * Add participants to group conversation
   */
  addParticipants(conversationId: string, userIds: string[]): Promise<void>;

  /**
   * Remove participant from group conversation
   */
  removeParticipant(conversationId: string, userId: string): Promise<void>;

  /**
   * Update participant role in group conversation
   */
  updateParticipantRole(conversationId: string, userId: string, role: 'member' | 'admin'): Promise<void>;

  // Real-time features

  /**
   * Start typing indicator
   */
  startTyping(conversationId: string): void;

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void;

  /**
   * Subscribe to typing indicators
   */
  onTypingStatusChanged(callback: (indicator: TypingIndicator) => void): () => void;

  /**
   * Subscribe to online status updates
   */
  onOnlineStatusChanged(callback: (status: OnlineStatus) => void): () => void;

  /**
   * Subscribe to new messages
   */
  onMessageReceived(callback: (message: Message) => void): () => void;

  /**
   * Subscribe to message delivery status
   */
  onMessageDeliveryStatusChanged(callback: (status: MessageDeliveryStatus) => void): () => void;

  /**
   * Subscribe to conversation updates
   */
  onConversationUpdated(callback: (conversation: Conversation) => void): () => void;

  // Search and filters

  /**
   * Search messages across all conversations
   */
  searchMessages(query: string, conversationId?: string): Promise<{
    messages: Message[];
    conversations: Conversation[];
  }>;

  /**
   * Search users to start conversation with
   */
  searchUsers(query: string): Promise<{
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
  }[]>;

  // Settings and preferences

  /**
   * Get messaging preferences
   */
  getMessagingPreferences(): Promise<{
    allowMessagesFrom: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    typingIndicators: boolean;
    onlineStatus: boolean;
    soundNotifications: boolean;
    vibrationNotifications: boolean;
  }>;

  /**
   * Update messaging preferences
   */
  updateMessagingPreferences(preferences: {
    allowMessagesFrom?: 'everyone' | 'contacts' | 'nobody';
    readReceipts?: boolean;
    typingIndicators?: boolean;
    onlineStatus?: boolean;
    soundNotifications?: boolean;
    vibrationNotifications?: boolean;
  }): Promise<void>;

  // Connection management

  /**
   * Connect to real-time messaging
   */
  connect(): Promise<void>;

  /**
   * Disconnect from real-time messaging
   */
  disconnect(): void;

  /**
   * Check connection status
   */
  isConnected(): boolean;

  /**
   * Reconnect if disconnected
   */
  reconnect(): Promise<void>;
}