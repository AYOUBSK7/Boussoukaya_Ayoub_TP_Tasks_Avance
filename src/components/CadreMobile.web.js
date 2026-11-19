// « Mode mobile » pour le navigateur : un bouton met l'application dans un cadre
// de téléphone (390 × 844, comme un iPhone 14) avec barre d'état et encoche,
// pour la montrer comme sur un vrai mobile alors qu'elle tourne sur le web.
// Le choix est mémorisé (localStorage) pour la prochaine ouverture.
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const CLE = 'mytasks-mode-mobile';
const LARGEUR = 390;
const HAUTEUR = 844;
// Marges « sûres » d'un téléphone : barre d'état en haut, barre d'accueil en bas
const MARGES_MOBILE = { top: 47, bottom: 26, left: 0, right: 0 };

const lireChoix = () => {
  try { return window.localStorage.getItem(CLE) === '1'; } catch (e) { return false; }
};

export default function CadreMobile({ children }) {
  const [mobile, setMobile] = useState(lireChoix);
  const [heure, setHeure] = useState(new Date());
  const fenetre = useWindowDimensions();
  const margesReelles = useSafeAreaInsets();

  // Horloge de la barre d'état (mise à jour toutes les 30 s)
  useEffect(() => {
    const t = setInterval(() => setHeure(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const basculer = () => {
    const nouveau = !mobile;
    setMobile(nouveau);
    try { window.localStorage.setItem(CLE, nouveau ? '1' : '0'); } catch (e) { /* rien */ }
  };

  // Le téléphone garde ses proportions et rentre dans la fenêtre
  const hauteur = Math.min(HAUTEUR, fenetre.height - 40);
  const largeur = Math.round((hauteur * LARGEUR) / HAUTEUR);
  const texteHeure = heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Important : on garde TOUJOURS la même structure (mêmes composants, mêmes « key »)
  // et on change seulement les styles → l'app n'est pas rechargée quand on bascule.
  return (
    <View style={[styles.page, mobile && styles.pageMobile]}>
      <View style={mobile ? [styles.telephoneMobile, { width: largeur, height: hauteur }] : styles.telephone}>
        <SafeAreaInsetsContext.Provider value={mobile ? MARGES_MOBILE : margesReelles}>
          <View key="ecran" style={styles.ecran}>{children}</View>
        </SafeAreaInsetsContext.Provider>

        {mobile && (
          <View key="barre" style={styles.barreEtat} pointerEvents="none">
            <Text style={styles.heure}>{texteHeure}</Text>
            <View style={styles.encoche} />
            <View style={styles.icones}>
              <Ionicons name="cellular" size={15} color={COLORS.text} />
              <Ionicons name="wifi" size={15} color={COLORS.text} />
              <Ionicons name="battery-full" size={20} color={COLORS.text} />
            </View>
          </View>
        )}
        {mobile && <View key="accueil" style={styles.barreAccueil} pointerEvents="none" />}
      </View>

      {/* Bouton de bascule, toujours visible sur le bord droit de la fenêtre */}
      <Pressable onPress={basculer} style={styles.bouton}
        accessibilityLabel={mobile ? 'Revenir en plein écran' : 'Afficher en mode mobile'}>
        <Ionicons name={mobile ? 'desktop-outline' : 'phone-portrait-outline'} size={18} color="#fff" />
        <Text style={styles.texteBouton}>{mobile ? 'Plein écran' : 'Mode mobile'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageMobile: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2E8F0' },
  telephone: { flex: 1, width: '100%' },
  telephoneMobile: {
    flexShrink: 0, borderRadius: 48, borderWidth: 11, borderColor: '#0F172A', overflow: 'hidden',
    backgroundColor: '#fff', boxShadow: '0 30px 60px rgba(15,23,42,0.35)',
  },
  ecran: { flex: 1 },
  barreEtat: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26,
  },
  heure: { fontWeight: '700', fontSize: 15, color: COLORS.text, width: 70 },
  encoche: { width: 110, height: 30, borderRadius: 16, backgroundColor: '#0F172A', marginTop: -4 },
  icones: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 70, justifyContent: 'flex-end' },
  barreAccueil: {
    position: 'absolute', bottom: 7, alignSelf: 'center', width: 130, height: 5,
    borderRadius: 3, backgroundColor: '#0F172A', zIndex: 50,
  },
  bouton: {
    position: 'fixed', right: 14, top: '50%', zIndex: 1000,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.text, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    boxShadow: '0 8px 20px rgba(15,23,42,0.3)',
  },
  texteBouton: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
});
