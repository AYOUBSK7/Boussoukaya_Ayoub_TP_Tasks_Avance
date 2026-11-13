// Carte blanche avec un titre (utilisée dans l'écran Détails)
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function Section({ titre, icon, droite, children }) {
  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
        <Text style={styles.titre}>{titre}</Text>
        {droite}
      </View>
      {children}
    </View>
  );
}

// Petit bouton arrondi (icône + texte) réutilisé dans les sections
export function MiniBouton({ icon, label, onPress, color = COLORS.primary, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [styles.mini, { backgroundColor: color + '1A', opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }]}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[styles.miniTexte, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, gap: 12, ...SHADOW },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titre: {
    flex: 1, fontSize: 13, color: COLORS.textLight, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  mini: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
  },
  miniTexte: { fontWeight: '700', fontSize: 13.5 },
});
