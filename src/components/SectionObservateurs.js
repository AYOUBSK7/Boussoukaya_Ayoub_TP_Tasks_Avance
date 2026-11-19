// Section « Observateurs » : personnes qui suivent la tâche (nom + e-mail).
// Un observateur reçoit une notification à chaque nouveau commentaire de la tâche
// (si son e-mail est celui indiqué dans le Profil de son application).
// On peut ajouter, modifier (✏️) et supprimer (🗑) un observateur.
// Le bouton « Prévenir » ouvre l'application e-mail avec tous les observateurs.
import React, { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Section, { MiniBouton } from './Section';
import { useTasks } from '../context/TaskContext';
import { useProfil } from '../context/ProfilContext';
import { COLORS, RADIUS, STATUTS } from '../constants/theme';
import { confirmer, genererId } from '../utils/helpers';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initiales pour l'avatar (ex : « Ayoub Boussoukaya » → « AB »)
const initiales = (nom) => nom.split(' ').filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('');

export default function SectionObservateurs({ tache }) {
  const { modifierTache } = useTasks();
  const { profil, complet } = useProfil();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enEdition, setEnEdition] = useState(null); // id de l'observateur modifié (null = ajout)
  const observateurs = tache.observateurs ?? [];
  const jeSuis = observateurs.some((o) => o.email === profil.email);

  // Bouton rapide : m'ajouter moi-même comme observateur
  const mAjouter = () =>
    modifierTache(tache.id, {
      observateurs: [...observateurs, { id: genererId(), nom: profil.nom, email: profil.email }],
    });

  const vider = () => {
    setNom('');
    setEmail('');
    setErreur(null);
    setEnEdition(null);
  };

  // Ajout OU modification selon enEdition
  const enregistrer = () => {
    const e = email.trim().toLowerCase();
    if (nom.trim().length < 2) return setErreur('Le nom est obligatoire.');
    if (!EMAIL.test(e)) return setErreur('E-mail invalide.');
    if (observateurs.some((o) => o.email === e && o.id !== enEdition)) {
      return setErreur('Cet e-mail est déjà dans la liste.');
    }
    const liste = enEdition
      ? observateurs.map((o) => (o.id === enEdition ? { ...o, nom: nom.trim(), email: e } : o)) // UPDATE
      : [...observateurs, { id: genererId(), nom: nom.trim(), email: e }];                     // CREATE
    modifierTache(tache.id, { observateurs: liste });
    vider();
  };

  const modifier = (o) => {
    setEnEdition(o.id);
    setNom(o.nom);
    setEmail(o.email);
    setErreur(null);
  };

  const supprimer = (o) =>
    confirmer('Supprimer l’observateur', `Supprimer ${o.nom} ?`, () => {
      modifierTache(tache.id, { observateurs: observateurs.filter((x) => x.id !== o.id) }); // DELETE
      if (enEdition === o.id) vider();
    });

  // E-mail à tous les observateurs avec l'état de la tâche
  const prevenir = () => {
    const a = observateurs.map((o) => o.email).join(',');
    const sujet = encodeURIComponent(`Tâche : ${tache.titre}`);
    const corps = encodeURIComponent(
      `Bonjour,\n\nVous suivez la tâche « ${tache.titre} ».\nStatut : ${STATUTS[tache.statut].label}\n\n${tache.description || ''}`
    );
    Linking.openURL(`mailto:${a}?subject=${sujet}&body=${corps}`);
  };

  return (
    <Section titre={`Observateurs (${observateurs.length})`} icon="eye-outline"
      droite={observateurs.length > 0 && (
        <MiniBouton icon="mail-outline" label="Prévenir" onPress={prevenir} />
      )}>
      {observateurs.length === 0 && <Text style={styles.gris}>Personne ne suit cette tâche.</Text>}
      {complet && !jeSuis && (
        <MiniBouton icon="eye-outline" label="Suivre cette tâche (m’ajouter)" onPress={mAjouter} />
      )}

      {observateurs.map((o) => (
        <View key={o.id} style={[styles.personne, enEdition === o.id && styles.personneActive]}>
          <View style={styles.avatar}><Text style={styles.initiales}>{initiales(o.nom)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{o.nom}</Text>
            <Text style={styles.gris}>{o.email}</Text>
          </View>
          <Pressable onPress={() => modifier(o)} hitSlop={8} style={styles.action}
            accessibilityLabel={`Modifier ${o.nom}`}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </Pressable>
          <Pressable onPress={() => supprimer(o)} hitSlop={8} style={styles.action}
            accessibilityLabel={`Supprimer ${o.nom}`}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </Pressable>
        </View>
      ))}

      {/* Formulaire : ajout ou modification */}
      <View style={styles.formulaire}>
        <Text style={styles.sousTitre}>{enEdition ? 'Modifier l’observateur' : 'Nouvel observateur'}</Text>
        <TextInput style={styles.champ} value={nom} onChangeText={setNom}
          placeholder="Nom" placeholderTextColor="#94A3B8" />
        <TextInput style={styles.champ} value={email} onChangeText={setEmail}
          placeholder="E-mail" placeholderTextColor="#94A3B8"
          keyboardType="email-address" autoCapitalize="none" />
        {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
        <View style={styles.boutons}>
          <MiniBouton icon={enEdition ? 'checkmark' : 'person-add-outline'}
            label={enEdition ? 'Enregistrer les modifications' : 'Ajouter un observateur'}
            color={enEdition ? COLORS.success : COLORS.primary} onPress={enregistrer} />
          {!!enEdition && <MiniBouton icon="close" label="Annuler" color={COLORS.textLight} onPress={vider} />}
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  gris: { color: COLORS.textLight, fontSize: 13 },
  personne: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, padding: 8,
  },
  personneActive: { borderWidth: 1.5, borderColor: COLORS.success },
  avatar: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  initiales: { color: COLORS.primary, fontWeight: '800' },
  nom: { fontWeight: '700', color: COLORS.text, fontSize: 14.5 },
  action: { padding: 6, borderRadius: 10, backgroundColor: '#fff' },
  formulaire: { gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  sousTitre: { fontWeight: '800', color: COLORS.text, fontSize: 13.5 },
  champ: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: COLORS.text, outlineStyle: 'none',
  },
  boutons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
});
