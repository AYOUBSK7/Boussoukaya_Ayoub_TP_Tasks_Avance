// Bannière affichée en haut de l'écran pendant 5 secondes (nouveau commentaire, rappel…)
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ecouterBannieres } from '../utils/banniere';
import { COLORS, SHADOW } from '../constants/theme';

export default function Banniere() {
  const [message, setMessage] = useState(null);
  const opacite = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let minuteur;
    const fermer = ecouterBannieres((m) => {
      setMessage(m);
      Animated.timing(opacite, { toValue: 1, duration: 200, useNativeDriver: false }).start();
      clearTimeout(minuteur);
      minuteur = setTimeout(() => setMessage(null), 5000);
    });
    return () => { fermer(); clearTimeout(minuteur); };
  }, [opacite]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.conteneur, { top: insets.top + 10, opacity: opacite }]} pointerEvents="box-none">
      <Pressable style={styles.banniere} onPress={() => setMessage(null)}>
        <View style={styles.icone}>
          <Ionicons name={message.icon || 'notifications'} size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.titre} numberOfLines={1}>{message.titre}</Text>
          {!!message.texte && <Text style={styles.texte} numberOfLines={2}>{message.texte}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  conteneur: { position: 'absolute', left: 12, right: 12, zIndex: 100, alignItems: 'center' },
  banniere: {
    width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.text, borderRadius: 18, padding: 12, ...SHADOW, elevation: 8,
  },
  icone: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  titre: { color: '#fff', fontWeight: '800', fontSize: 14.5 },
  texte: { color: '#CBD5E1', fontSize: 13, marginTop: 2 },
});
