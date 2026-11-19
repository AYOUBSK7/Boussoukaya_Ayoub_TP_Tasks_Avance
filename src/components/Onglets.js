// Barre d'onglets simple (contrôle segmenté) : [Fichiers] [Rappels] [Suivi]
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

// onglets = [{ key, label, icon, badge }]
export default function Onglets({ onglets, actif, onChange }) {
  return (
    <View style={styles.barre}>
      {onglets.map((o) => {
        const selectionne = o.key === actif;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} accessibilityRole="tab"
            style={[styles.onglet, selectionne && styles.ongletActif]}>
            <Ionicons name={o.icon} size={17} color={selectionne ? '#fff' : COLORS.textLight} />
            <Text style={[styles.texte, selectionne && styles.texteActif]}>{o.label}</Text>
            {o.badge > 0 && (
              <View style={[styles.badge, selectionne && styles.badgeActif]}>
                <Text style={[styles.texteBadge, selectionne && { color: COLORS.primary }]}>{o.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barre: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 5, gap: 4, ...SHADOW,
  },
  onglet: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 15,
  },
  ongletActif: { backgroundColor: COLORS.primary },
  texte: { fontWeight: '700', color: COLORS.textLight, fontSize: 13.5 },
  texteActif: { color: '#fff' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  badgeActif: { backgroundColor: '#fff' },
  texteBadge: { fontSize: 11.5, fontWeight: '800', color: COLORS.primary },
});
