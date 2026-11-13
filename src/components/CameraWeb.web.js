// Webcam du PC (version web) : aperçu vidéo + bouton « Prendre la photo »
// navigator.mediaDevices.getUserMedia() demande l'autorisation d'utiliser la caméra,
// puis on dessine l'image de la vidéo dans un <canvas> pour obtenir un fichier JPEG.
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function CameraWeb({ visible, onPhoto, onFermer }) {
  const video = useRef(null);
  const [erreur, setErreur] = useState(null);
  const [prete, setPrete] = useState(false);

  // Allumer la caméra quand la fenêtre s'ouvre, l'éteindre quand elle se ferme
  useEffect(() => {
    if (!visible) return undefined;
    let flux = null;
    setErreur(null);
    setPrete(false);
    if (!navigator.mediaDevices) {
      setErreur('Ce navigateur ne permet pas d’utiliser la caméra.');
      return undefined;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((f) => {
        flux = f;
        if (video.current) {
          video.current.srcObject = f;
          video.current.play();
        }
      })
      .catch(() => setErreur('Caméra introuvable ou autorisation refusée. Utilisez « Galerie » à la place.'));
    return () => { if (flux) flux.getTracks().forEach((piste) => piste.stop()); };
  }, [visible]);

  const capturer = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      const nom = `photo-${Date.now()}.jpg`;
      onPhoto({ uri: URL.createObjectURL(blob), nom, mime: 'image/jpeg', file: new File([blob], nom, { type: 'image/jpeg' }) });
    }, 'image/jpeg', 0.85);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFermer}>
      <View style={styles.fond}>
        <View style={styles.boite}>
          <Text style={styles.titre}>Prendre une photo</Text>
          {erreur ? (
            <Text style={styles.erreur}>{erreur}</Text>
          ) : (
            React.createElement('video', {
              ref: video, autoPlay: true, playsInline: true, muted: true,
              onLoadedData: () => setPrete(true),
              style: { width: '100%', maxHeight: '60vh', borderRadius: 12, background: '#000' },
            })
          )}
          <View style={styles.boutons}>
            <Pressable style={[styles.bouton, styles.annuler]} onPress={onFermer}>
              <Text style={styles.texteAnnuler}>Annuler</Text>
            </Pressable>
            {!erreur && (
              <Pressable style={[styles.bouton, styles.capturer, !prete && { opacity: 0.5 }]}
                onPress={capturer} disabled={!prete}>
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.texteCapturer}>Prendre la photo</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  boite: { width: '100%', maxWidth: 640, backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 12 },
  titre: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  erreur: { color: COLORS.danger, fontWeight: '600' },
  boutons: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  bouton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
  annuler: { backgroundColor: COLORS.input },
  texteAnnuler: { fontWeight: '700', color: COLORS.text },
  capturer: { backgroundColor: COLORS.primary },
  texteCapturer: { fontWeight: '700', color: '#fff' },
});
