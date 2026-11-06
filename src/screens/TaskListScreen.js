// Partie 2 — Affichage dynamique et gestion de l'état
// Partie 4 — Écran 2 : Liste des tâches (affichage, recherche, filtre, changement de statut)
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '../components/TaskCard';
import ChipGroup from '../components/ChipGroup';
import { StatsRow } from '../components/StatCard';
import { useTasks } from '../context/TaskContext';
import { COLORS, FILTRES, GRADIENTS, RADIUS } from '../constants/theme';

export default function TaskListScreen({ navigation }) {
  const { taches, stats, basculerStatut } = useTasks();

  // État local de l'écran (useState)
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('toutes');
  const [focusRecherche, setFocusRecherche] = useState(false);

  // Bouton "+" dans l'en-tête
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('AddTask')}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.boutonEntete}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>
      ),
    });
  }, [navigation]);

  // Liste filtrée : recalculée quand les tâches, la recherche ou le filtre changent
  const tachesAffichees = useMemo(() => {
    const texte = recherche.trim().toLowerCase();
    return taches
      .filter((t) => filtre === 'toutes' || t.statut === filtre)
      .filter((t) =>
        t.titre.toLowerCase().includes(texte) || t.description.toLowerCase().includes(texte)
      );
  }, [taches, recherche, filtre]);

  // Tout ce qui est au-dessus de la liste défile avec elle (ListHeaderComponent)
  const entete = (
    <View style={styles.entete}>
      <StatsRow stats={stats} />

      <View style={[styles.recherche, focusRecherche && styles.rechercheFocus]}>
        <Ionicons name="search" size={18} color={focusRecherche ? COLORS.primary : COLORS.textLight} />
        <TextInput
          style={styles.champRecherche}
          placeholder="Rechercher une tâche..."
          placeholderTextColor="#94A3B8"
          value={recherche}
          onChangeText={setRecherche}
          onFocus={() => setFocusRecherche(true)}
          onBlur={() => setFocusRecherche(false)}
        />
        {recherche.length > 0 && (
          <Pressable onPress={() => setRecherche('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      <ChipGroup options={FILTRES} selected={filtre} onChange={setFiltre} />

      <Text style={styles.compteur}>
        {tachesAffichees.length} tâche{tachesAffichees.length > 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.ecran}>
      {/* FlatList : n'affiche que les éléments visibles → performant pour les longues listes */}
      <FlatList
        data={tachesAffichees}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={entete}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <TaskCard
            compact
            tache={item}
            onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
            onToggleStatut={() => basculerStatut(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.vide}>
            <View style={styles.iconeVide}>
              <Ionicons name="file-tray-outline" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.titreVide}>Aucune tâche trouvée</Text>
            <Text style={styles.texteVide}>Modifiez la recherche ou ajoutez une tâche.</Text>
          </View>
        }
        ListFooterComponent={
          tachesAffichees.length > 0 ? (
            <Text style={styles.astuce}>Astuce : touchez le cercle pour changer le statut.</Text>
          ) : null
        }
      />

      {/* Bouton flottant (FAB) en dégradé */}
      <Pressable style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.93 }] }]}
        onPress={() => navigation.navigate('AddTask')}>
        <LinearGradient colors={GRADIENTS.primary} style={styles.fabInterieur}>
          <Ionicons name="add" size={30} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  entete: { gap: 14, marginBottom: 6 },
  boutonEntete: {
    borderRadius: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  recherche: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent',
  },
  rechercheFocus: { borderColor: COLORS.primary },
  champRecherche: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.text, outlineStyle: 'none' },
  compteur: { color: COLORS.textLight, fontWeight: '700', fontSize: 13, marginTop: 2 },
  liste: { padding: 16, paddingBottom: 100 },
  vide: { alignItems: 'center', marginTop: 30, gap: 6 },
  iconeVide: {
    width: 70, height: 70, borderRadius: 24, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  titreVide: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  texteVide: { color: COLORS.textLight, fontSize: 13.5 },
  astuce: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute', right: 20, bottom: 22, borderRadius: 20,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fabInterieur: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
