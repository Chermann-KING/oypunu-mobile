/**
 * @fileoverview User Statistics Service Implementation
 * Handles all user statistics-related API operations following SOLID principles
 */

import { IApiService } from '../interfaces/IApiService';
import { ICacheService } from '../interfaces/ICacheService';
import { IUserStatsService, UserStats, ContributionStats } from '../interfaces/IUserStatsService';

/**
 * User Statistics Service
 * Handles user-specific statistics operations
 */
export class UserStatsService implements IUserStatsService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private apiService: IApiService,
    private cacheService: ICacheService
  ) {}

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const cacheKey = 'user-stats';
    const cached = await this.cacheService.get<UserStats>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.apiService.get<UserStats>('/users/profile/stats');
      const stats = response.data;

      // Cache stats for 5 minutes
      await this.cacheService.set(cacheKey, stats, this.CACHE_TTL);

      return stats;
    } catch (error) {
      console.error('Error loading user stats:', error);
      throw error;
    }
  }

  /**
   * Get contribution statistics
   */
  async getContributionStats(): Promise<ContributionStats> {
    const cacheKey = 'user-contribution-stats';
    const cached = await this.cacheService.get<ContributionStats>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.apiService.get<{
        totalWordsAdded: number;
        totalCommunityPosts: number;
        favoriteWordsCount: number;
        joinDate: Date;
      }>('/users/profile/stats');

      // Transform backend stats to contribution format
      const contributionStats = {
        wordsAdded: response.data.totalWordsAdded || 0,
        wordsApproved: response.data.totalWordsAdded || 0, // Assuming all added words are approved
        wordsPending: 0, // Not available from this endpoint
        wordsRejected: 0, // Not available from this endpoint
      };

      // Cache stats for 5 minutes
      await this.cacheService.set(cacheKey, contributionStats, this.CACHE_TTL);

      return contributionStats;
    } catch (error) {
      console.error('Error loading contribution stats:', error);
      throw error;
    }
  }

  /**
   * Clear user stats cache
   */
  async clearCache(): Promise<void> {
    this.cacheService.delete('user-stats');
    this.cacheService.delete('user-contribution-stats');
  }
}