import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Input } from "../design-system/components";
import { Colors, Spacing, Typography } from "../design-system";
import { useRouter } from "expo-router";
import {
  useDictionary,
  useDictionaryContributor,
} from "../core/hooks/useDictionary";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import {
  Mic,
  FileAudio,
  Play,
  Square,
  Upload,
  X,
  Plus,
} from "lucide-react-native";
import type { CreateWordData } from "../core/interfaces/IDictionaryService";

type RecordingRef = {
  recording: Audio.Recording | null;
};

export const AddWordScreen: React.FC<{ onBack?: () => void }> = ({
  onBack,
}) => {
  const router = useRouter();
  // Form state
  const [word, setWord] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [etymology, setEtymology] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [isPosModalVisible, setPosModalVisible] = useState(false);
  const openPosPicker = useCallback(() => setPosModalVisible(true), []);
  const closePosPicker = useCallback(() => setPosModalVisible(false), []);
  const PARTS_OF_SPEECH = useMemo(
    () => [
      { value: "noun", label: "Nom" },
      { value: "properNoun", label: "Nom propre" },
      { value: "verb", label: "Verbe" },
      { value: "adjective", label: "Adjectif" },
      { value: "adverb", label: "Adverbe" },
      { value: "pronoun", label: "Pronom" },
      { value: "preposition", label: "Préposition" },
      { value: "conjunction", label: "Conjonction" },
      { value: "interjection", label: "Interjection" },
      { value: "determiner", label: "Déterminant" },
      { value: "numeral", label: "Numéral" },
      { value: "auxiliaryVerb", label: "Verbe auxiliaire" },
      { value: "particle", label: "Particule" },
    ],
    []
  );
  const partOfSpeechLabel = useMemo(
    () => PARTS_OF_SPEECH.find((o) => o.value === partOfSpeech)?.label || "",
    [PARTS_OF_SPEECH, partOfSpeech]
  );

  // Audio state
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handleClose sera déclaré après isDirty

  // Services
  const {
    loadLanguages,
    languages,
    isLoadingLanguages,
    loadCategories,
    categories,
    isLoadingCategories,
    getApprovedWordCount,
  } = useDictionary();
  const { createWord, uploadWordAudio, createCategory } =
    useDictionaryContributor();

  const didInit = useRef(false);
  useEffect(() => {
    // Charger les listes de base (une seule fois)
    if (didInit.current) return;
    didInit.current = true;
    (async () => {
      try {
        await loadLanguages();
      } catch (e) {
        console.warn("[AddWordScreen] Init lists failed:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Langues approuvées (status 'active')
  const activeLanguages = useMemo(() => {
    try {
      const normalize = (l: any) => ({
        ...l,
        id:
          l?.id ||
          l?._id ||
          l?.code ||
          l?.iso639_3 ||
          l?.iso639_1 ||
          l?.iso639_2,
        status: l?.status,
        systemStatus: l?.systemStatus,
        isVisible: l?.isVisible,
        approvedAt: l?.approvedAt,
      });
      const isApproved = (l: any) =>
        l?.systemStatus === "active" ||
        l?.status === "active" ||
        !!l?.approvedAt === true;
      const isShown = (l: any) => l?.isVisible !== false; // Par défaut visible si non spécifié

      return (languages || [])
        .map(normalize)
        .filter((l: any) => !!l.id)
        .filter((l: any) => isApproved(l) && isShown(l));
    } catch {
      return [] as any[];
    }
  }, [languages]);

  // Sélecteur de langue (modal)
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const [languageLabel, setLanguageLabel] = useState("");
  const openLanguagePicker = useCallback(() => setLangModalVisible(true), []);
  const closeLanguagePicker = useCallback(() => setLangModalVisible(false), []);
  const handleSelectLanguage = useCallback(
    (lang: any) => {
      const id = lang?.id || lang?._id;
      if (!id) return;
      setLanguage(id);
      const code = lang?.iso639_3 || lang?.iso639_1 || lang?.iso639_2;
      const base = lang?.name || "(Sans nom)";
      // Initial label sans parenthèses pendant le fetch
      setLanguageLabel(base + (code ? ` • ${code}` : ""));
      setLangModalVisible(false);

      // Clé de langue pour le backend (préférer le code ISO, sinon l'id)
      const languageKey = code || id;
      // Capturer l'id sélectionné pour éviter un update si l'utilisateur change rapidement
      const selectedId = id;
      (async () => {
        try {
          const count = await getApprovedWordCount(languageKey);
          // Vérifier que la langue n'a pas changé entre-temps
          if (selectedId === (id as string)) {
            setLanguageLabel(`${base} (${count})` + (code ? ` • ${code}` : ""));
          }
        } catch {
          // En cas d'erreur, garder le label de base
        }
      })();
    },
    [getApprovedWordCount]
  );

  // Catégorie dépendante de la langue (facultatif)
  const [categoryLabel, setCategoryLabel] = useState("");
  const [isCatModalVisible, setCatModalVisible] = useState(false);
  const [isProposingCategory, setIsProposingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const openCategoryPicker = useCallback(() => setCatModalVisible(true), []);
  const closeCategoryPicker = useCallback(() => setCatModalVisible(false), []);
  const handleSelectCategory = useCallback((cat: any) => {
    const id = cat?.id || cat?._id;
    if (!id) return;
    setCategory(String(id));
    setCategoryLabel(cat?.name || "");
    setCatModalVisible(false);
  }, []);

  const handleStartProposeCategory = useCallback(() => {
    if (!language) {
      Alert.alert(
        "Langue requise",
        "Sélectionnez une langue avant de proposer une catégorie."
      );
      return;
    }
    setIsProposingCategory(true);
  }, [language]);

  const handleCancelProposeCategory = useCallback(() => {
    setIsProposingCategory(false);
    setNewCategoryName("");
    setNewCategoryDesc("");
  }, []);

  const handleCreateCategory = useCallback(async () => {
    if (!language) {
      Alert.alert(
        "Langue requise",
        "Sélectionnez une langue avant de proposer une catégorie."
      );
      return;
    }
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert("Nom requis", "Veuillez saisir un nom de catégorie.");
      return;
    }
    setIsCreatingCategory(true);
    try {
      const created = await createCategory({
        name,
        description: newCategoryDesc.trim() || "",
        language,
      } as any);
      // Rafraîchir les catégories
      const refreshed = await loadCategories(language);
      const createdId = (created as any)?.id || (created as any)?._id;
      const isVisibleNow = !!refreshed.find(
        (c: any) => String(c?.id || c?._id) === String(createdId)
      );

      if (isVisibleNow && createdId) {
        // Immédiatement disponible
        setCategory(String(createdId));
        setCategoryLabel((created as any)?.name || name);
        setIsProposingCategory(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
        setCatModalVisible(false);
        Alert.alert(
          "Catégorie créée",
          "Votre catégorie est disponible et a été sélectionnée."
        );
      } else {
        // Soumise à approbation, non listée tout de suite
        setIsProposingCategory(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
        Alert.alert(
          "Proposition envoyée",
          "Votre catégorie a été soumise pour approbation. Elle apparaîtra après validation."
        );
      }
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de créer la catégorie.");
    } finally {
      setIsCreatingCategory(false);
    }
  }, [
    language,
    newCategoryName,
    newCategoryDesc,
    createCategory,
    loadCategories,
  ]);

  const lastLangLoadedRef = useRef<string | null>(null);
  useEffect(() => {
    // Reset catégorie quand la langue change
    setCategory("");
    setCategoryLabel("");
    if (!language) return;
    if (lastLangLoadedRef.current === language) return;
    lastLangLoadedRef.current = language;
    (async () => {
      try {
        await loadCategories(language);
      } catch (e) {
        console.warn("[AddWordScreen] loadCategories failed", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Multi-sens restructuré
  type SenseForm = {
    definition: string; // Une seule définition par sens
    examplesText: string; // séparées par # ou \n
    synonymsText: string; // séparées par #
    antonymsText: string; // séparées par #
  };
  const [senses, setSenses] = useState<SenseForm[]>([]);
  const addSense = useCallback(() => {
    setSenses((prev) => [
      ...prev,
      {
        definition: "",
        examplesText: "",
        synonymsText: "",
        antonymsText: "",
      },
    ]);
  }, []);
  const removeSense = useCallback((index: number) => {
    setSenses((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const updateSense = useCallback(
    (index: number, patch: Partial<SenseForm>) => {
      setSenses((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
      );
    },
    []
  );

  // Détection de modifications (formulaire “sale”) – après la déclaration de senses
  const isDirty = useMemo(() => {
    const hasSenseContent = senses.some(
      (s) =>
        s.definition.trim().length > 0 ||
        s.examplesText.trim().length > 0 ||
        s.synonymsText.trim().length > 0 ||
        s.antonymsText.trim().length > 0
    );
    return (
      !!word.trim() ||
      !!language ||
      !!category ||
      !!pronunciation.trim() ||
      !!etymology.trim() ||
      !!partOfSpeech ||
      hasSenseContent ||
      !!pickedFile ||
      !!recording
    );
  }, [
    word,
    language,
    category,
    pronunciation,
    etymology,
    partOfSpeech,
    senses,
    pickedFile,
    recording,
  ]);

  const handleClose = useCallback(() => {
    const goBack = () => {
      if (onBack) onBack();
      else router.back();
    };
    if (!isDirty) return goBack();
    Alert.alert(
      "Abandonner l'ajout ?",
      "Vos modifications non enregistrées seront perdues.",
      [
        { text: "Continuer", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: goBack },
      ]
    );
  }, [isDirty, onBack, router]);

  // Split util: '#' ou nouvelle ligne
  const splitList = useCallback((text: string): string[] => {
    return text
      .split(/[#\n]/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }, []);

  const resetAudio = useCallback(async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {}
      setRecording(null);
    }
    setPickedFile(null);
    setIsPlaying(false);
  }, [sound, recording]);

  const handlePickAudio = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      // Pour RN/Expo, fournir un objet { uri, name, type } compatible FormData
      const fileName = asset.name ?? "audio.m4a";
      const fileType = asset.mimeType ?? "audio/m4a";
      const rnFile = { uri: asset.uri, name: fileName, type: fileType } as any;
      await resetAudio();
      setPickedFile(rnFile as unknown as File);
      // Basculer en mode lecture et tenter une lecture immédiate pour confirmer
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: asset.uri,
        });
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if ("didJustFinish" in status && status.didJustFinish) {
            setIsPlaying(false);
          } else if (status.isPlaying) {
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        });
        await newSound.playAsync();
        setIsPlaying(true);
      } catch (preloadErr) {
        console.warn("[AddWordScreen] Preview picked audio failed", preloadErr);
      }
      Alert.alert("Fichier sélectionné", fileName);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sélectionner le fichier audio.");
    }
  }, [resetAudio]);

  const requestMicPermission = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "Autorisez le micro pour enregistrer une prononciation."
      );
      return false;
    }
    return true;
  }, []);

  const handleStartRecording = useCallback(async () => {
    const ok = await requestMicPermission();
    if (!ok) return;
    try {
      await resetAudio();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de démarrer l'enregistrement.");
    }
  }, [requestMicPermission, resetAudio]);

  const handleStopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;
      // Basculer en mode lecture et tenter de précharger le son
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const rnFile = { uri, name: "recording.m4a", type: "audio/m4a" } as any;
      setPickedFile(rnFile as unknown as File);
      try {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if ("didJustFinish" in status && status.didJustFinish) {
            setIsPlaying(false);
          } else if (status.isPlaying) {
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        });
        // Auto-play pour confirmer que l'enregistrement est lisible
        await newSound.playAsync();
        setIsPlaying(true);
      } catch (preloadErr) {
        console.warn(
          "[AddWordScreen] Preload recorded sound failed",
          preloadErr
        );
      }
      setRecording(null);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'arrêter l'enregistrement.");
    }
  }, [recording, sound]);

  const handlePlay = useCallback(async () => {
    try {
      if (!pickedFile) return;
      const uri = (pickedFile as any)?.uri as string | undefined;
      if (!uri) return;
      if (sound) {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          try {
            await sound.unloadAsync();
          } catch {}
          const created = await Audio.Sound.createAsync({ uri });
          setSound(created.sound);
          await created.sound.playAsync();
          setIsPlaying(true);
          return;
        } else {
          await sound.replayAsync();
          setIsPlaying(true);
          return;
        }
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if ("didJustFinish" in status && status.didJustFinish) {
          setIsPlaying(false);
        } else if (status.isPlaying) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      });
      await newSound.playAsync();
      setIsPlaying(true);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de lire l'audio.");
    }
  }, [pickedFile, sound]);

  const handleStopPlay = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      // cleanup
      resetAudio();
    };
  }, [resetAudio]);

  // Validation mise à jour
  const isFormValid = useMemo(() => {
    if (!word.trim() || !language.trim()) return false;
    if (!partOfSpeech.trim()) return false;
    // Au moins un sens avec une définition
    const hasSenseDefs = senses.some((s) => s.definition.trim().length > 0);
    return hasSenseDefs;
  }, [word, language, partOfSpeech, senses]);

  // HandleSubmit mis à jour
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert(
        "Champs requis",
        "Remplissez au moins le mot, la langue, un sens avec sa définition et la classe grammaticale."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateWordData = {
        word: word.trim(),
        language: language.trim(),
        category: category.trim() || undefined,
        pronunciation: pronunciation.trim() || undefined,
        etymology: etymology.trim() || undefined,
        partOfSpeech: partOfSpeech.trim(),
        audioFile: pickedFile ?? undefined,
      };

      // Construire meanings depuis les senses
      const builtMeanings = senses
        .map((s) => {
          const def = s.definition.trim();
          if (!def) return null;
          const exs = splitList(s.examplesText);
          const syns = splitList(s.synonymsText);
          const ants = splitList(s.antonymsText);
          return {
            partOfSpeech: partOfSpeech.trim(), // Global au mot
            definitions: [{ definition: def, examples: exs }], // Une définition par sens
            synonyms: syns,
            antonyms: ants,
          };
        })
        .filter(Boolean) as NonNullable<CreateWordData["meanings"]>;

      if (builtMeanings.length > 0) {
        payload.meanings = builtMeanings;
      }

      const created = await createWord(payload);
      Alert.alert("Succès", `"${created.word}" a été créé.`, [
        { text: "OK", onPress: () => onBack?.() },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de créer le mot.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    word,
    language,
    category,
    pronunciation,
    etymology,
    partOfSpeech,
    pickedFile,
    senses,
    splitList,
    createWord,
    onBack,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Ajouter un mot</Text>
          <TouchableOpacity
            onPress={handleClose}
            accessibilityLabel="Fermer"
            style={styles.closeButton}
          >
            <X size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Renseignez les informations et ajoutez une prononciation.
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Informations de base */}
          <View>
            <Card>
              <Input
                label="Mot (obligatoire)"
                value={word}
                onChangeText={setWord}
                placeholder="Ex: Mbolo"
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={openLanguagePicker}
                activeOpacity={0.7}
              >
                <Input
                  label="Langue (obligatoire)"
                  value={languageLabel || (language ? language : "")}
                  onChangeText={() => {}}
                  placeholder={
                    isLoadingLanguages
                      ? "Chargement..."
                      : "Sélectionner une langue"
                  }
                  autoCapitalize="none"
                  disabled
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openCategoryPicker}
                activeOpacity={0.7}
              >
                <Input
                  label="Catégorie (facultatif)"
                  value={categoryLabel || (category ? category : "")}
                  onChangeText={() => {}}
                  placeholder={
                    !language
                      ? "Sélectionner une langue d'abord"
                      : isLoadingCategories
                      ? "Chargement..."
                      : "Sélectionner une catégorie"
                  }
                  autoCapitalize="none"
                  disabled
                />
              </TouchableOpacity>

              <Input
                label="Prononciation (facultatif)"
                value={pronunciation}
                onChangeText={setPronunciation}
                placeholder="/m.bɔ̀.lo/"
                autoCapitalize="none"
              />

              {/* Section audio */}
              <View style={styles.cardWrapper}>
                <Card>
                  <Text style={styles.sectionTitle}>Prononciation vocale</Text>
                  <View style={styles.audioRow}>
                    <View style={styles.audioButton}>
                      <Button
                        title="Fichier"
                        onPress={handlePickAudio}
                        variant="secondary"
                        size="small"
                        icon={
                          <FileAudio size={16} color={Colors.text.primary} />
                        }
                      />
                    </View>
                    <View style={styles.audioButton}>
                      {recording ? (
                        <Button
                          title="Arrêter"
                          onPress={handleStopRecording}
                          variant="tertiary"
                          size="small"
                          icon={
                            <Square size={16} color={Colors.text.primary} />
                          }
                        />
                      ) : (
                        <Button
                          title="Enregistrer"
                          onPress={handleStartRecording}
                          variant="primary"
                          size="small"
                          icon={<Mic size={16} color={Colors.text.onPrimary} />}
                        />
                      )}
                    </View>
                    <View style={styles.audioButton}>
                      <Button
                        title={isPlaying ? "Stop" : "Lecture"}
                        onPress={isPlaying ? handleStopPlay : handlePlay}
                        variant="secondary"
                        size="small"
                        icon={<Play size={16} color={Colors.text.primary} />}
                        disabled={!pickedFile && !sound}
                      />
                    </View>
                    {!!pickedFile && (
                      <TouchableOpacity
                        onPress={resetAudio}
                        style={styles.clearBadge}
                      >
                        <X size={14} color={Colors.text.onPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.hint}>
                    Choisissez un fichier audio ou enregistrez directement. Vous
                    pourrez écouter avant d'envoyer.
                  </Text>
                </Card>
              </View>

              <Input
                label="Étymologie (facultatif)"
                value={etymology}
                onChangeText={setEtymology}
                placeholder="Origine et histoire du mot"
                multiline
              />

              <TouchableOpacity onPress={openPosPicker} activeOpacity={0.7}>
                <Input
                  label="Classe grammaticale (obligatoire)"
                  value={
                    partOfSpeechLabel || (partOfSpeech ? partOfSpeech : "")
                  }
                  onChangeText={() => {}}
                  placeholder="Sélectionner la classe grammaticale"
                  disabled
                  autoCapitalize="none"
                />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Section sens et définitions */}
          <View style={styles.cardWrapper}>
            <Card>
              <Text style={styles.sectionTitle}>
                Sens et définitions (1 obligatoire)
              </Text>
              <Text style={[styles.hint, { marginBottom: Spacing[2] }]}>
                Ajoutez au moins un sens avec sa définition. Vous pouvez ajouter
                plusieurs exemples, synonymes et antonymes pour chaque sens.
              </Text>

              {senses.map((s, index) => (
                <View
                  key={`sense-${index}`}
                  style={{ marginBottom: Spacing[3] }}
                >
                  <Text style={styles.langCode}>Sens {index + 1}</Text>

                  <Input
                    label="Définition (obligatoire)"
                    value={s.definition}
                    onChangeText={(t) => updateSense(index, { definition: t })}
                    placeholder="Expliquez ce que signifie le mot dans ce contexte"
                    multiline
                  />

                  <Input
                    label="Exemples (séparés par # ou retour à la ligne)"
                    value={s.examplesText}
                    onChangeText={(t) =>
                      updateSense(index, { examplesText: t })
                    }
                    placeholder="Exemple 1#Exemple 2"
                    multiline
                  />

                  <Input
                    label="Synonymes (séparés par #)"
                    value={s.synonymsText}
                    onChangeText={(t) =>
                      updateSense(index, { synonymsText: t })
                    }
                    placeholder="mot1#mot2#mot3"
                    autoCapitalize="none"
                  />

                  <Input
                    label="Antonymes (séparés par #)"
                    value={s.antonymsText}
                    onChangeText={(t) =>
                      updateSense(index, { antonymsText: t })
                    }
                    placeholder="mot1#mot2#mot3"
                    autoCapitalize="none"
                  />

                  <View style={{ alignItems: "flex-end" }}>
                    <Button
                      title="Supprimer ce sens"
                      onPress={() => removeSense(index)}
                      variant="tertiary"
                      size="small"
                    />
                  </View>
                </View>
              ))}

              <Button
                title="Ajouter un sens"
                onPress={addSense}
                variant="secondary"
              />
            </Card>
          </View>

          {/* Soumettre le mot */}
          <View style={styles.footer}>
            <Button
              title="Créer le mot"
              onPress={handleSubmit}
              variant="primary"
              disabled={!isFormValid || isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de sélection de langue */}
      <Modal
        visible={isLangModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeLanguagePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choisir une langue</Text>
            {isLoadingLanguages ? (
              <Text style={styles.hint}>Chargement des langues…</Text>
            ) : activeLanguages.length === 0 ? (
              <Text style={styles.hint}>
                Aucune langue approuvée disponible.
              </Text>
            ) : (
              <FlatList
                data={activeLanguages}
                keyExtractor={(item: any) => String(item.id)}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const code =
                    item?.iso639_3 ||
                    item?.iso639_1 ||
                    item?.iso639_2 ||
                    item?.code;
                  return (
                    <TouchableOpacity
                      style={styles.langItem}
                      onPress={() => handleSelectLanguage(item)}
                    >
                      <Text style={styles.langName}>
                        {item.flagEmoji ? `${item.flagEmoji} ` : ""}
                        {item.name}
                        {code ? ` (${code})` : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                style={{ maxHeight: 380 }}
              />
            )}
            <View style={{ marginTop: Spacing[3] }}>
              <Button
                title="Fermer"
                onPress={closeLanguagePicker}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de catégorie */}
      <Modal
        visible={isCatModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCategoryPicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {isProposingCategory
                  ? "Proposer une catégorie"
                  : "Choisir une catégorie"}
              </Text>
              {!isProposingCategory && (
                <Button
                  title="Proposer"
                  onPress={handleStartProposeCategory}
                  variant="secondary"
                  size="small"
                  icon={<Plus size={14} color={Colors.text.primary} />}
                  disabled={!language}
                />
              )}
            </View>
            {!language ? (
              <Text style={styles.hint}>Sélectionnez d'abord une langue.</Text>
            ) : isProposingCategory ? (
              <View>
                <Input
                  label="Nom de la catégorie"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Ex: Animaux, Nourriture…"
                  autoCapitalize="sentences"
                />
                <Input
                  label="Description (facultatif)"
                  value={newCategoryDesc}
                  onChangeText={setNewCategoryDesc}
                  placeholder="Courte description"
                  multiline
                />
                <View
                  style={{
                    flexDirection: "row",
                    gap: Spacing[2],
                    marginTop: Spacing[2],
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Annuler"
                      onPress={handleCancelProposeCategory}
                      variant="tertiary"
                      size="small"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Créer"
                      onPress={handleCreateCategory}
                      variant="primary"
                      size="small"
                      loading={isCreatingCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                    />
                  </View>
                </View>
              </View>
            ) : isLoadingCategories ? (
              <Text style={styles.hint}>Chargement des catégories…</Text>
            ) : (categories || []).length === 0 ? (
              <Text style={styles.hint}>
                Aucune catégorie trouvée (facultatif).
              </Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item: any) => String(item.id || item._id)}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.langItem}
                    onPress={() => handleSelectCategory(item)}
                  >
                    <Text style={styles.langName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 380 }}
              />
            )}
            <View style={{ marginTop: Spacing[3] }}>
              <Button
                title="Fermer"
                onPress={closeCategoryPicker}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de classe grammaticale */}
      <Modal
        visible={isPosModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closePosPicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Choisir la classe grammaticale
              </Text>
            </View>
            <FlatList
              data={PARTS_OF_SPEECH}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langItem}
                  onPress={() => {
                    setPartOfSpeech(item.value);
                    closePosPicker();
                  }}
                >
                  <Text style={styles.langName}>{item.label}</Text>
                  <Text style={styles.langCode}>{item.value}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 380 }}
            />
            <View style={{ marginTop: Spacing[3] }}>
              <Button
                title="Fermer"
                onPress={closePosPicker}
                variant="secondary"
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...Typography.styles.headingLarge,
  },
  closeButton: {
    padding: Spacing[2],
    marginLeft: Spacing[2],
  },
  subtitle: {
    ...Typography.styles.labelMedium,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  content: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[4],
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  cardWrapper: {
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    ...Typography.styles.labelMedium,
    marginBottom: Spacing[2],
  },
  footer: {
    paddingVertical: Spacing[4],
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    flexWrap: "wrap",
  },
  audioButton: {
    flexBasis: "48%",
  },
  hint: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing[2],
  },
  clearBadge: {
    marginLeft: Spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.semantic.error,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.surface.card,
    padding: Spacing[4],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    ...Typography.styles.headingMedium,
    marginBottom: Spacing[2],
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langItem: {
    paddingVertical: Spacing[3],
  },
  langName: {
    ...Typography.styles.bodyMedium,
    color: Colors.text.primary,
  },
  langCode: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: Colors.interactive.default,
    opacity: 0.3,
  },
});

export default AddWordScreen;
