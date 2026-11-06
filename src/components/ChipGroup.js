// Contrôle segmenté moderne : un seul choix possible (filtres, priorité, statut)
//   options  : [{ key, label, color?, bg? }]
//   selected : la clé sélectionnée
//   onChange : fonction appelée avec la nouvelle clé
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ChipGroup({ options, selected, onChange }) {
  return (
    <View style={styles.piste}>
      {options.map((opt) => {
        const actif = opt.key === selected;
        const couleur = opt.color || COLORS.primary;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.segment, actif && styles.segmentActif, actif && opt.bg && { backgroundColor: opt.bg }]}
          >
            {opt.color && <View style={[styles.point, { backgroundColor: couleur, opacity: actif ? 1 : 0.5 }]} />}
            <Text style={[styles.texte, actif && { color: couleur, fontWeight: '800' }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piste: { flexDirection: 'row', backgroundColor: '#ECEEF5', borderRadius: 14, padding: 4, gap: 4 },
  segment: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 11,
  },
  segmentActif: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  point: { width: 8, height: 8, borderRadius: 4 },
  texte: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
});
