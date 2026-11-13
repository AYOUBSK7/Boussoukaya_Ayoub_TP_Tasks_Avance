// Section « Rappels » :
//  - rappel à une date précise (notification programmée sur le téléphone)
//  - rappel de lieu (« quand je serai au bureau ») choisi sur la carte OpenStreetMap
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Section, { MiniBouton } from './Section';
import BoutonDate from './BoutonDate';
import CarteOSM from './CarteOSM';
import { useTasks } from '../context/TaskContext';
import { COLORS, RADIUS } from '../constants/theme';
import { formaterDateHeure } from '../utils/helpers';

// Raccourcis : maintenant + quelques minutes / heures
const dans = (minutes) => new Date(Date.now() + minutes * 60000);
const demainA9h = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
};

export default function SectionRappels({ tache, navigation }) {
  const { modifierTache } = useTasks();
  const [erreur, setErreur] = useState(null);
  const terminee = tache.statut === 'terminee';
  const lieu = tache.rappelLieu;
  const datePassee = tache.rappelDate && new Date(tache.rappelDate) <= new Date();

  const choisirDate = (date) => {
    if (date <= new Date()) {
      setErreur('Choisissez une date dans le futur.');
      return;
    }
    setErreur(null);
    modifierTache(tache.id, { rappelDate: date.toISOString() });
  };

  return (
    <Section titre="Rappels" icon="notifications-outline">
      {terminee && <Text style={styles.note}>Tâche terminée : les rappels ne sont plus envoyés.</Text>}

      {/* ---- Rappel à une date ---- */}
      <View style={styles.bloc}>
        <View style={styles.ligne}>
          <Ionicons name="alarm-outline" size={20} color={COLORS.warning} />
          <Text style={styles.label}>À une date</Text>
        </View>
        <Text style={styles.valeur}>
          {tache.rappelDate ? formaterDateHeure(tache.rappelDate) : 'Aucun rappel'}
          {datePassee ? ' (passé)' : ''}
        </Text>

        <BoutonDate valeur={tache.rappelDate && !datePassee ? new Date(tache.rappelDate) : dans(60)}
          onChoisir={choisirDate} />
        <View style={styles.boutons}>
          <MiniBouton icon="flash-outline" label="Dans 1 min" color={COLORS.warning} onPress={() => choisirDate(dans(1))} />
          <MiniBouton icon="time-outline" label="Dans 1 h" color={COLORS.warning} onPress={() => choisirDate(dans(60))} />
          <MiniBouton icon="sunny-outline" label="Demain 9 h" color={COLORS.warning} onPress={() => choisirDate(demainA9h())} />
          {!!tache.rappelDate && (
            <MiniBouton icon="close" label="Retirer" color={COLORS.danger}
              onPress={() => modifierTache(tache.id, { rappelDate: null })} />
          )}
        </View>
        {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
      </View>

      <View style={styles.separateur} />

      {/* ---- Rappel de lieu ---- */}
      <View style={styles.bloc}>
        <View style={styles.ligne}>
          <Ionicons name="location-outline" size={20} color={COLORS.success} />
          <Text style={styles.label}>À un lieu</Text>
        </View>
        <Text style={styles.valeur}>
          {lieu ? `${lieu.nom} · zone de ${lieu.rayon} m` : 'Aucun lieu'}
        </Text>

        {lieu && (
          <CarteOSM key={`${lieu.latitude},${lieu.longitude},${lieu.rayon}`}
            position={lieu} rayon={lieu.rayon} lectureSeule hauteur={150} />
        )}

        <View style={styles.boutons}>
          <MiniBouton icon="map-outline" label={lieu ? 'Changer sur la carte' : 'Choisir sur la carte'}
            color={COLORS.success} onPress={() => navigation.navigate('ChoisirLieu', { id: tache.id })} />
          {lieu && (
            <MiniBouton icon="close" label="Retirer" color={COLORS.danger}
              onPress={() => modifierTache(tache.id, { rappelLieu: null })} />
          )}
        </View>
        <Text style={styles.note}>
          Le rappel de lieu fonctionne quand l’application est ouverte (Expo Go).
        </Text>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontWeight: '800', color: COLORS.text, fontSize: 15 },
  valeur: { color: COLORS.text, fontSize: 14.5 },
  boutons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  separateur: { height: 1, backgroundColor: COLORS.border },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  note: {
    color: COLORS.textLight, fontSize: 12, backgroundColor: COLORS.input,
    borderRadius: RADIUS.sm, padding: 8,
  },
});
