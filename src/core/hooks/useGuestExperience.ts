/**
 * @fileoverview Guest Experience Hooks
 * Hooks pour la gestion de l'expérience utilisateur invité
 * Adaptés du système web avec optimisations mobile
 */

import { useCallback, useState, useEffect } from 'react';
import { useServices } from '../providers/ServiceProvider';
import { 
  GuestLimitsService, 
  GuestDailyStats, 
  ConversionContext, 
  GuestAction 
} from '../services/GuestLimitsService';

/**
 * Hook principal pour la gestion de l'expérience invité
 * Fournit toutes les fonctionnalités de gestion des limites
 */
export const useGuestExperience = () => {
  const { storageService, cacheService } = useServices();
  const [guestLimitsService] = useState(() => new GuestLimitsService(storageService, cacheService));
  
  const [dailyStats, setDailyStats] = useState<GuestDailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Charge les statistiques quotidiennes
   */
  const loadDailyStats = useCallback(async () => {
    try {
      const stats = await guestLimitsService.getDailyStats();
      setDailyStats(stats);
      return stats;
    } catch (error) {
      console.error('[useGuestExperience] Error loading daily stats:', error);
      return null;
    }
  }, [guestLimitsService]);

  /**
   * Initialise les données au montage
   */
  useEffect(() => {
    loadDailyStats();
  }, [loadDailyStats]);

  /**
   * Vérifie si l'invité peut consulter un mot
   */
  const canViewWord = useCallback(async (): Promise<boolean> => {
    return await guestLimitsService.canViewWord();
  }, [guestLimitsService]);

  /**
   * Enregistre la consultation d'un mot
   */
  const recordWordView = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await guestLimitsService.recordWordView();
      if (success) {
        await loadDailyStats(); // Refresh stats
        await guestLimitsService.trackGuestAction('word_view');
      }
      return success;
    } catch (error) {
      console.error('[useGuestExperience] Error recording word view:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [guestLimitsService, loadDailyStats]);

  /**
   * Vérifie si l'invité peut consulter une communauté
   */
  const canViewCommunity = useCallback(async (): Promise<boolean> => {
    return await guestLimitsService.canViewCommunity();
  }, [guestLimitsService]);

  /**
   * Enregistre la consultation d'une communauté
   */
  const recordCommunityView = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await guestLimitsService.recordCommunityView();
      if (success) {
        await loadDailyStats(); // Refresh stats
        await guestLimitsService.trackGuestAction('community_view');
      }
      return success;
    } catch (error) {
      console.error('[useGuestExperience] Error recording community view:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [guestLimitsService, loadDailyStats]);

  /**
   * Récupère les quotas restants
   */
  const getRemainingQuotas = useCallback(async () => {
    try {
      return await guestLimitsService.getRemainingQuotas();
    } catch (error) {
      console.error('[useGuestExperience] Error getting quotas:', error);
      return {
        wordsRemaining: 0,
        communitiesRemaining: 0,
        percentageUsed: 100,
      };
    }
  }, [guestLimitsService]);

  /**
   * Détermine si le badge des limites doit être affiché
   */
  const shouldShowBadge = useCallback(async (): Promise<boolean> => {
    return await guestLimitsService.shouldShowBadge();
  }, [guestLimitsService]);

  /**
   * Détermine si un CTA de conversion doit être affiché
   */
  const shouldShowConversionCTA = useCallback(async (): Promise<boolean> => {
    return await guestLimitsService.shouldShowConversionCTA();
  }, [guestLimitsService]);

  /**
   * Enregistre une tentative d'action nécessitant l'authentification
   */
  const recordAuthRequiredAction = useCallback(async (action: GuestAction, context?: string) => {
    await guestLimitsService.trackGuestAction(action, context);
  }, [guestLimitsService]);

  /**
   * Réinitialise les stats (dev only)
   */
  const resetStats = useCallback(async () => {
    if (__DEV__) {
      await guestLimitsService.resetDailyStats();
      await loadDailyStats();
    }
  }, [guestLimitsService, loadDailyStats]);

  return {
    // State
    dailyStats,
    isLoading,
    
    // Actions
    loadDailyStats,
    canViewWord,
    recordWordView,
    canViewCommunity,
    recordCommunityView,
    getRemainingQuotas,
    shouldShowBadge,
    shouldShowConversionCTA,
    recordAuthRequiredAction,
    
    // Utils
    resetStats,
    guestLimitsService, // Pour accès direct si nécessaire
  };
};

/**
 * Hook pour la gestion de la conversion invité → utilisateur
 * Gère les modals, messages et CTAs de conversion
 */
export const useGuestConversion = () => {
  const { storageService, cacheService } = useServices();
  const [guestLimitsService] = useState(() => new GuestLimitsService(storageService, cacheService));
  
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentContext, setCurrentContext] = useState<ConversionContext>('profile_visit');

  /**
   * Affiche le modal d'inscription avec le contexte approprié
   */
  const triggerSignupModal = useCallback(async (context: ConversionContext) => {
    setCurrentContext(context);
    setShowSignupModal(true);
    await guestLimitsService.trackGuestAction('signup_shown', context);
  }, [guestLimitsService]);

  /**
   * Ferme le modal d'inscription
   */
  const closeSignupModal = useCallback(() => {
    setShowSignupModal(false);
  }, []);

  /**
   * Gère le clic sur inscription
   */
  const handleSignupClick = useCallback(async () => {
    await guestLimitsService.trackGuestAction('signup_clicked', currentContext);
    setShowSignupModal(false);
    // La navigation sera gérée par le composant appelant
  }, [guestLimitsService, currentContext]);

  /**
   * Récupère un message de conversion contextualisé
   */
  const getConversionMessage = useCallback(async (context: ConversionContext): Promise<string> => {
    return await guestLimitsService.getConversionMessage(context);
  }, [guestLimitsService]);

  /**
   * Détermine le titre du modal selon le contexte
   */
  const getModalTitle = useCallback((context: ConversionContext): string => {
    switch (context) {
      case 'word_limit_reached':
        return 'Limite quotidienne atteinte !';
      case 'community_limit_reached':
        return 'Plus de communautés disponibles';
      case 'favorite_attempt':
        return 'Sauvegardez vos favoris';
      case 'contribution_attempt':
        return 'Rejoignez la communauté';
      case 'profile_visit':
        return 'Créez votre profil';
      default:
        return 'Rejoignez O\'Ypunu';
    }
  }, []);

  /**
   * Détermine le CTA principal selon le contexte
   */
  const getModalCTA = useCallback((context: ConversionContext): string => {
    switch (context) {
      case 'word_limit_reached':
      case 'community_limit_reached':
        return 'Accès illimité gratuit';
      case 'favorite_attempt':
        return 'Créer mes favoris';
      case 'contribution_attempt':
        return 'Devenir contributeur';
      case 'profile_visit':
        return 'Créer mon profil';
      default:
        return 'Créer un compte gratuit';
    }
  }, []);

  return {
    // State
    showSignupModal,
    currentContext,
    
    // Actions
    triggerSignupModal,
    closeSignupModal,
    handleSignupClick,
    getConversionMessage,
    getModalTitle,
    getModalCTA,
  };
};

/**
 * Hook simple pour vérifier les permissions invité
 * Retourne des booléens pour les actions courantes
 */
export const useGuestPermissions = () => {
  const { storageService, cacheService } = useServices();
  const [guestLimitsService] = useState(() => new GuestLimitsService(storageService, cacheService));

  /**
   * Vérifie si une action spécifique est autorisée pour les invités
   */
  const checkPermission = useCallback(async (action: 'view_word' | 'view_community' | 'add_favorite' | 'contribute') => {
    switch (action) {
      case 'view_word':
        return await guestLimitsService.canViewWord();
      case 'view_community':
        return await guestLimitsService.canViewCommunity();
      case 'add_favorite':
      case 'contribute':
        return false; // Ces actions nécessitent toujours l'authentification
      default:
        return false;
    }
  }, [guestLimitsService]);

  return {
    checkPermission,
  };
};