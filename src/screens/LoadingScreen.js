// Indicateur de chargement pendant la lecture des tâches sur le serveur
import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GRADIENTS } from '../constants/theme';

export default function LoadingScreen() {
  return (
    <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ecran}>
      <View style={styles.logo}>
        <Ionicons name="checkmark-done" size={44} color="#fff" />
      </View>
      <Text style={styles.titre}>MyTasks</Text>
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />
      <Text style={styles.texte}>Chargement de vos tâches...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  logo: {
    width: 84, height: 84, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  titre: { color: '#fff', fontSize: 30, fontWeight: '800' },
  texte: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
});
