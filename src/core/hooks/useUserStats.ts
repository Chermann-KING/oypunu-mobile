/**
 * @fileoverview User Stats Hook
 * Provides convenient access to user statistics
 */

import { useCallback, useState } from 'react';
import { useUserStatsService } from '../providers/ServiceProvider';
import { UserStats, ContributionStats } from '../interfaces/IUserStatsService';

/**
 * Hook for managing user statistics
 */
export const useUserStats = () => {
  const userStatsService = useUserStatsService();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [contributionStats, setContributionStats] = useState<ContributionStats | null>(null);
  const [isLoadingUserStats, setIsLoadingUserStats] = useState(false);
  const [isLoadingContributionStats, setIsLoadingContributionStats] = useState(false);
  const [userStatsError, setUserStatsError] = useState<string | null>(null);
  const [contributionStatsError, setContributionStatsError] = useState<string | null>(null);

  /**
   * Load user statistics
   */
  const loadUserStats = useCallback(async () => {
    setIsLoadingUserStats(true);
    setUserStatsError(null);
    
    try {
      const stats = await userStatsService.getUserStats();
      setUserStats(stats);
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement des statistiques';
      setUserStatsError(errorMessage);
      console.error('Error loading user stats:', error);
      return null;
    } finally {
      setIsLoadingUserStats(false);
    }
  }, [userStatsService]);

  /**
   * Load contribution statistics
   */
  const loadContributionStats = useCallback(async () => {
    setIsLoadingContributionStats(true);
    setContributionStatsError(null);
    
    try {
      const stats = await userStatsService.getContributionStats();
      setContributionStats(stats);
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement des contributions';
      setContributionStatsError(errorMessage);
      console.error('Error loading contribution stats:', error);
      return null;
    } finally {
      setIsLoadingContributionStats(false);
    }
  }, [userStatsService]);

  /**
   * Clear stats cache
   */
  const clearStatsCache = useCallback(async () => {
    try {
      await userStatsService.clearCache();
      setUserStats(null);
      setContributionStats(null);
    } catch (error) {
      console.error('Error clearing stats cache:', error);
    }
  }, [userStatsService]);

  /**
   * Refresh all stats
   */
  const refreshStats = useCallback(async () => {
    await clearStatsCache();
    const [userStatsData, contributionStatsData] = await Promise.allSettled([
      loadUserStats(),
      loadContributionStats()
    ]);
    
    return {
      userStats: userStatsData.status === 'fulfilled' ? userStatsData.value : null,
      contributionStats: contributionStatsData.status === 'fulfilled' ? contributionStatsData.value : null
    };
  }, [clearStatsCache, loadUserStats, loadContributionStats]);

  return {
    // State
    userStats,
    contributionStats,
    isLoadingUserStats,
    isLoadingContributionStats,
    userStatsError,
    contributionStatsError,
    
    // Operations
    loadUserStats,
    loadContributionStats,
    clearStatsCache,
    refreshStats,
  };
};