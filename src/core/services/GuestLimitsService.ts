/**
 * @fileoverview Guest Limits Service for Mobile
 * Adapté du système web pour gérer les limites quotidiennes des invités
 * Suit les principes SOLID - Single Responsibility pour la gestion des limites invités
 */

import { IStorageService } from '../interfaces/IStorageService';
import { ICacheService } from '../interfaces/ICacheService';

/**
 * Configuration des limites pour invités
 * Basée sur la logique métier du frontend web
 */
export interface GuestExperienceConfig {
  maxWordsPerDay: number;
  maxCommunitiesPerDay: number;
  showBadgeAfter: number;    // Après combien de consultations montrer le badge
  showCtaAfter: number;      // Après combien de consultations montrer CTA subtil
}

/**
 * Statistiques quotidiennes invité
 */
export interface GuestDailyStats {
  wordsViewed: number;
  communitiesViewed: number;
  lastResetDate: string;
  firstVisitToday: boolean;
  showBadge: boolean;
  showCta: boolean;
}

/**
 * Contexte de conversion pour personnaliser les messages
 */
export type ConversionContext = 
  | 'word_limit_reached' 
  | 'community_limit_reached'
  | 'favorite_attempt' 
  | 'contribution_attempt'
  | 'profile_visit'
  | 'daily_encouragement';

/**
 * Action invité pour tracking
 */
export type GuestAction = 
  | 'word_view' 
  | 'community_view' 
  | 'favorite_attempt' 
  | 'signup_shown' 
  | 'signup_clicked';

/**
 * Service de gestion de l'expérience invité mobile
 * Adapté du système web avec optimisations mobile
 */
export class GuestLimitsService {
  private readonly STORAGE_KEY = 'guest_daily_stats';
  private readonly CACHE_TTL = 3600; // 1 heure en cache
  
  private readonly config: GuestExperienceConfig = {
    maxWordsPerDay: 3,
    maxCommunitiesPerDay: 2,
    showBadgeAfter: 1,  // Dès la première consultation
    showCtaAfter: 2,    // À partir de la deuxième consultation
  };

  constructor(
    private storageService: IStorageService,
    private cacheService: ICacheService
  ) {}

  /**
   * Récupère les statistiques quotidiennes actuelles
   */
  async getDailyStats(): Promise<GuestDailyStats> {
    const cacheKey = 'guest-daily-stats';
    const cached = await this.cacheService.get<GuestDailyStats>(cacheKey);
    if (cached && this.isSameDay(cached.lastResetDate)) {
      return cached;
    }

    try {
      const storedStats = await this.storageService.getItem<GuestDailyStats>(this.STORAGE_KEY);
      
      if (storedStats && this.isSameDay(storedStats.lastResetDate)) {
        // Stats du jour valides
        this.cacheService.set(cacheKey, storedStats, this.CACHE_TTL);
        return storedStats;
      }
      
      // Nouveau jour ou première visite
      const newStats: GuestDailyStats = {
        wordsViewed: 0,
        communitiesViewed: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        firstVisitToday: true,
        showBadge: false,
        showCta: false,
      };
      
      await this.storageService.setItem(this.STORAGE_KEY, newStats);
      this.cacheService.set(cacheKey, newStats, this.CACHE_TTL);
      
      return newStats;
    } catch (error) {
      console.error('[GuestLimitsService] Error getting daily stats:', error);
      // Fallback stats
      return {
        wordsViewed: 0,
        communitiesViewed: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        firstVisitToday: true,
        showBadge: false,
        showCta: false,
      };
    }
  }

  /**
   * Vérifie si l'invité peut consulter un mot
   */
  async canViewWord(): Promise<boolean> {
    const stats = await this.getDailyStats();
    return stats.wordsViewed < this.config.maxWordsPerDay;
  }

  /**
   * Enregistre la consultation d'un mot
   * Retourne true si la consultation a été enregistrée, false si limite atteinte
   */
  async recordWordView(): Promise<boolean> {
    const stats = await this.getDailyStats();
    
    if (stats.wordsViewed >= this.config.maxWordsPerDay) {
      return false;
    }
    
    const newStats: GuestDailyStats = {
      ...stats,
      wordsViewed: stats.wordsViewed + 1,
      firstVisitToday: false,
      showBadge: stats.wordsViewed + 1 >= this.config.showBadgeAfter,
      showCta: stats.wordsViewed + 1 >= this.config.showCtaAfter,
    };
    
    await this.saveStats(newStats);
    return true;
  }

