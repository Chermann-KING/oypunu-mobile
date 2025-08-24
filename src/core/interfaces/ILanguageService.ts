/**
 * @fileoverview Language Service Interface
 * Follows SOLID principles - Interface Segregation pour les opérations de langues
 * Module dédié pour la gestion des langues et correspondances
 */

/**
 * Interface complète des langues selon le backend
 */
export interface Language {
  id: string;
  name: string; // Nom en français/anglais (ex: "Fang")
  nativeName: string; // Nom natif (ex: "Faŋ")
  iso639_1?: string; // Code ISO 2 lettres (ex: "fr")
  iso639_2?: string; // Code ISO 3 lettres (ex: "fra")
  iso639_3?: string; // Code ISO 3 lettres étendu (ex: "fan")
  family?: string; // Famille de langues
  region?: string; // Région géographique
  countries?: string[]; // Codes pays (ex: ["GA", "GQ", "CM"])
  speakerCount?: number; // Nombre de locuteurs
  status: "active" | "proposed" | "deprecated";
  writingSystem?: string; // Système d'écriture
  direction?: "ltr" | "rtl" | "vertical"; // Direction d'écriture
  flagEmoji?: string; // Emoji du drapeau principal
  flagEmojis?: string[]; // Emojis des drapeaux multiples
  priority?: number; // Priorité d'affichage
  isAfrican?: boolean; // Langue africaine prioritaire
  metadata?: {
    description?: string;
    sources?: string[];
    lastUpdated?: Date;
  };
}

/**
 * Correspondance langue pour affichage
 */
export interface LanguageMapping {
  code: string; // Code original (ISO ou ID)
  name: string; // Nom complet à afficher
  nativeName?: string; // Nom natif optionnel
  flag?: string; // Emoji drapeau optionnel
}

/**
 * Statistiques d'utilisation des langues
 */
export interface LanguageStats {
  languageId: string;
  languageName: string;
  wordCount: number;
  contributorCount: number;
  popularityScore: number;
}

/**
 * Options de filtrage des langues
 */
export interface LanguageFilters {
  region?: string;
  isAfrican?: boolean;
  status?: "active" | "proposed" | "deprecated";
  hasWords?: boolean; // Langues avec des mots existants
  minSpeakers?: number;
}

/**
 * Service de gestion des langues
 * Responsabilité unique : gestion des langues et correspondances
 */
export interface ILanguageService {
  /**
   * Récupère toutes les langues disponibles
   */
  getAllLanguages(filters?: LanguageFilters): Promise<Language[]>;

  /**
   * Récupère les langues africaines prioritaires
   */
  getAfricanLanguages(): Promise<Language[]>;

  /**
   * Récupère les langues populaires (avec le plus de mots)
   */
  getPopularLanguages(limit?: number): Promise<Language[]>;

  /**
   * Récupère les détails d'une langue par ID ou code
   */
  getLanguageById(identifier: string): Promise<Language>;

  /**
   * Recherche de langues par nom/code
   */
  searchLanguages(query: string): Promise<Language[]>;

  /**
   * Récupère une correspondance langue (code → nom) pour affichage
   */
  getLanguageMapping(code: string): Promise<LanguageMapping | null>;

  /**
   * Récupère toutes les correspondances pour utilisation hors ligne
   */
  getAllLanguageMappings(): Promise<Map<string, LanguageMapping>>;

  /**
   * Récupère les statistiques d'utilisation des langues
   */
  getLanguageStats(): Promise<LanguageStats[]>;

  /**
   * Valide si un code de langue existe
   */
  validateLanguageCode(code: string): Promise<boolean>;

  /**
   * Convertit un code de langue vers un format spécifique
   */
  convertLanguageCode(
    code: string,
    targetFormat: "iso639_1" | "iso639_2" | "iso639_3" | "name"
  ): Promise<string | null>;

  /**
   * Met en cache les correspondances langues pour usage hors ligne
   */
  cacheLanguageMappings(): Promise<void>;

  /**
   * Efface le cache des langues
   */
  clearLanguageCache(): Promise<void>;

  // ============ MÉTHODES DE CONTRIBUTION (CONTRIBUTOR+) ============

  /**
   * Propose une nouvelle langue (CONTRIBUTOR+)
   */
  proposeLanguage(data: CreateLanguageData): Promise<Language>;

  /**
   * Met à jour une langue existante (CONTRIBUTOR+ pour ses propres contributions, ADMIN+ pour toutes)
   */
  updateLanguage(id: string, data: Partial<CreateLanguageData>): Promise<Language>;

  /**
   * Supprime une proposition de langue (CONTRIBUTOR+ pour ses propres contributions, ADMIN+ pour toutes)
   */
  deleteLanguageProposal(id: string): Promise<void>;

  /**
   * Récupère les contributions de langues de l'utilisateur connecté
   */
  getMyLanguageContributions(): Promise<Language[]>;

  // ============ MÉTHODES DE MODÉRATION (ADMIN+) ============

  /**
   * Récupère toutes les propositions de langues en attente (ADMIN+)
   */
  getPendingLanguageProposals(): Promise<Language[]>;

  /**
   * Approuve une proposition de langue (ADMIN+)
   */
  approveLanguageProposal(id: string, moderatorNotes?: string): Promise<Language>;

  /**
   * Rejette une proposition de langue (ADMIN+)
   */
  rejectLanguageProposal(id: string, rejectionReason: string): Promise<void>;

  /**
   * Change le statut d'une langue (ADMIN+)
   */
  updateLanguageStatus(id: string, status: 'active' | 'deprecated', reason?: string): Promise<Language>;

  /**
   * Récupère l'historique de modération d'une langue (ADMIN+)
   */
  getLanguageModerationHistory(id: string): Promise<{
    id: string;
    action: 'created' | 'updated' | 'approved' | 'rejected' | 'status_changed';
    moderatorId: string;
    moderatorName: string;
    reason?: string;
    timestamp: Date;
  }[]>;
}

/**
 * Données pour créer/proposer une nouvelle langue
 */
export interface CreateLanguageData {
  name: string;
  nativeName: string;
  iso639_1?: string;
  iso639_2?: string;
  iso639_3?: string;
  family?: string;
  region?: string;
  countries?: string[];
  speakerCount?: number;
  writingSystem?: string;
  direction?: 'ltr' | 'rtl' | 'vertical';
  isAfrican?: boolean;
  metadata?: {
    description?: string;
    sources?: string[];
  };
}
