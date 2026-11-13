// Section « Observateurs » : personnes qui suivent la tâche (nom + e-mail).
// Le bouton « Prévenir » ouvre l'application e-mail avec tous les observateurs.
import React, { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Section, { MiniBouton } from './Section';
import { useTasks } from '../context/TaskContext';
import { COLORS, RADIUS, STATUTS } from '../constants/theme';
import { confirmer, genererId } from '../utils/helpers';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initiales pour l'avatar (ex : « Ayoub Boussoukaya » → « AB »)
const initiales = (nom) => nom.split(' ').filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('');

export default function SectionObservateurs({ tache }) {
  const { modifierTache } = useTasks();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState(null);
  const observateurs = tache.observateurs ?? [];

  const ajouter = () => {
    const e = email.trim().toLowerCase();
    if (nom.trim().length < 2) return setErreur('Le nom est obligatoire.');
    if (!EMAIL.test(e)) return setErreur('E-mail invalide.');
    if (observateurs.some((o) => o.email === e)) return setErreur('Cet observateur existe déjà.');
    modifierTache(tache.id, { observateurs: [...observateurs, { id: genererId(), nom: nom.trim(), email: e }] });
    setNom('');
    setEmail('');
    setErreur(null);
  };

  const retirer = (o) =>
    confirmer('Retirer l’observateur', `Retirer ${o.nom} ?`, () =>
      modifierTache(tache.id, { observateurs: observateurs.filter((x) => x.id !== o.id) }));

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

      {observateurs.map((o) => (
        <View key={o.id} style={styles.personne}>
          <View style={styles.avatar}><Text style={styles.initiales}>{initiales(o.nom)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{o.nom}</Text>
            <Text style={styles.gris}>{o.email}</Text>
          </View>
          <Pressable onPress={() => retirer(o)} hitSlop={10}>
            <Ionicons name="close-circle" size={22} color="#CBD5E1" />
          </Pressable>
        </View>
      ))}

      {/* Formulaire d'ajout */}
      <View style={styles.formulaire}>
        <TextInput style={styles.champ} value={nom} onChangeText={setNom}
          placeholder="Nom" placeholderTextColor="#94A3B8" />
        <TextInput style={styles.champ} value={email} onChangeText={setEmail}
          placeholder="E-mail" placeholderTextColor="#94A3B8"
          keyboardType="email-address" autoCapitalize="none" />
        {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
        <MiniBouton icon="person-add-outline" label="Ajouter un observateur" onPress={ajouter} />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  gris: { color: COLORS.textLight, fontSize: 13 },
  personne: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  initiales: { color: COLORS.primary, fontWeight: '800' },
  nom: { fontWeight: '700', color: COLORS.text, fontSize: 14.5 },
  formulaire: { gap: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  champ: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: COLORS.text, outlineStyle: 'none',
  },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
});
