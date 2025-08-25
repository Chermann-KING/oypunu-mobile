/**
 * @fileoverview User Statistics Service Interface
 * Follows Interface Segregation Principle - focused on user statistics operations
 */

/**
 * User stats interface
 */
export interface UserStats {
  totalWordsAdded: number;
  totalCommunityPosts: number;
  favoriteWordsCount: number;
  joinDate: Date;
}

/**
 * Contribution statistics interface
 */
export interface ContributionStats {
  wordsAdded: number;
  wordsApproved: number;
  wordsPending: number;
  wordsRejected: number;
}

/**
 * User Statistics Service Interface
 * Handles user-specific statistics operations
 */
export interface IUserStatsService {
  /**
   * Get user statistics
   */
  getUserStats(): Promise<UserStats>;

  /**
   * Get contribution statistics
   */
  getContributionStats(): Promise<ContributionStats>;

  /**
   * Clear user stats cache
   */
  clearCache(): Promise<void>;
}