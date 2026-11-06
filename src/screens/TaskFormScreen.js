// Partie 3 — Formulaire et opérations CRUD
// Partie 4 — Écran 4 : Formulaire
// Le MÊME composant sert à l'ajout (route "AddTask") et à la modification (route "EditTask").
// Si on reçoit un "id" dans route.params → mode modification, sinon → mode ajout.
import React, { useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChipGroup from '../components/ChipGroup';
import GradientButton from '../components/GradientButton';
import { useTasks } from '../context/TaskContext';
import { COLORS, PRIORITES, RADIUS, SHADOW, STATUTS } from '../constants/theme';
import { confirmer } from '../utils/helpers';

// Transforme { faible: {...}, ... } en [{ key: 'faible', ... }, ...] pour ChipGroup
const OPTIONS_PRIORITE = Object.entries(PRIORITES).map(([key, v]) => ({ key, ...v }));
const OPTIONS_STATUT = Object.entries(STATUTS).map(([key, v]) => ({ key, ...v }));

export default function TaskFormScreen({ route, navigation }) {
  const { getTache, ajouterTache, modifierTache, supprimerTache } = useTasks();
  const id = route.params?.id;
  const tacheExistante = id ? getTache(id) : null;
  const modeModification = !!tacheExistante;

  // Champs contrôlés : chaque champ est lié à un état
  const [titre, setTitre] = useState(tacheExistante?.titre ?? '');
  const [description, setDescription] = useState(tacheExistante?.description ?? '');
  const [priorite, setPriorite] = useState(tacheExistante?.priorite ?? 'moyenne');
  const [statut, setStatut] = useState(tacheExistante?.statut ?? 'a_faire');
  const [erreurs, setErreurs] = useState({});
  const [champActif, setChampActif] = useState(null); // pour la bordure de focus

  useLayoutEffect(() => {
    navigation.setOptions({ title: modeModification ? 'Modifier une tâche' : 'Ajouter une tâche' });
  }, [navigation, modeModification]);

  // Validation des champs
  const valider = () => {
    const e = {};
    if (titre.trim().length === 0) e.titre = 'Le titre est obligatoire.';
    else if (titre.trim().length < 3) e.titre = 'Le titre doit contenir au moins 3 caractères.';
    if (description.length > 200) e.description = 'La description ne doit pas dépasser 200 caractères.';
    setErreurs(e);
    return Object.keys(e).length === 0; // true si aucune erreur
  };

  const onEnregistrer = () => {
    if (!valider()) return;
    if (modeModification) {
      modifierTache(id, { titre: titre.trim(), description: description.trim(), priorite, statut }); // UPDATE
    } else {
      ajouterTache({ titre, description, priorite }); // CREATE
      navigation.navigate('TaskList'); // après un ajout : retour direct à la liste
      return;
    }
    navigation.goBack(); // après une modification : retour aux détails
  };

  const onSupprimer = () =>
    confirmer('Supprimer la tâche', 'Cette action est définitive.', () => {
      supprimerTache(id); // DELETE
      navigation.popToTop(); // retour à la liste (l'écran Détails n'a plus de tâche)
    });

  // Style d'un champ selon son état (normal / focus / erreur)
  const styleChamp = (nom) => [
    styles.champ,
    champActif === nom && styles.champFocus,
    erreurs[nom] && styles.champErreur,
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled">
        <View style={styles.carte}>
          <Text style={styles.label}>Titre <Text style={{ color: COLORS.danger }}>*</Text></Text>
          <TextInput
            style={styleChamp('titre')}
            placeholder="Ex. Préparer la présentation"
            placeholderTextColor="#94A3B8"
            value={titre}
            onFocus={() => setChampActif('titre')}
            onBlur={() => setChampActif(null)}
            onChangeText={(t) => { setTitre(t); if (erreurs.titre) setErreurs({ ...erreurs, titre: null }); }}
          />
          {!!erreurs.titre && (
            <View style={styles.ligneErreur}>
              <Ionicons name="alert-circle" size={15} color={COLORS.danger} />
              <Text style={styles.erreur}>{erreurs.titre}</Text>
            </View>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[...styleChamp('description'), styles.zoneTexte]}
            placeholder="Détails de la tâche..."
            placeholderTextColor="#94A3B8"
            value={description}
            onFocus={() => setChampActif('description')}
            onBlur={() => setChampActif(null)}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          <Text style={[styles.compteur, description.length > 200 && { color: COLORS.danger }]}>
            {description.length}/200
          </Text>
          {!!erreurs.description && (
            <View style={styles.ligneErreur}>
              <Ionicons name="alert-circle" size={15} color={COLORS.danger} />
              <Text style={styles.erreur}>{erreurs.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.carte}>
          <Text style={styles.label}>Priorité</Text>
          <ChipGroup options={OPTIONS_PRIORITE} selected={priorite} onChange={setPriorite} />

          {/* Le statut n'est modifiable qu'en mode modification */}
          {modeModification && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Statut</Text>
              <ChipGroup options={OPTIONS_STATUT} selected={statut} onChange={setStatut} />
            </>
          )}
        </View>

        <GradientButton title="Enregistrer" icon="checkmark" onPress={onEnregistrer} />

        {modeModification && (
          <GradientButton variant="soft" color={COLORS.danger} title="Supprimer"
            icon="trash-outline" onPress={onSupprimer} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  contenu: { padding: 18, gap: 14, paddingBottom: 40 },
  carte: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, ...SHADOW },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 8, marginTop: 4 },
  champ: {
    backgroundColor: COLORS.input, borderWidth: 1.5, borderColor: 'transparent', borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.text, marginBottom: 6,
    outlineStyle: 'none',
  },
  champFocus: { borderColor: COLORS.primary, backgroundColor: '#fff' },
  champErreur: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerSoft + '66' },
  zoneTexte: { minHeight: 110 },
  ligneErreur: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  compteur: { alignSelf: 'flex-end', color: '#94A3B8', fontSize: 12 },
});
