import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "../../src/design-system";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <Text style={styles.meta}>
          Dernière mise à jour : 7 janvier 2025 (v1.0)
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.paragraph}>
            En accédant et en utilisant O'Ypunu (ci-après « la Plateforme »),
            vous acceptez d'être lié par les présentes conditions d'utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser
            notre service.
          </Text>
          <Text style={styles.paragraph}>
            O'Ypunu est une plateforme collaborative dédiée à la préservation et
            à la promotion des langues africaines et du monde entier, permettant
            aux utilisateurs de contribuer à un dictionnaire multilingue
            communautaire.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description du service</Text>
          <Text style={styles.paragraph}>
            O'Ypunu offre les services suivants :
          </Text>
          <Text style={styles.bullet}>
            • Dictionnaire multilingue collaboratif
          </Text>
          <Text style={styles.bullet}>
            • Système de traduction communautaire
          </Text>
          <Text style={styles.bullet}>
            • Espaces communautaires pour les passionnés de langues et cultures
          </Text>
          <Text style={styles.bullet}>
            • Outils de préservation linguistique
          </Text>
          <Text style={styles.bullet}>
            • Système de messagerie entre utilisateurs
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Comptes utilisateurs</Text>
          <Text style={styles.subtitle}>3.1 Création de compte</Text>
          <Text style={styles.paragraph}>
            Pour utiliser certaines fonctionnalités, vous devez créer un compte
            en fournissant des informations exactes et à jour. Vous êtes
            responsable de la confidentialité de vos identifiants.
          </Text>
          <Text style={styles.subtitle}>3.2 Responsabilités</Text>
          <Text style={styles.paragraph}>
            Vous vous engagez à utiliser votre compte de manière responsable et
            à ne pas le partager avec des tiers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Contributions et contenu</Text>
          <Text style={styles.subtitle}>4.1 Propriété du contenu</Text>
          <Text style={styles.paragraph}>
            En contribuant du contenu (mots, définitions, traductions, etc.),
            vous accordez à O'Ypunu une licence non exclusive pour utiliser,
            modifier et distribuer ce contenu dans le cadre du service.
          </Text>
          <Text style={styles.subtitle}>4.2 Qualité et exactitude</Text>
          <Text style={styles.paragraph}>
            Vous vous engagez à fournir des contributions exactes, respectueuses
            et culturellement appropriées. Le contenu offensant, discriminatoire
            ou inexact peut être supprimé.
          </Text>
          <Text style={styles.subtitle}>4.3 Modération</Text>
          <Text style={styles.paragraph}>
            O'Ypunu se réserve le droit de modérer, modifier ou supprimer tout
            contenu qui ne respecte pas nos standards communautaires.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Utilisation acceptable</Text>
          <Text style={styles.paragraph}>
            Il est interdit d'utiliser O'Ypunu pour :
          </Text>
          <Text style={styles.bullet}>
            • Publier du contenu illégal, offensant ou discriminatoire
          </Text>
          <Text style={styles.bullet}>• Harceler d'autres utilisateurs</Text>
          <Text style={styles.bullet}>
            • Tenter de compromettre la sécurité de la plateforme
          </Text>
          <Text style={styles.bullet}>
            • Utiliser des robots ou scripts automatisés sans autorisation
          </Text>
          <Text style={styles.bullet}>
            • Violer les droits de propriété intellectuelle
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Propriété intellectuelle</Text>
          <Text style={styles.paragraph}>
            La plateforme O'Ypunu, son code, son design et sa marque sont
            protégés par le droit d'auteur. Le contenu linguistique contribué
            par la communauté est disponible sous licence Creative Commons pour
            favoriser le partage des connaissances linguistiques.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            7. Limitation de responsabilité
          </Text>
          <Text style={styles.paragraph}>
            O'Ypunu est fourni « en l'état ». Nous ne garantissons pas
            l'exactitude du contenu communautaire et ne sommes pas responsables
            des dommages résultant de l'utilisation de la plateforme.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            8. Modification des conditions
          </Text>
          <Text style={styles.paragraph}>
            Nous nous réservons le droit de modifier ces conditions à tout
            moment. Les utilisateurs seront notifiés des changements importants
            par email ou via la plateforme.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question concernant ces conditions d'utilisation,
            contactez-nous à : <Text style={styles.bold}>legal@oypunu.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface.background },
  scrollView: { flex: 1 },
  content: { padding: Spacing[6], paddingBottom: Spacing[12], gap: Spacing[3] },
  title: { ...Typography.styles.headingLarge, marginBottom: Spacing[2] },
  meta: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  paragraph: { ...Typography.styles.bodyMedium, color: Colors.text.primary },
  section: { marginTop: Spacing[4] },
  sectionTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[2],
  },
  subtitle: { ...Typography.styles.labelMedium, marginBottom: Spacing[1] },
  bullet: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
    marginLeft: Spacing[2],
  },
  bold: { fontWeight: "600" },
});
