// Partie 4 — Écran 1 : Accueil (présentation de l'application + statistiques)
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatsRow } from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import GradientButton from '../components/GradientButton';
import { useTasks } from '../context/TaskContext';
import { COLORS, GRADIENTS, RADIUS } from '../constants/theme';

const ORDRE_PRIORITE = { elevee: 0, moyenne: 1, faible: 2 };

export default function HomeScreen({ navigation }) {
  const { taches, stats, basculerStatut } = useTasks();
  const insets = useSafeAreaInsets();
  const focus = useIsFocused();
  const pourcentage = stats.total === 0 ? 0 : Math.round((stats.terminees / stats.total) * 100);

  // Les 3 tâches "à faire" les plus prioritaires
  const prioritaires = useMemo(
    () => taches.filter((t) => t.statut === 'a_faire')
      .sort((a, b) => ORDRE_PRIORITE[a.priorite] - ORDRE_PRIORITE[b.priorite])
      .slice(0, 3),
    [taches]
  );

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={{ paddingBottom: 30 }}>
      {focus && <StatusBar style="light" />}

      {/* En-tête en dégradé */}
      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.entete, { paddingTop: insets.top + 20 }]}>
        <View style={styles.ligneHaut}>
          <View>
            <Text style={styles.bonjour}>Bonjour 👋</Text>
            <Text style={styles.titre}>MyTasks</Text>
          </View>
          <View style={styles.logo}>
            <Ionicons name="checkmark-done" size={26} color="#fff" />
          </View>
        </View>
        <Text style={styles.sousTitre}>Organisez vos tâches, atteignez vos objectifs !</Text>

        {/* Carte de progression en verre dépoli */}
        <View style={styles.progression}>
          <View style={styles.ligneProgression}>
            <Text style={styles.texteProgression}>Progression du jour</Text>
            <Text style={styles.pourcentage}>{pourcentage} %</Text>
          </View>
          <View style={styles.barre}>
            <View style={[styles.remplissage, { width: `${pourcentage}%` }]} />
          </View>
          <Text style={styles.detailProgression}>
            {stats.terminees} sur {stats.total} tâches terminées
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.corps}>
        <StatsRow stats={stats} />

        <View style={styles.boutons}>
          <GradientButton style={{ flex: 1 }} title="Mes tâches" icon="list"
            onPress={() => navigation.navigate('Taches', { screen: 'TaskList' })} />
          <GradientButton style={{ flex: 1 }} title="Ajouter" icon="add-circle-outline"
            colors={GRADIENTS.success}
            onPress={() => navigation.navigate('Taches', { screen: 'AddTask', initial: false })} />
        </View>

        <View style={styles.ligneSection}>
          <Text style={styles.section}>Priorités du moment</Text>
          <Pressable onPress={() => navigation.navigate('Taches', { screen: 'TaskList' })}>
            <Text style={styles.lien}>Tout voir</Text>
          </Pressable>
        </View>

        {prioritaires.length === 0 ? (
          <View style={styles.vide}>
            <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            <Text style={styles.texteVide}>Tout est terminé, bravo !</Text>
          </View>
        ) : (
          prioritaires.map((t) => (
            <TaskCard key={t.id} compact tache={t}
              onToggleStatut={() => basculerStatut(t.id)}
              onPress={() => navigation.navigate('Taches', {
                screen: 'TaskDetail', params: { id: t.id }, initial: false,
              })} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  entete: {
    paddingHorizontal: 20, paddingBottom: 26,
    borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl,
  },
  ligneHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bonjour: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  titre: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  logo: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  sousTitre: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  progression: {
    marginTop: 20, padding: 16, borderRadius: RADIUS.lg, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  ligneProgression: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  texteProgression: { color: '#fff', fontWeight: '700', fontSize: 15 },
  pourcentage: { color: '#fff', fontWeight: '800', fontSize: 22 },
  barre: { height: 10, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 5, overflow: 'hidden' },
  remplissage: { height: '100%', backgroundColor: '#fff', borderRadius: 5 },
  detailProgression: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },
  corps: { padding: 18, gap: 16 },
  boutons: { flexDirection: 'row', gap: 12 },
  ligneSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  section: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  lien: { color: COLORS.primary, fontWeight: '700' },
  vide: { alignItems: 'center', gap: 8, padding: 24, backgroundColor: COLORS.card, borderRadius: RADIUS.lg },
  texteVide: { color: COLORS.textLight, fontWeight: '600' },
});
