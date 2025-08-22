/**
 * @fileoverview User Service Interface
 * Follows SOLID principles - Single Responsibility for user profile management
 */

import { User } from '../../types';

export interface ContributorRequest {
  id: string;
  userId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_requested';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  motivation: string;
  languages: string[];
  expertise: string[];
  experience: string;
  availability: string;
  rejectionReason?: string;
  adminComments?: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    preferredLanguages: string[];
    notificationSettings: {
      email: boolean;
      push: boolean;
      wordApproved: boolean;
      newMessages: boolean;
      communityActivity: boolean;
    };
    privacySettings: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
      showStats: boolean;
    };
    appSettings: {
      theme: 'light' | 'dark' | 'system';
      language: string;
      defaultSearchLanguage?: string;
    };
  };
  statistics: {
    wordsAdded: number;
    wordsApproved: number;
    wordsPending: number;
    wordsRejected: number;
    favorites: number;
    contributions: number;
    communitiesJoined: number;
    messagesExchanged: number;
    joinedAt: string;
    lastActiveAt: string;
  };
}

export interface UserActivity {
  id: string;
  type: 'word_added' | 'word_approved' | 'word_rejected' | 'favorite_added' | 'community_joined' | 'message_sent';
  description: string;
  timestamp: string;
  relatedId?: string; // ID of related word, community, etc.
  metadata?: Record<string, any>;
}

/**
 * User service interface
 * Handles user profile and account management
 */
export interface IUserService {
  /**
   * Get current user's full profile
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Update user profile
   */
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Upload user avatar
   */
  uploadAvatar(imageFile: File): Promise<{ avatarUrl: string }>;

  /**
   * Delete user avatar
   */
  deleteAvatar(): Promise<void>;

  /**
   * Get user by ID (public profile)
   */
  getUserById(userId: string): Promise<Partial<UserProfile>>;

  /**
   * Search users by username or name
   */
  searchUsers(query: string, limit?: number): Promise<Partial<UserProfile>[]>;

  /**
   * Get user's activity history
   */
  getUserActivity(limit?: number): Promise<UserActivity[]>;

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<UserProfile['preferences']>;

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: UserProfile['preferences']['notificationSettings']): Promise<void>;

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: UserProfile['preferences']['privacySettings']): Promise<void>;

  /**
   * Deactivate user account
   */
  deactivateAccount(): Promise<void>;

  /**
   * Request account deletion
   */
  requestAccountDeletion(): Promise<void>;

  /**
   * Export user data (GDPR compliance)
   */
  exportUserData(): Promise<string>;

  // Contributor request management

  /**
   * Submit contributor request
   */
  submitContributorRequest(data: {
    motivation: string;
    languages: string[];
    expertise: string[];
    experience: string;
    availability: string;
  }): Promise<ContributorRequest>;

  /**
   * Get current contributor request status
   */
  getContributorRequestStatus(): Promise<ContributorRequest | null>;

  /**
   * Update contributor request (if still pending)
   */
  updateContributorRequest(data: Partial<{
    motivation: string;
    languages: string[];
    expertise: string[];
    experience: string;
    availability: string;
  }>): Promise<ContributorRequest>;

  /**
   * Cancel contributor request
   */
  cancelContributorRequest(): Promise<void>;

  // Admin-only methods

  /**
   * Get all contributor requests (ADMIN+)
   */
  getAllContributorRequests(status?: ContributorRequest['status']): Promise<ContributorRequest[]>;

  /**
   * Review contributor request (ADMIN+)
   */
  reviewContributorRequest(requestId: string, action: 'approve' | 'reject' | 'request_more_info', comments?: string): Promise<void>;

  /**
   * Update user role (ADMIN+)
   */
  updateUserRole(userId: string, role: User['role']): Promise<void>;

  /**
   * Suspend/unsuspend user (ADMIN+)
   */
  toggleUserSuspension(userId: string, suspend: boolean, reason?: string): Promise<void>;

  /**
   * Get user management stats (ADMIN+)
   */
  getUserManagementStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    contributors: number;
    pendingRequests: number;
    suspendedUsers: number;
    usersByRole: Record<User['role'], number>;
    recentRegistrations: UserProfile[];
  }>;
}