  /**
   * Vérifie si l'invité peut consulter une communauté
   */
  async canViewCommunity(): Promise<boolean> {
    const stats = await this.getDailyStats();
    return stats.communitiesViewed < this.config.maxCommunitiesPerDay;
  }

  /**
   * Enregistre la consultation d'une communauté
   */
  async recordCommunityView(): Promise<boolean> {
    const stats = await this.getDailyStats();
    
    if (stats.communitiesViewed >= this.config.maxCommunitiesPerDay) {
      return false;
    }
    
    const newStats: GuestDailyStats = {
      ...stats,
      communitiesViewed: stats.communitiesViewed + 1,
      firstVisitToday: false,
      showBadge: true, // Toujours montrer le badge après consultation communauté
      showCta: true,   // Toujours montrer CTA après consultation communauté
    };
    
    await this.saveStats(newStats);
    return true;
  }

  /**
   * Récupère les quotas restants
   */
  async getRemainingQuotas(): Promise<{
    wordsRemaining: number;
    communitiesRemaining: number;
    percentageUsed: number;
  }> {
    const stats = await this.getDailyStats();
    
    const wordsRemaining = Math.max(0, this.config.maxWordsPerDay - stats.wordsViewed);
    const communitiesRemaining = Math.max(0, this.config.maxCommunitiesPerDay - stats.communitiesViewed);
    
    const totalUsed = stats.wordsViewed + stats.communitiesViewed;
    const totalAvailable = this.config.maxWordsPerDay + this.config.maxCommunitiesPerDay;
    const percentageUsed = Math.round((totalUsed / totalAvailable) * 100);
    
    return {
      wordsRemaining,
      communitiesRemaining,
      percentageUsed,
    };
  }

  /**
   * Détermine si le badge des limites doit être affiché
   */
  async shouldShowBadge(): Promise<boolean> {
    const stats = await this.getDailyStats();
    return stats.showBadge;
  }

  /**
   * Détermine si un CTA de conversion doit être affiché
   */
  async shouldShowConversionCTA(): Promise<boolean> {
    const stats = await this.getDailyStats();
    return stats.showCta;
  }

  /**
   * Génère un message de conversion contextualisé
   */
  async getConversionMessage(context: ConversionContext): Promise<string> {
    const quotas = await this.getRemainingQuotas();
    
    switch (context) {
      case 'word_limit_reached':
        return 'Limite quotidienne atteinte ! Créez un compte gratuit pour un accès illimité aux mots.';
      
      case 'community_limit_reached':
        return 'Plus de communautés disponibles aujourd\'hui. Inscrivez-vous pour explorer toutes les communautés !';
      
      case 'favorite_attempt':
        return 'Connectez-vous pour sauvegarder vos mots favoris et les retrouver partout !';
      
      case 'contribution_attempt':
        return 'Rejoignez la communauté pour contribuer au dictionnaire et gagner des points !';
      
      case 'profile_visit':
        return 'Créez votre profil pour suivre vos progrès et débloquer toutes les fonctionnalités.';
      
      case 'daily_encouragement':
        if (quotas.wordsRemaining > 0) {
          return `Plus que ${quotas.wordsRemaining} mot${quotas.wordsRemaining > 1 ? 's' : ''} gratuit${quotas.wordsRemaining > 1 ? 's' : ''} aujourd'hui !`;
        } else {
          return 'Revenez demain pour 3 nouveaux mots gratuits, ou créez un compte pour un accès illimité !';
        }
      
      default:
        return 'Créez un compte gratuit pour débloquer toutes les fonctionnalités d\'O\'Ypunu !';
    }
  }

  /**
   * Enregistre une action invité pour analytics
   */
  async trackGuestAction(action: GuestAction, context?: string): Promise<void> {
    try {
      console.log(`[GuestLimitsService] Action: ${action}${context ? ` (${context})` : ''}`);
      // Ici on pourrait envoyer vers un service d'analytics
    } catch (error) {
      console.error('[GuestLimitsService] Error tracking action:', error);
    }
  }

  /**
   * Réinitialise les stats pour tests (ne pas utiliser en production)
   */
  async resetDailyStats(): Promise<void> {
    if (__DEV__) {
      await this.storageService.removeItem(this.STORAGE_KEY);
      this.cacheService.delete('guest-daily-stats');
    }
  }

  /**
   * Méthodes privées
   */
  private async saveStats(stats: GuestDailyStats): Promise<void> {
    await this.storageService.setItem(this.STORAGE_KEY, stats);
    this.cacheService.set('guest-daily-stats', stats, this.CACHE_TTL);
  }

  private isSameDay(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): GuestExperienceConfig {
    return { ...this.config };
  }
}