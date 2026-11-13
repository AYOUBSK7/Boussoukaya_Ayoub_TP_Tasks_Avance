// Écran « Rappel de lieu » : choisir un point sur la carte OpenStreetMap
// Ex. « Rappelle-moi cette tâche quand je serai au bureau ».
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import CarteOSM from '../components/CarteOSM';
import ChipGroup from '../components/ChipGroup';
import GradientButton from '../components/GradientButton';
import { useTasks } from '../context/TaskContext';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

// Taille de la zone autour du point
const RAYONS = [
  { key: '100', label: '100 m' },
  { key: '200', label: '200 m' },
  { key: '500', label: '500 m' },
  { key: '1000', label: '1 km' },
];

export default function LieuScreen({ route, navigation }) {
  const { id } = route.params;
  const { getTache, modifierTache } = useTasks();
  const tache = getTache(id);
  const lieu = tache?.rappelLieu;

  const carte = useRef(null);
  const [position, setPosition] = useState(lieu ? { latitude: lieu.latitude, longitude: lieu.longitude } : null);
  const [rayon, setRayon] = useState(String(lieu?.rayon ?? 200));
  const [nom, setNom] = useState(lieu?.nom ?? '');
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState(null);

  // Va chercher la position actuelle du téléphone (GPS) et la place sur la carte
  const maPosition = async () => {
    setErreur(null);
    setRecherche(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErreur('Autorisation de localisation refusée.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPosition({ latitude: coords.latitude, longitude: coords.longitude });
      carte.current?.placer(coords.latitude, coords.longitude, Number(rayon));
    } catch (e) {
      setErreur('Position introuvable. Activez la localisation.');
    } finally {
      setRecherche(false);
    }
  };

  // Pas encore de lieu : on centre directement sur la position actuelle
  useEffect(() => {
    if (!lieu) maPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changerRayon = (r) => {
    setRayon(r);
    if (position) carte.current?.placer(position.latitude, position.longitude, Number(r), false);
  };

  const enregistrer = () => {
    if (!position) {
      setErreur('Touchez la carte pour choisir un lieu.');
      return;
    }
    modifierTache(id, {
      rappelLieu: { ...position, rayon: Number(rayon), nom: nom.trim() || 'Lieu choisi' },
    });
    navigation.goBack();
  };

  if (!tache) return null;

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <Text style={styles.aide}>
        Touchez la carte pour placer le lieu. Une notification apparaîtra quand vous entrerez dans la zone.
      </Text>

      <CarteOSM ref={carte} position={position} rayon={Number(rayon)} hauteur={340}
        onChoisir={(lat, lng) => { setPosition({ latitude: lat, longitude: lng }); setErreur(null); }} />

      <GradientButton variant="soft" icon="locate" title={recherche ? 'Recherche…' : 'Ma position actuelle'}
        onPress={maPosition} />
      {recherche && <ActivityIndicator color={COLORS.primary} />}

      <View style={styles.carte}>
        <Text style={styles.label}>Nom du lieu</Text>
        <TextInput style={styles.champ} value={nom} onChangeText={setNom}
          placeholder="Ex. Bureau, Maison, ISET…" placeholderTextColor="#94A3B8" />

        <Text style={[styles.label, { marginTop: 10 }]}>Rayon de la zone</Text>
        <ChipGroup options={RAYONS} selected={rayon} onChange={changerRayon} />

        {position && (
          <Text style={styles.coords}>
            {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      {!!erreur && (
        <View style={styles.ligneErreur}>
          <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
          <Text style={styles.erreur}>{erreur}</Text>
        </View>
      )}

      <GradientButton title="Enregistrer le rappel" icon="notifications-outline" onPress={enregistrer} />
      <Text style={styles.note}>© contributeurs OpenStreetMap</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  contenu: { padding: 18, gap: 14, paddingBottom: 40 },
  aide: { color: COLORS.textLight, fontSize: 14, lineHeight: 20 },
  carte: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, ...SHADOW },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  champ: {
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text, outlineStyle: 'none',
  },
  coords: { marginTop: 10, color: COLORS.textLight, fontSize: 12.5 },
  ligneErreur: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  erreur: { color: COLORS.danger, fontWeight: '600', fontSize: 13.5 },
  note: { textAlign: 'center', color: '#94A3B8', fontSize: 11.5 },
});
