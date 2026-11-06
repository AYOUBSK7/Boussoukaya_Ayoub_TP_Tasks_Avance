// Cartes de statistiques modernes (icône + chiffre + libellé)
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function StatCard({ label, valeur, color, bg, icon }) {
  return (
    <View style={styles.carte}>
      <View style={[styles.icone, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.valeur}>{valeur}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

// Ligne de 3 statistiques, réutilisée dans Accueil, Liste et Profil
export function StatsRow({ stats }) {
  return (
    <View style={styles.ligne}>
      <StatCard label="Total" valeur={stats.total} icon="layers-outline"
        color={COLORS.primary} bg={COLORS.primarySoft} />
      <StatCard label="Terminées" valeur={stats.terminees} icon="checkmark-done"
        color={COLORS.success} bg={COLORS.successSoft} />
      <StatCard label="À faire" valeur={stats.aFaire} icon="time-outline"
        color={COLORS.warning} bg={COLORS.warningSoft} />
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', gap: 10 },
  carte: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, gap: 4, ...SHADOW,
  },
  icone: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  valeur: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  label: { fontSize: 12.5, color: COLORS.textLight, fontWeight: '600' },
});
