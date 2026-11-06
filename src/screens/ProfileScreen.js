// Onglet Profil : informations de l'étudiant + progression + réinitialisation des données
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatsRow } from '../components/StatCard';
import GradientButton from '../components/GradientButton';
import { useTasks } from '../context/TaskContext';
import { COLORS, GRADIENTS, RADIUS, SHADOW } from '../constants/theme';
import { confirmer } from '../utils/helpers';
import { API_URL } from '../config';

export default function ProfileScreen() {
  const { stats, reinitialiser, erreur, rafraichir } = useTasks();
  const insets = useSafeAreaInsets();
  const focus = useIsFocused();
  const pourcentage = stats.total === 0 ? 0 : Math.round((stats.terminees / stats.total) * 100);

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={{ paddingBottom: 30 }}>
      {focus && <StatusBar style="light" />}
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.entete, { paddingTop: insets.top + 24 }]}>
        <View style={styles.avatar}>
          <Text style={styles.initiales}>AB</Text>
        </View>
        <Text style={styles.nom}>Ayoub Boussoukaya</Text>
        <View style={styles.pastille}>
          <Ionicons name="school-outline" size={14} color="#fff" />
          <Text style={styles.info}>L3 DSI — ISET Djerba</Text>
        </View>
      </LinearGradient>

      <View style={styles.corps}>
        <StatsRow stats={stats} />

        <View style={styles.carte}>
          <View style={styles.ligne}>
            <Text style={styles.label}>Taux de réalisation</Text>
            <Text style={styles.pourcentage}>{pourcentage} %</Text>
          </View>
          <View style={styles.barre}>
            <LinearGradient colors={GRADIENTS.success} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.remplissage, { width: `${pourcentage}%` }]} />
          </View>
        </View>

        <View style={styles.carte}>
          <View style={styles.ligne}>
            <Text style={styles.label}>Serveur</Text>
            <Text style={[styles.etat, { color: erreur ? COLORS.danger : COLORS.success }]}>
              {erreur ? 'Hors ligne' : 'Connecté'}
            </Text>
          </View>
          <Text style={styles.url}>{API_URL}</Text>
          {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
          <GradientButton variant="soft" icon="cloud-download-outline" title="Actualiser depuis le serveur"
            onPress={rafraichir} />
        </View>

        <GradientButton variant="outline" color={COLORS.danger} icon="refresh"
          title="Réinitialiser les données"
          onPress={() => confirmer('Réinitialiser', 'Remettre les tâches d’exemple ?', reinitialiser)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  entete: {
    alignItems: 'center', paddingBottom: 30, gap: 8,
    borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  initiales: { color: '#fff', fontSize: 32, fontWeight: '800' },
  nom: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
  pastille: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  info: { color: '#fff', fontWeight: '600', fontSize: 13 },
  corps: { padding: 18, gap: 16 },
  carte: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, gap: 12, ...SHADOW },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontWeight: '800', color: COLORS.text, fontSize: 15 },
  pourcentage: { fontWeight: '800', color: COLORS.success, fontSize: 20 },
  barre: { height: 12, backgroundColor: COLORS.input, borderRadius: 6, overflow: 'hidden' },
  remplissage: { height: '100%', borderRadius: 6 },
  etat: { fontWeight: '800', fontSize: 14 },
  url: { color: '#64748B', fontSize: 13 },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
});
