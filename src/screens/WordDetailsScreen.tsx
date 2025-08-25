/**
 * @fileoverview Word Details Screen
 * Affichage complet des détails d'un mot avec toutes ses définitions, exemples, audio, etc.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Heart,
  Play,
  Share2,
  BookOpen,
  User,
  Calendar,
  Globe,
} from "lucide-react-native";
import { Colors, Spacing, Typography } from "../design-system";
import { Card, Button } from "../design-system/components";
import { DetailedWord } from "../types";
import { useDictionaryService } from "../core/providers/ServiceProvider";
import { useFavoritesAPI } from "../core/hooks/useFavorites";
import { useLanguageMapping } from "../core/hooks/useLanguageMapping";

interface WordDetailsScreenProps {
  wordId: string;
  onBack: () => void;
  onNavigateToWord?: (wordId: string) => void;
}

export const WordDetailsScreen: React.FC<WordDetailsScreenProps> = ({
  wordId,
  onBack,
  onNavigateToWord,
}) => {
  // State
  const [word, setWord] = useState<DetailedWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed tab state - using sections instead

  // Services
  const dictionaryService = useDictionaryService();
  const { toggleFavorite, isFavorite, isLoadingFavorites } = useFavoritesAPI();
  const { formatLanguageDisplay } = useLanguageMapping();

  // Load word details
  const loadWordDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const detailedWord = await dictionaryService.getDetailedWordById(wordId);

      // Debug logging for word details
      console.log("[WordDetailsScreen] Loaded word details:", {
        word: detailedWord.word,
        author: detailedWord.author,
        authorInfo: detailedWord.authorInfo,
        synonymsCount: detailedWord.synonyms?.length || 0,
        antonymsCount: detailedWord.antonyms?.length || 0,
        translationsCount: detailedWord.translations?.length || 0,
        synonyms: detailedWord.synonyms,
        antonyms: detailedWord.antonyms,
      });

      setWord(detailedWord);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de chargement du mot";
      setError(errorMessage);
      console.error("Error loading word details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [wordId, dictionaryService]);

  useEffect(() => {
    loadWordDetails();
  }, [loadWordDetails]);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!word) return;

    try {
      const newIsFavorite = await toggleFavorite(word);

      // Show feedback
      Alert.alert(
        newIsFavorite ? "Ajouté aux favoris" : "Retiré des favoris",
        `"${word.word}" ${
          newIsFavorite ? "a été ajouté à" : "a été retiré de"
        } vos favoris.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de modifier vos favoris. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    }
  };

  // Handle share
  const handleShare = () => {
    if (!word) return;

    Alert.alert(
      "Partage",
      `Partage du mot "${word.word}" (fonctionnalité à venir)`
    );
    // TODO: Implement native sharing
  };

  // Handle play audio
  const handlePlayAudio = () => {
    if (!word) return;

    Alert.alert(
      "Audio",
      `Lecture audio de "${word.word}" (fonctionnalité à venir)`
    );
    // TODO: Implement audio playback
  };

  // Handle navigation to related word
  const handleRelatedWordPress = useCallback(
    (relatedWordId: string, relatedWord: string) => {
      console.log(
        `🔗 NAVIGATING TO RELATED WORD: ${relatedWord} (ID: ${relatedWordId})`
      );

      if (onNavigateToWord) {
        onNavigateToWord(relatedWordId);
      } else {
        Alert.alert(
          "Navigation",
          `Voulez-vous consulter le mot "${relatedWord}" ?`,
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Consulter",
              onPress: () => {
                // If no navigation callback is provided, show a message
                Alert.alert(
                  "Fonctionnalité",
                  "Navigation entre mots à venir dans une future version."
                );
              },
            },
          ]
        );
      }
    },
    [onNavigateToWord]
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du mot</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !word) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du mot</Text>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorMessage}>{error || "Mot non trouvé"}</Text>
          <Button
            title="Réessayer"
            onPress={loadWordDetails}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{word.word}</Text>

        <View style={styles.headerActions}>
          {/* Audio button */}
          {word.audioFiles && word.audioFiles.length > 0 && (
            <TouchableOpacity
              onPress={handlePlayAudio}
              style={styles.actionButton}
            >
              <Play size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}

          {/* Share button */}
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          {/* Favorite button */}
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            disabled={isLoadingFavorites}
            style={styles.actionButton}
          >
            {isLoadingFavorites ? (
              <ActivityIndicator size="small" color={Colors.text.tertiary} />
            ) : (
              <Heart
                size={20}
                color={
                  isFavorite(word.id)
                    ? Colors.semantic.error
                    : Colors.text.secondary
                }
                fill={
                  isFavorite(word.id) ? Colors.semantic.error : "transparent"
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Word info card */}
        <View style={styles.wordCard}>
          <Card variant="default" padding={4}>
            <Text style={styles.wordTitle}>{word.word}</Text>

            {/* Language and pronunciation */}
            <View style={styles.wordMeta}>
              <Text style={styles.language}>
                {word.languageInfo
                  ? `${word.languageInfo.flagEmoji || ""} ${
                      word.languageInfo.name
                    }`.trim()
                  : formatLanguageDisplay(word.language, { showFlag: true })}
              </Text>
              {word.pronunciation && (
                <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
              )}
            </View>

            {/* Etymology */}
            {word.etymology && (
              <View style={styles.etymologySection}>
                <Text style={styles.sectionLabel}>Étymologie</Text>
                <Text style={styles.etymology}>{word.etymology}</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Definitions Section */}
        <View style={styles.sectionCard}>
          <Card variant="default" padding={4}>
            <Text style={styles.sectionTitle}>Définitions</Text>
            {word.meanings && word.meanings.length > 0 ? (
              word.meanings.map((meaning, meaningIndex) => (
                <View key={meaningIndex} style={styles.meaningContainer}>
                  <View style={styles.partOfSpeechHeader}>
                    <BookOpen size={16} color={Colors.text.secondary} />
                    <Text style={styles.partOfSpeech}>
                      {meaning.partOfSpeech}
                    </Text>
                  </View>

                  {meaning.definitions.map((def, defIndex) => (
                    <View key={defIndex} style={styles.definition}>
                      <Text style={styles.definitionText}>
                        {meaning.definitions.length > 1 && `${defIndex + 1}. `}
                        {def.definition}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                Aucune définition disponible.
              </Text>
            )}
          </Card>
        </View>

        {/* Examples Section */}
        {word.examples && word.examples.length > 0 && (
          <View style={styles.sectionCard}>
            <Card variant="default" padding={4}>
              <Text style={styles.sectionTitle}>Exemples d'utilisation</Text>
              {word.examples.map((example, index) => (
                <Text key={index} style={styles.exampleText}>
                  • {example}
                </Text>
              ))}
            </Card>
          </View>
        )}

        {/* Synonyms Section */}
        {word.synonyms && word.synonyms.length > 0 && (
          <View style={styles.sectionCard}>
            <Card variant="default" padding={4}>
              <Text style={styles.sectionTitle}>Synonymes</Text>
              <View style={styles.relatedWordsContainer}>
                {word.synonyms.map((synonym, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.relatedWordButton}
                    onPress={() =>
                      handleRelatedWordPress(synonym.id, synonym.word)
                    }
                  >
                    <Text style={styles.relatedWordText}>{synonym.word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Antonyms Section */}
        {word.antonyms && word.antonyms.length > 0 && (
          <View style={styles.sectionCard}>
            <Card variant="default" padding={4}>
              <Text style={styles.sectionTitle}>Antonymes</Text>
              <View style={styles.relatedWordsContainer}>
                {word.antonyms.map((antonym, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.relatedWordButton}
                    onPress={() =>
                      handleRelatedWordPress(antonym.id, antonym.word)
                    }
                  >
                    <Text style={styles.relatedWordText}>{antonym.word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Translations Section */}
        {word.translations && word.translations.length > 0 && (
          <View style={styles.sectionCard}>
            <Card variant="default" padding={4}>
              <Text style={styles.sectionTitle}>🌐 Traductions</Text>
              {word.translations.map((translation, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.translationItem}
                  onPress={() =>
                    handleRelatedWordPress(translation.id, translation.word)
                  }
                >
                  <Text style={styles.translationLanguage}>
                    {translation.languageName}
                  </Text>
                  <Text style={styles.translationWord}>{translation.word}</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}

        {/* Additional info */}
        <View style={styles.infoCard}>
          <Card variant="default" padding={4}>
            <Text style={styles.sectionTitle}>Informations</Text>

            {/* Author */}
            <View style={styles.infoRow}>
              <User size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>Ajouté par: {word.author}</Text>
            </View>

            {/* Creation date */}
            <View style={styles.infoRow}>
              <Calendar size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>
                Créé le{" "}
                {new Date(word.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            {/* Update date */}
            {word.updatedAt && word.updatedAt !== word.createdAt && (
              <View style={styles.infoRow}>
                <Calendar size={16} color={Colors.text.secondary} />
                <Text style={styles.infoText}>
                  Modifié le{" "}
                  {new Date(word.updatedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}

            {/* Category */}
            {word.categoryInfo && (
              <View style={styles.infoRow}>
                <BookOpen size={16} color={Colors.text.secondary} />
                <Text style={styles.infoText}>
                  Catégorie: {word.categoryInfo.name}
                </Text>
              </View>
            )}

            {/* Status */}
            <View style={styles.infoRow}>
              <Globe size={16} color={Colors.text.secondary} />
              <Text style={styles.infoText}>
                Statut:{" "}
                {word.status === "approved" ? "✅ Approuvé" : word.status}
              </Text>
            </View>
          </Card>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[200],
  },
  backButton: {
    padding: Spacing[2],
    marginRight: Spacing[2],
  },
  headerTitle: {
    ...Typography.styles.headingMedium,
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: Spacing[2],
    marginLeft: Spacing[1],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[6],
  },
  loadingText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[4],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[6],
  },
  errorTitle: {
    ...Typography.styles.headingMedium,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  errorMessage: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing[6],
  },
  wordCard: {
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
  },
  wordTitle: {
    ...Typography.styles.headingLarge,
    marginBottom: Spacing[2],
  },
  wordMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: Spacing[3],
  },
  language: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginRight: Spacing[4],
  },
  pronunciation: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
  etymologySection: {
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.primary[200],
  },
  sectionLabel: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing[1],
  },
  etymology: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  sectionTitle: {
    ...Typography.styles.headingMedium,
    marginTop: Spacing[2],
    marginBottom: Spacing[3],
  },
  meaningCard: {
    marginBottom: Spacing[3],
  },
  partOfSpeechHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[2],
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[200],
  },
  partOfSpeech: {
    ...Typography.styles.labelMedium,
    color: Colors.interactive.focus,
    marginLeft: Spacing[1],
    textTransform: "capitalize",
  },
  definition: {
    marginBottom: Spacing[3],
  },
  definitionText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  examples: {
    marginTop: Spacing[2],
    paddingLeft: Spacing[3],
  },
  exampleText: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: Spacing[1],
  },
  infoCard: {
    marginTop: Spacing[3],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[2],
  },
  infoText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    marginLeft: Spacing[2],
  },
  bottomSpacing: {
    height: Spacing[8],
  },
  // Section styles
  sectionCard: {
    marginBottom: Spacing[4],
  },
  meaningContainer: {
    marginBottom: Spacing[3],
  },
  // Related words styles
  relatedWordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing[2],
  },
  relatedWordButton: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 16,
    marginRight: Spacing[2],
    marginBottom: Spacing[2],
  },
  relatedWordText: {
    ...Typography.styles.labelMedium,
    color: Colors.primary[700],
    fontWeight: "500",
  },
  // Translation styles
  translationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[200],
  },
  translationLanguage: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    flex: 1,
  },
  translationWord: {
    ...Typography.styles.bodyMedium,
    color: Colors.primary[700],
    fontWeight: "500",
  },
  // No data state
  noDataText: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginTop: Spacing[2],
    fontStyle: "italic",
  },
});
