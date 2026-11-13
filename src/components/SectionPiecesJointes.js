// Section « Pièces jointes » : photo (caméra), image (galerie) et fichier (document)
// Les fichiers sont envoyés au serveur (POST /tasks/:id/fichiers) puis affichés ici.
// Chaque fichier peut être ouvert, renommé (✏️) ou supprimé (🗑).
import React, { useState } from 'react';
import {
  ActivityIndicator, Image, Linking, Modal, Platform, Pressable, Text, TextInput, View, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Section, { MiniBouton } from './Section';
import CameraWeb from './CameraWeb';
import { useTasks } from '../context/TaskContext';
import { urlFichier } from '../utils/api';
import { COLORS, RADIUS } from '../constants/theme';
import { confirmer, formaterTaille } from '../utils/helpers';

export default function SectionPiecesJointes({ tache }) {
  const { ajouterPieceJointe, supprimerPieceJointe, renommerPieceJointe } = useTasks();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [apercu, setApercu] = useState(null);      // image affichée en plein écran
  const [cameraWeb, setCameraWeb] = useState(false); // webcam du PC (web)
  const [enEdition, setEnEdition] = useState(null); // id du fichier en cours de renommage
  const [nouveauNom, setNouveauNom] = useState('');

  const pieces = tache.piecesJointes ?? [];

  // Envoi au serveur avec indicateur de chargement
  const envoyer = async (fichier) => {
    setErreur(null);
    setEnvoi(true);
    try {
      await ajouterPieceJointe(tache.id, fichier);
    } catch (e) {
      setErreur('Envoi impossible : vérifiez que le serveur est lancé.');
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

  // Caméra : webcam du PC sur le web, caméra du téléphone sur Android / iOS
  const prendrePhoto = async () => {
    if (Platform.OS === 'web') {
      setCameraWeb(true);
      return;
    }
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

  // Ouvrir : image → plein écran, fichier → navigateur / téléchargement
  const ouvrir = (p) => (p.type === 'image' ? setApercu(p) : Linking.openURL(urlFichier(p)));

  const commencerRenommage = (p) => {
    setEnEdition(p.id);
    setNouveauNom(p.nom);
  };

  const validerRenommage = async (p) => {
    const nom = nouveauNom.trim();
    if (!nom) return setErreur('Le nom ne peut pas être vide.');
    setEnEdition(null);
    if (nom === p.nom) return;
    try {
      await renommerPieceJointe(tache.id, p.id, nom);
      setErreur(null);
    } catch (e) {
      setErreur('Modification impossible.');
    }
  };

  const supprimer = (p) =>
    confirmer('Supprimer le fichier', `Supprimer « ${p.nom} » ?`, () =>
      supprimerPieceJointe(tache.id, p.id).catch(() => setErreur('Suppression impossible.')));

  return (
    <Section titre={`Pièces jointes (${pieces.length})`} icon="attach">
      <View style={styles.boutons}>
        <MiniBouton icon="camera-outline" label="Caméra" onPress={prendrePhoto} disabled={envoi} />
        <MiniBouton icon="image-outline" label="Galerie" onPress={choisirImage} disabled={envoi} />
        <MiniBouton icon="document-attach-outline" label="Fichier" onPress={choisirFichier} disabled={envoi} />
      </View>

      {envoi && (
        <View style={styles.ligneEnvoi}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.gris}>Envoi en cours…</Text>
        </View>
      )}
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {pieces.length === 0 && !envoi && <Text style={styles.gris}>Aucun fichier pour l’instant.</Text>}

      {/* Liste des fichiers : miniature ou icône, nom, taille, boutons modifier / supprimer */}
      {pieces.map((p) => (
        <View key={p.id} style={styles.ligne}>
          <Pressable onPress={() => ouvrir(p)}>
            {p.type === 'image' ? (
              <Image source={{ uri: urlFichier(p) }} style={styles.miniature} />
            ) : (
              <View style={[styles.miniature, styles.icone]}>
                <Ionicons name="document-text-outline" size={26} color={COLORS.primary} />
              </View>
            )}
          </Pressable>

          {enEdition === p.id ? (
            <View style={styles.infos}>
              <TextInput style={styles.champ} value={nouveauNom} onChangeText={setNouveauNom}
                autoFocus onSubmitEditing={() => validerRenommage(p)} />
              <View style={styles.boutons}>
                <MiniBouton icon="checkmark" label="Enregistrer" color={COLORS.success} onPress={() => validerRenommage(p)} />
                <MiniBouton icon="close" label="Annuler" color={COLORS.textLight} onPress={() => setEnEdition(null)} />
              </View>
            </View>
          ) : (
            <Pressable style={styles.infos} onPress={() => ouvrir(p)}>
              <Text numberOfLines={1} style={styles.nom}>{p.nom}</Text>
              <Text style={styles.gris}>
                {p.type === 'image' ? 'Image' : 'Fichier'} · {formaterTaille(p.taille)}
              </Text>
            </Pressable>
          )}

          {enEdition !== p.id && (
            <View style={styles.actions}>
              <Pressable onPress={() => commencerRenommage(p)} hitSlop={8} style={styles.action}
                accessibilityLabel={`Renommer ${p.nom}`}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              </Pressable>
              <Pressable onPress={() => supprimer(p)} hitSlop={8} style={styles.action}
                accessibilityLabel={`Supprimer ${p.nom}`}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </Pressable>
            </View>
          )}
        </View>
      ))}

      {/* Aperçu plein écran d'une image */}
      <Modal visible={!!apercu} transparent animationType="fade" onRequestClose={() => setApercu(null)}>
        <Pressable style={styles.fond} onPress={() => setApercu(null)}>
          {apercu && <Image source={{ uri: urlFichier(apercu) }} style={styles.grande} resizeMode="contain" />}
          <Text style={styles.fermer}>Toucher pour fermer</Text>
        </Pressable>
      </Modal>

      {/* Webcam du PC (seulement sur le web) */}
      <CameraWeb visible={cameraWeb} onFermer={() => setCameraWeb(false)}
        onPhoto={(photo) => { setCameraWeb(false); envoyer(photo); }} />
    </Section>
  );
}

const styles = StyleSheet.create({
  boutons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ligneEnvoi: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gris: { color: COLORS.textLight, fontSize: 13 },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  ligne: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.input, borderRadius: RADIUS.md, padding: 8,
  },
  miniature: { width: 58, height: 58, borderRadius: RADIUS.sm, backgroundColor: '#E2E8F0' },
  icone: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft },
  infos: { flex: 1, gap: 6 },
  nom: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  champ: {
    backgroundColor: '#fff', borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: COLORS.text, outlineStyle: 'none',
  },
  actions: { flexDirection: 'row', gap: 4 },
  action: { padding: 6, borderRadius: 10, backgroundColor: '#fff' },
  fond: { flex: 1, backgroundColor: 'rgba(15,23,42,0.92)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  grande: { width: '100%', height: '80%' },
  fermer: { color: '#fff', marginTop: 12, opacity: 0.8 },
});
