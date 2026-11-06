// Badge "pilule" avec un point de couleur (priorité ou statut)
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Badge({ label, color, bg, small = false }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <View style={[styles.point, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, small && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start',
  },
  small: { paddingHorizontal: 9, paddingVertical: 3, gap: 5 },
  point: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '700' },
  textSmall: { fontSize: 11.5 },
});
