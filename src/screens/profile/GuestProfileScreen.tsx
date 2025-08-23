import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  LogIn,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Star,
} from "lucide-react-native";
import { Colors, Spacing, Typography } from "../../design-system";
import { Card, Button } from "../../design-system/components";
import {
  useGuestExperience,
  useGuestConversion,
} from "../../core/hooks/useGuestExperience";

/**
 * GuestProfileScreen
 *
 * Ecran de profil destiné aux visiteurs non authentifiés.
 * Explique les bénéfices de la création de compte et propose des CTA
 * (inscription / connexion) avec une modale de conversion contextuelle.
 */
export const GuestProfileScreen: React.FC = () => {
  const router = useRouter();
  const { getRemainingQuotas } = useGuestExperience();
  const {
    triggerSignupModal,
    showSignupModal,
    closeSignupModal,
    getConversionMessage,
    getModalTitle,
    getModalCTA,
    currentContext,
  } = useGuestConversion();

  const [quotas, setQuotas] = useState({
    wordsRemaining: 3,
    communitiesRemaining: 2,
    percentageUsed: 0,
  });
  const [conversionMessage, setConversionMessage] = useState("");

  useEffect(() => {
    const loadGuestData = async () => {
      const quotasData = await getRemainingQuotas();
      setQuotas(quotasData);
    };
    loadGuestData();
  }, [getRemainingQuotas]);

  useEffect(() => {
    const loadConversionMessage = async () => {
      const message = await getConversionMessage("profile_visit");
      setConversionMessage(message);
    };
    loadConversionMessage();
  }, [getConversionMessage]);

  const handleSignupPress = () => {
    triggerSignupModal("profile_visit");
  };

  const handleLoginPress = () => {
    router.push("/(auth)/login");
  };

  const handleModalSignupPress = () => {
    closeSignupModal();
    router.push("/(auth)/register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Welcome Section */}
        <Card variant="elevated" padding={6} style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <LogIn size={48} color={Colors.primary[500]} />
            <Text style={styles.welcomeTitle}>Bienvenue sur O'Ypunu !</Text>
            <Text style={styles.welcomeSubtitle}>
              Découvrez le dictionnaire collaboratif des langues du Gabon
            </Text>
          </View>
        </Card>

        {/* Usage Progress */}
        <Card variant="default" padding={4}>
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>
              Votre exploration d'aujourd'hui
            </Text>
            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <BookOpen size={20} color={Colors.semantic.info} />
                <Text style={styles.progressValue}>
                  {3 - quotas.wordsRemaining}/3
                </Text>
                <Text style={styles.progressLabel}>Mots consultés</Text>
              </View>
              <View style={styles.progressItem}>
                <Users size={20} color={Colors.semantic.warning} />
                <Text style={styles.progressValue}>
                  {2 - quotas.communitiesRemaining}/2
                </Text>
                <Text style={styles.progressLabel}>Communautés</Text>
              </View>
            </View>
            <Text style={styles.progressMessage}>
              {quotas.wordsRemaining > 0 || quotas.communitiesRemaining > 0
                ? `Plus que ${quotas.wordsRemaining} mot${
                    quotas.wordsRemaining > 1 ? "s" : ""
                  } gratuit${
                    quotas.wordsRemaining > 1 ? "s" : ""
                  } aujourd'hui !`
                : "Revenez demain pour de nouvelles consultations gratuites !"}
            </Text>
          </View>
        </Card>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi créer un compte ?</Text>
          <Card variant="default" padding={4} style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <Star size={24} color={Colors.semantic.warning} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Favoris illimités</Text>
                <Text style={styles.benefitDescription}>
                  Sauvegardez tous vos mots préférés
                </Text>
              </View>
            </View>
          </Card>
          <Card variant="default" padding={4} style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <BookOpen size={24} color={Colors.semantic.success} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Accès illimité</Text>
                <Text style={styles.benefitDescription}>
                  Consultez tous les mots sans restriction
                </Text>
              </View>
            </View>
          </Card>
          <Card variant="default" padding={4} style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <TrendingUp size={24} color={Colors.semantic.info} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Suivez vos progrès</Text>
                <Text style={styles.benefitDescription}>
                  Statistiques détaillées de vos contributions
                </Text>
              </View>
            </View>
          </Card>
          <Card variant="default" padding={4} style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <Award size={24} color={Colors.semantic.error} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>
                  Contribuez & gagnez des points
                </Text>
                <Text style={styles.benefitDescription}>
                  Aidez à enrichir le dictionnaire
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à rejoindre la communauté ?</Text>
          <Text style={styles.ctaSubtitle}>{conversionMessage}</Text>
          <View style={styles.ctaButtons}>
            <Button
              title="Créer un compte gratuit"
              onPress={handleSignupPress}
              variant="primary"
              fullWidth
            />
            <Button
              title="J'ai déjà un compte"
              onPress={handleLoginPress}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      {/* Signup Modal */}
      <Modal
        visible={showSignupModal}
        transparent
        animationType="slide"
        onRequestClose={closeSignupModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {getModalTitle(currentContext)}
            </Text>
            <Text style={styles.modalMessage}>{conversionMessage}</Text>
            <View style={styles.modalButtons}>
              <Button
                title={getModalCTA(currentContext)}
                onPress={handleModalSignupPress}
                variant="primary"
                fullWidth
              />
              <Button
                title="Plus tard"
                onPress={closeSignupModal}
                variant="tertiary"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  // Guest Profile Styles
  welcomeCard: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
  },
  welcomeHeader: {
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  welcomeTitle: {
    ...Typography.styles.headingLarge,
    textAlign: "center",
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  welcomeSubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  progressSection: {
    alignItems: "center",
  },
  progressTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[4],
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: Spacing[4],
  },
  progressItem: {
    alignItems: "center",
    flex: 1,
  },
  progressValue: {
    ...Typography.styles.headingMedium,
    marginTop: Spacing[2],
    marginBottom: Spacing[1],
  },
  progressLabel: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  progressMessage: {
    ...Typography.styles.bodySmall,
    color: Colors.semantic.info,
    textAlign: "center",
    fontStyle: "italic",
  },
  benefitCard: {
    marginBottom: Spacing[3],
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitContent: {
    flex: 1,
    marginLeft: Spacing[4],
  },
  benefitTitle: {
    ...Typography.styles.bodyMedium,
    fontWeight: "600",
    marginBottom: Spacing[1],
  },
  benefitDescription: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
  },
  ctaSection: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[6],
    alignItems: "center",
  },
  ctaTitle: {
    ...Typography.styles.headingMedium,
    textAlign: "center",
    marginBottom: Spacing[2],
  },
  ctaSubtitle: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing[6],
    lineHeight: 22,
  },
  ctaButtons: {
    width: "100%",
    gap: Spacing[3],
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
  },
  modalContent: {
    backgroundColor: Colors.surface.background,
    borderRadius: 12,
    padding: Spacing[6],
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.styles.headingMedium,
    textAlign: "center",
    marginBottom: Spacing[4],
  },
  modalMessage: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing[6],
  },
  modalButtons: {
    gap: Spacing[3],
  },
});

export default GuestProfileScreen;
