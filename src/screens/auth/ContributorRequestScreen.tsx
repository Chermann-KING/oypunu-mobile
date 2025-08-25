import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Colors, Spacing, Typography } from "../../design-system";
import { Input, Button, Card } from "../../design-system/components";
import { Lock } from "lucide-react-native";
import { useServiceProvider } from "../../core/providers/ServiceProvider";
import { useAuth } from "../../core/hooks/useAuth";

const MAX = {
  motivation: 1000,
  experience: 500,
  languages: 200,
};

const urlRegex = /^(https?:\/\/).+/i;
const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i;

export const ContributorRequestScreen: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { contributorRequestService } = useServiceProvider() as any;

  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [commitment, setCommitment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Pre-check: prevent duplicate requests (only for authenticated users)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated || !user) {
        if (mounted) setCheckingExisting(false);
        return;
      }
      try {
        const exists = await contributorRequestService.hasExistingRequest?.();
        if (!mounted) return;
        if (exists) {
          Alert.alert(
            "Demande déjà en cours",
            "Vous avez déjà une demande de contribution en cours de traitement.",
            [{ text: "OK", onPress: () => router.replace("/(tabs)/profile") }]
          );
        }
      } catch (e) {
        // ignore pre-check errors; user can still try to submit
      } finally {
        if (mounted) setCheckingExisting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id]);

  const motivationValid =
    motivation.trim().length >= 50 &&
    motivation.trim().length <= MAX.motivation;
  const experienceValid = experience.trim().length <= MAX.experience;
  const languagesValid = languages.trim().length <= MAX.languages;
  const linkedInValid = !linkedIn || linkedInRegex.test(linkedIn);
  const githubValid = !github || githubRegex.test(github);
  const portfolioValid = !portfolio || urlRegex.test(portfolio);

  const isValid =
    motivationValid &&
    experienceValid &&
    languagesValid &&
    linkedInValid &&
    githubValid &&
    portfolioValid &&
    commitment;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert(
        "Champs invalides",
        "Veuillez corriger les erreurs et confirmer votre engagement."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await contributorRequestService.createRequest({
        motivation: motivation.trim(),
        experience: experience.trim() || undefined,
        languages: languages.trim() || undefined,
        commitment,
        linkedIn: linkedIn.trim() || undefined,
        github: github.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
      });

      Alert.alert(
        "Demande envoyée",
        "Votre demande de rôle Contributeur a été soumise. Nous vous répondrons par email.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/profile") }]
      );
    } catch (e: any) {
      if (e?.status === 409) {
        Alert.alert("Déjà envoyée", "Vous avez déjà une demande en cours.");
      } else if (e?.status === 400) {
        Alert.alert(
          "Données invalides",
          e?.message || "Vérifiez les champs saisis."
        );
      } else {
        Alert.alert(
          "Erreur",
          e?.message || "Impossible d'envoyer la demande pour le moment"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>Demande de contribution</Text>
          <Text style={styles.subtitle}>
            Vous devez être connecté pour demander le rôle Contributeur.
          </Text>
          <Card variant="elevated" padding={6}>
            <View style={{ alignItems: "center", gap: Spacing[3] }}>
              <Lock size={40} color={Colors.text.secondary} />
              <Text
                style={{
                  ...Typography.styles.bodyMedium,
                  textAlign: "center",
                  color: Colors.text.secondary,
                }}
              >
                Créez un compte ou connectez-vous, puis revenez sur cette page
                pour soumettre votre demande.
              </Text>
              <Button
                title="S'inscrire"
                onPress={() =>
                  router.push({
                    pathname: "/(auth)/register",
                    params: { returnTo: "/(auth)/contributor-request" },
                  })
                }
                variant="primary"
                fullWidth
              />
              <Button
                title="Se connecter"
                onPress={() =>
                  router.push({
                    pathname: "/(auth)/login",
                    params: { returnTo: "/(auth)/contributor-request" },
                  })
                }
                variant="secondary"
                fullWidth
              />
              <Button
                title="Retour"
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(tabs)/profile")
                }
                variant="tertiary"
                fullWidth
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Demande de contribution</Text>
        <Text style={styles.subtitle}>
          Expliquez vos motivations et votre expérience
        </Text>

        {/* Identité */}
        {user && (
          <View style={styles.readonlyBox}>
            <Text style={styles.readonlyLine}>
              Utilisateur:{" "}
              <Text style={styles.readonlyStrong}>
                {user.username || user.email}
              </Text>
            </Text>
            {user.email && (
              <Text style={styles.readonlyLine}>
                Email: <Text style={styles.readonlyStrong}>{user.email}</Text>
              </Text>
            )}
          </View>
        )}

        {/* Motivation */}
        <Input
          placeholder="Votre motivation (min 50 caractères)"
          value={motivation}
          onChangeText={setMotivation}
          multiline
          numberOfLines={6}
          maxLength={MAX.motivation}
          footerRight={
            <Text
              style={[styles.counter, !motivationValid && styles.counterError]}
            >
              {motivation.trim().length}/{MAX.motivation}
            </Text>
          }
        />

        {/* Expérience */}
        <Input
          placeholder="Expérience pertinente (optionnel)"
          value={experience}
          onChangeText={setExperience}
          multiline
          numberOfLines={4}
          maxLength={MAX.experience}
          footerRight={
            <Text
              style={[styles.counter, !experienceValid && styles.counterError]}
            >
              {experience.trim().length}/{MAX.experience}
            </Text>
          }
        />

        {/* Langues */}
        <Input
          placeholder="Langues que vous maîtrisez (optionnel)"
          value={languages}
          onChangeText={setLanguages}
          maxLength={MAX.languages}
          footerRight={
            <Text
              style={[styles.counter, !languagesValid && styles.counterError]}
            >
              {languages.trim().length}/{MAX.languages}
            </Text>
          }
        />

        {/* Liens */}
        <Input
          placeholder="Profil LinkedIn (optionnel)"
          value={linkedIn}
          onChangeText={setLinkedIn}
        />
        {!linkedInValid && (
          <Text style={styles.errorText}>Lien LinkedIn invalide</Text>
        )}
        <Input
          placeholder="Profil GitHub (optionnel)"
          value={github}
          onChangeText={setGithub}
        />
        {!githubValid && (
          <Text style={styles.errorText}>Lien GitHub invalide</Text>
        )}
        <Input
          placeholder="Portfolio (optionnel)"
          value={portfolio}
          onChangeText={setPortfolio}
        />
        {!portfolioValid && <Text style={styles.errorText}>URL invalide</Text>}

        {/* Engagement */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Je m'engage à respecter les règles de contribution conformément aux
            <Text> </Text>
            <Link href="/legal/terms" style={styles.link}>
              Conditions d'utilisation
            </Link>
            <Text> et à la </Text>
            <Link href="/legal/privacy" style={styles.link}>
              Politique de confidentialité
            </Link>
            .
          </Text>
          <Switch value={commitment} onValueChange={setCommitment} />
        </View>

        <Button
          title={submitting ? "Envoi..." : "Envoyer la demande"}
          onPress={handleSubmit}
          disabled={!isValid || submitting || checkingExisting}
          variant="primary"
        />
        <Button
          title="Annuler"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/profile")
          }
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface.background },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing[6], gap: Spacing[3] },
  title: { ...Typography.styles.headingLarge, textAlign: "center" },
  subtitle: {
    ...Typography.styles.bodyMedium,
    textAlign: "center",
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  readonlyBox: {
    backgroundColor: Colors.surface.card,
    borderRadius: 12,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.primary[300],
  },
  readonlyLine: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.secondary,
  },
  readonlyStrong: { color: Colors.text.primary },
  counter: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textAlign: "right",
  },
  counterError: { color: Colors.semantic.error },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing[2],
  },
  switchLabel: {
    ...Typography.styles.bodyMedium,
    flex: 1,
    marginRight: Spacing[2],
  },
  link: { color: Colors.primary[400] },
  errorText: { ...Typography.styles.bodySmall, color: Colors.semantic.error },
});

export default ContributorRequestScreen;
