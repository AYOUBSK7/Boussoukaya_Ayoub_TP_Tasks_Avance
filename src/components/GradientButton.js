// Bouton moderne avec dégradé (ou variante "soft" / "outline")
//   variant : 'gradient' (défaut) | 'soft' | 'outline'
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, RADIUS } from '../constants/theme';

export default function GradientButton({
  title, icon, onPress, colors = GRADIENTS.primary, variant = 'gradient', color, style,
}) {
  const contenu = (couleurTexte) => (
    <View style={styles.ligne}>
      {icon && <Ionicons name={icon} size={19} color={couleurTexte} />}
      <Text style={[styles.texte, { color: couleurTexte }]}>{title}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      {variant === 'gradient' ? (
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.bouton, styles.ombre, { shadowColor: colors[0] }]}>
          {contenu('#fff')}
        </LinearGradient>
      ) : (
        <View style={[
          styles.bouton,
          variant === 'soft'
            ? { backgroundColor: (color || COLORS.primary) + '1A' }
            : { borderWidth: 1.5, borderColor: color || COLORS.primary },
        ]}>
          {contenu(color || COLORS.primary)}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: { paddingVertical: 15, borderRadius: RADIUS.md, alignItems: 'center' },
  ombre: { shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texte: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
