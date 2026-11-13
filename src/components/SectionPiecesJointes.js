// Section « Pièces jointes » : photo (caméra), image (galerie) et fichier (document)
// Les fichiers sont envoyés au serveur (POST /tasks/:id/fichiers) puis affichés ici.
import React, { useState } from 'react';
import {
  ActivityIndicator, Image, Linking, Modal, Pressable, Text, View, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Section, { MiniBouton } from './Section';
import { useTasks } from '../context/TaskContext';
import { urlFichier } from '../utils/api';
import { COLORS, RADIUS } from '../constants/theme';
import { confirmer, formaterTaille } from '../utils/helpers';

export default function SectionPiecesJointes({ tache }) {
  const { ajouterPieceJointe, supprimerPieceJointe } = useTasks();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [apercu, setApercu] = useState(null); // image affichée en plein écran

  const pieces = tache.piecesJointes ?? [];
  const images = pieces.filter((p) => p.type === 'image');
  const fichiers = pieces.filter((p) => p.type !== 'image');

  // Envoi au serveur avec indicateur de chargement
  const envoyer = async (fichier) => {
    setErreur(null);
    setEnvoi(true);
    try {
      await ajouterPieceJointe(tache.id, fichier);
    } catch (e) {
      setErreur("Envoi impossible : vérifiez que le serveur est lancé.");
    } finally {
      setEnvoi(false);
    }
  };

  // Image choisie (caméra ou galerie) → { uri, nom, mime, file }
  const depuisImage = (res) => {
    if (res.canceled) return;
    const a = res.assets[0];
    envoyer({
      uri: a.uri,
      nom: a.fileName || `photo-${Date.now()}.jpg`,
      mime: a.mimeType || 'image/jpeg',
      file: a.file,
    });
  };

  const prendrePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return setErreur('Autorisation de la caméra refusée.');
    depuisImage(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 }));
  };

  const choisirImage = async () => {
    depuisImage(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 }));
  };

  const choisirFichier = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled) return;
    const a = res.assets[0];
    envoyer({ uri: a.uri, nom: a.name, mime: a.mimeType, file: a.file });
  };

  const retirer = (piece) =>
    confirmer('Retirer le fichier', `Supprimer « ${piece.nom} » ?`, () =>
      supprimerPieceJointe(tache.id, piece.id).catch(() => setErreur('Suppression impossible.')));

  return (
    <Section titre={`Pièces jointes (${pieces.length})`} icon="attach">
      <View style={styles.boutons}>
        <MiniBouton icon="camera-outline" label="Caméra" onPress={prendrePhoto} disabled={envoi} />
        <MiniBouton icon="image-outline" label="Galerie" onPress={choisirImage} disabled={envoi} />
        <MiniBouton icon="document-attach-outline" label="Fichier" onPress={choisirFichier} disabled={envoi} />
      </View>

      {envoi && (
        <View style={styles.ligne}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.gris}>Envoi en cours…</Text>
        </View>
      )}
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {pieces.length === 0 && !envoi && <Text style={styles.gris}>Aucun fichier pour l’instant.</Text>}

      {/* Images : miniatures (toucher = agrandir) */}
      {images.length > 0 && (
        <View style={styles.grille}>
          {images.map((p) => (
            <Pressable key={p.id} onPress={() => setApercu(p)} onLongPress={() => retirer(p)}>
              <Image source={{ uri: urlFichier(p) }} style={styles.miniature} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Autres fichiers : liste (toucher = ouvrir / télécharger) */}
      {fichiers.map((p) => (
        <Pressable key={p.id} style={styles.fichier} onPress={() => Linking.openURL(urlFichier(p))}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.nom}>{p.nom}</Text>
            <Text style={styles.gris}>{formaterTaille(p.taille)}</Text>
          </View>
          <Pressable onPress={() => retirer(p)} hitSlop={10}>
            <Ionicons name="close-circle" size={22} color="#CBD5E1" />
          </Pressable>
        </Pressable>
      ))}
      {images.length > 0 && <Text style={styles.astuce}>Appui long sur une image pour la retirer.</Text>}

      {/* Aperçu plein écran */}
      <Modal visible={!!apercu} transparent animationType="fade" onRequestClose={() => setApercu(null)}>
        <Pressable style={styles.fond} onPress={() => setApercu(null)}>
          {apercu && <Image source={{ uri: urlFichier(apercu) }} style={styles.grande} resizeMode="contain" />}
          <Text style={styles.fermer}>Toucher pour fermer</Text>
        </Pressable>
      </Modal>
    </Section>
  );
}

const styles = StyleSheet.create({
  boutons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gris: { color: COLORS.textLight, fontSize: 13 },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniature: { width: 86, height: 86, borderRadius: RADIUS.sm, backgroundColor: COLORS.input },
  fichier: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.input, borderRadius: RADIUS.sm, padding: 10,
  },
  nom: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  astuce: { color: '#94A3B8', fontSize: 11.5 },
  fond: { flex: 1, backgroundColor: 'rgba(15,23,42,0.92)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  grande: { width: '100%', height: '80%' },
  fermer: { color: '#fff', marginTop: 12, opacity: 0.8 },
});
