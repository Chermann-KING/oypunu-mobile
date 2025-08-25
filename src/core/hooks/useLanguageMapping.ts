/**
 * @fileoverview Language Mapping Hook
 * Hook pour gérer les correspondances langue code → nom complet
 * Optimisé pour les cartes de mots et l'affichage
 */

import { useCallback, useEffect, useState } from 'react';
import { useLanguageService } from '../providers/ServiceProvider';
import { Language, LanguageMapping } from '../interfaces/ILanguageService';

/**
 * Hook principal pour les correspondances de langues
 * Fournit des méthodes optimisées pour convertir codes → noms
 */
export const useLanguageMapping = () => {
  const languageService = useLanguageService();
  
  const [mappings, setMappings] = useState<Map<string, LanguageMapping>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge toutes les correspondances au montage du hook
   */
  useEffect(() => {
    const loadMappings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allMappings = await languageService.getAllLanguageMappings();
        setMappings(allMappings);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des langues';
        setError(errorMessage);
        console.error('[useLanguageMapping] Error loading mappings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMappings();
  }, [languageService]);

  /**
   * Convertit un code de langue vers le nom complet
   * Version synchrone rapide utilisant le cache local
   */
  const getLanguageName = useCallback((code: string): string => {
    if (!code) return 'Langue inconnue';
    
    const mapping = mappings.get(code);
    if (mapping) {
      return mapping.name;
    }
    
    // Fallback pour codes non trouvés
    return code.toUpperCase(); // Afficher le code en majuscules comme fallback
  }, [mappings]);

  /**
   * Récupère une correspondance complète (nom + drapeau)
   * Version synchrone pour l'affichage
   */
  const getLanguageMapping = useCallback((code: string): LanguageMapping | null => {
    if (!code) return null;
    return mappings.get(code) || null;
  }, [mappings]);

  /**
   * Convertit un code vers le nom natif si disponible
   */
  const getLanguageNativeName = useCallback((code: string): string => {
    if (!code) return 'Langue inconnue';
    
    const mapping = mappings.get(code);
    if (mapping && mapping.nativeName) {
      return mapping.nativeName;
    }
    
    return getLanguageName(code); // Fallback vers le nom standard
  }, [mappings, getLanguageName]);

  /**
   * Récupère l'emoji du drapeau pour une langue
   */
  const getLanguageFlag = useCallback((code: string): string | null => {
    if (!code) return null;
    
    const mapping = mappings.get(code);
    return mapping?.flag || null;
  }, [mappings]);

  /**
   * Formate l'affichage d'une langue avec nom et drapeau
   */
  const formatLanguageDisplay = useCallback((code: string, options: {
    showFlag?: boolean;
    showNative?: boolean;
    fallbackToCode?: boolean;
  } = {}): string => {
    if (!code) return 'Langue inconnue';
    
    const {
      showFlag = false,
      showNative = false,
      fallbackToCode = true
    } = options;
    
    const mapping = mappings.get(code);
    
    // Debug spécifique pour l'ID français
    if (code === '686d7786c1ce2d689bada0ed') {
      console.log(`[useLanguageMapping] Searching for French ID: ${code}`);
      console.log(`[useLanguageMapping] Mapping found:`, mapping);
      console.log(`[useLanguageMapping] Total mappings:`, mappings.size);
      
      // Afficher les 5 premiers mappings pour debug
      const first5 = Array.from(mappings.entries()).slice(0, 5);
      console.log(`[useLanguageMapping] First 5 mappings:`, first5);
    }
    
    if (!mapping) {
      console.log(`[useLanguageMapping] No mapping found for code: ${code}`);
      return fallbackToCode ? code.toUpperCase() : 'Langue inconnue';
    }
    
    let display = showNative && mapping.nativeName ? mapping.nativeName : mapping.name;
    
    if (showFlag && mapping.flag) {
      display = `${mapping.flag} ${display}`;
    }
    
    return display;
  }, [mappings]);

  /**
   * Valide si un code de langue existe
   */
  const hasLanguageMapping = useCallback((code: string): boolean => {
    return mappings.has(code);
  }, [mappings]);

  /**
   * Recharge les correspondances (en cas de mise à jour)
   */
  const refreshMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Force le rechargement du cache
      await languageService.clearLanguageCache();
      const allMappings = await languageService.getAllLanguageMappings();
      setMappings(allMappings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de rechargement des langues';
      setError(errorMessage);
      console.error('[useLanguageMapping] Error refreshing mappings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [languageService]);

  return {
    // State
    isLoading,
    error,
    mappingsCount: mappings.size,
    
    // Core methods
    getLanguageName,
    getLanguageMapping,
    getLanguageNativeName,
    getLanguageFlag,
    
    // Utility methods
    formatLanguageDisplay,
    hasLanguageMapping,
    refreshMappings,
  };
};

/**
 * Hook simple pour convertir un seul code de langue
 * Optimisé pour les composants qui n'ont besoin que d'un mapping
 */
export const useLanguageName = (code: string) => {
  const { getLanguageName, isLoading } = useLanguageMapping();
  
  return {
    languageName: getLanguageName(code),
    isLoading,
  };
};

/**
 * Hook pour les composants nécessitant plusieurs langues
 * Batch les conversions pour optimiser les performances
 */
export const useLanguageNames = (codes: string[]) => {
  const { getLanguageName, isLoading } = useLanguageMapping();
  
  const languageNames = codes.map(code => ({
    code,
    name: getLanguageName(code),
  }));
  
  return {
    languageNames,
    isLoading,
  };
};