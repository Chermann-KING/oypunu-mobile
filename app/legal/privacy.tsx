import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "../../src/design-system";

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator
      >
        <Text style={styles.title}>Politique de confidentialité</Text>
        <Text style={styles.meta}>
          Dernière mise à jour : 7 janvier 2025 (v1.0)
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Chez O'Ypunu, nous respectons votre vie privée et nous nous
            engageons à protéger vos données personnelles. Cette politique
            explique comment nous collectons, utilisons et protégeons vos
            informations lorsque vous utilisez notre plateforme de dictionnaire
            multilingue communautaire.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Données que nous collectons
          </Text>
          <Text style={styles.subtitle}>1.1 Informations de compte</Text>
          <Text style={styles.bullet}>• Nom d'utilisateur</Text>
          <Text style={styles.bullet}>• Adresse email</Text>
          <Text style={styles.bullet}>• Langue maternelle (optionnel)</Text>
          <Text style={styles.bullet}>• Mot de passe (crypté)</Text>

          <Text style={styles.subtitle}>1.2 Contributions linguistiques</Text>
          <Text style={styles.bullet}>• Mots et définitions ajoutés</Text>
          <Text style={styles.bullet}>• Traductions proposées</Text>
          <Text style={styles.bullet}>• Commentaires et discussions</Text>
          <Text style={styles.bullet}>• Fichiers audio de prononciation</Text>

          <Text style={styles.subtitle}>1.3 Données d'utilisation</Text>
          <Text style={styles.bullet}>
            • Pages visitées et actions effectuées
          </Text>
          <Text style={styles.bullet}>• Langues consultées</Text>
          <Text style={styles.bullet}>• Fréquence d'utilisation</Text>
          <Text style={styles.bullet}>
            • Adresse IP (anonymisée après 30 jours)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Comment nous utilisons vos données
          </Text>
          <Text style={styles.subtitle}>2.1 Fourniture du service</Text>
          <Text style={styles.bullet}>
            • Gérer votre compte et vos préférences
          </Text>
          <Text style={styles.bullet}>• Afficher vos contributions</Text>
          <Text style={styles.bullet}>
            • Faciliter les interactions communautaires
          </Text>
          <Text style={styles.bullet}>• Personnaliser votre expérience</Text>

          <Text style={styles.subtitle}>2.2 Amélioration du service</Text>
          <Text style={styles.bullet}>
            • Analyser l'utilisation pour améliorer la plateforme
          </Text>
          <Text style={styles.bullet}>
            • Développer de nouvelles fonctionnalités
          </Text>
          <Text style={styles.bullet}>
            • Corriger les bugs et problèmes techniques
          </Text>

          <Text style={styles.subtitle}>2.3 Communication</Text>
          <Text style={styles.bullet}>
            • Notifications importantes sur le service
          </Text>
          <Text style={styles.bullet}>
            • Réponses à vos questions et demandes
          </Text>
          <Text style={styles.bullet}>
            • Newsletter (avec votre consentement)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Partage des données</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons jamais vos données personnelles. Nous pouvons
            partager certaines informations dans les cas suivants :
          </Text>
          <Text style={styles.bullet}>
            • Contenu public : Vos contributions linguistiques sont visibles par
            la communauté
          </Text>
          <Text style={styles.bullet}>
            • Prestataires de services : Hébergement, analytics (avec des
            garanties de protection)
          </Text>
          <Text style={styles.bullet}>
            • Obligations légales : Si requis par la loi ou pour protéger nos
            droits
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Protection des données</Text>
          <Text style={styles.subtitle}>4.1 Mesures de sécurité</Text>
          <Text style={styles.bullet}>• Chiffrement des données sensibles</Text>
          <Text style={styles.bullet}>• Authentification sécurisée</Text>
          <Text style={styles.bullet}>
            • Accès limité aux données par nos équipes
          </Text>
          <Text style={styles.bullet}>
            • Sauvegardes régulières et sécurisées
          </Text>
          <Text style={styles.subtitle}>4.2 Rétention des données</Text>
          <Text style={styles.paragraph}>
            Nous conservons vos données aussi longtemps que nécessaire pour
            fournir nos services et respecter nos obligations légales. Les
            données d'utilisation sont anonymisées après 12 mois.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Vos droits</Text>
          <Text style={styles.paragraph}>
            Conformément au RGPD et aux lois sur la protection des données, vous
            avez le droit de :
          </Text>
          <Text style={styles.bullet}>
            • Accès : Consulter les données que nous détenons sur vous
          </Text>
          <Text style={styles.bullet}>
            • Rectification : Corriger vos informations personnelles
          </Text>
          <Text style={styles.bullet}>
            • Suppression : Demander la suppression de votre compte et données
          </Text>
          <Text style={styles.bullet}>
            • Portabilité : Récupérer vos données dans un format portable
          </Text>
          <Text style={styles.bullet}>
            • Opposition : Vous opposer au traitement de vos données
          </Text>
          <Text style={styles.bullet}>
            • Limitation : Demander la limitation du traitement
          </Text>
          <Text style={styles.paragraph}>
            Pour exercer ces droits, contactez-nous à :{" "}
            <Text style={styles.bold}>privacy@oypunu.com</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Cookies et technologies similaires
          </Text>
          <Text style={styles.subtitle}>6.1 Cookies essentiels</Text>
          <Text style={styles.paragraph}>
            Nécessaires au fonctionnement de la plateforme (authentification,
            préférences).
          </Text>
          <Text style={styles.subtitle}>6.2 Cookies analytiques</Text>
          <Text style={styles.paragraph}>
            Nous utilisons des outils d'analyse pour comprendre l'utilisation de
            notre service (avec votre consentement).
          </Text>
          <Text style={styles.subtitle}>6.3 Gestion des cookies</Text>
          <Text style={styles.paragraph}>
            Vous pouvez gérer vos préférences de cookies dans les paramètres de
            votre navigateur ou via notre centre de préférences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Mineurs</Text>
          <Text style={styles.paragraph}>
            Notre service est destiné aux utilisateurs de 13 ans et plus. Si
            vous avez moins de 16 ans, vous devez obtenir le consentement de vos
            parents ou tuteurs légaux.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Transferts internationaux</Text>
          <Text style={styles.paragraph}>
            Vos données peuvent être traitées dans des pays en dehors de l'UE.
            Nous nous assurons que ces transferts respectent les normes de
            protection européennes (clauses contractuelles types, décisions
            d'adéquation).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            9. Modifications de cette politique
          </Text>
          <Text style={styles.paragraph}>
            Nous pouvons mettre à jour cette politique de confidentialité. Les
            changements importants vous seront notifiés par email ou via la
            plateforme au moins 30 jours avant leur entrée en vigueur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact</Text>
          <Text style={styles.paragraph}>
            Responsable de la protection des données :
          </Text>
          <Text style={styles.paragraph}>
            Email : <Text style={styles.bold}>privacy@oypunu.com</Text>
          </Text>
          <Text style={styles.paragraph}>
            Pour toute réclamation, vous pouvez également contacter la CNIL
            (Commission Nationale de l'Informatique et des Libertés).
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
  meta: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing[3],
  },
  title: { ...Typography.styles.headingLarge, marginBottom: Spacing[2] },
  subtitle: { ...Typography.styles.labelMedium, marginBottom: Spacing[1] },
  bullet: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
    marginLeft: Spacing[2],
  },
  bold: { fontWeight: "600" },
  paragraph: { ...Typography.styles.bodyMedium, color: Colors.text.primary },
  section: { marginTop: Spacing[4] },
  sectionTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[2],
  },
});
