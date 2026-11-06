// Partie 4 — Écran 3 : Détails d'une tâche (infos complètes, modification, suppression)
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import GradientButton from '../components/GradientButton';
import { useTasks } from '../context/TaskContext';
import { COLORS, GRADIENTS, PRIORITES, RADIUS, SHADOW, STATUTS } from '../constants/theme';
import { confirmer, formaterDate } from '../utils/helpers';

// Une ligne d'information avec icône
function LigneInfo({ icon, label, valeur, color = COLORS.primary }) {
  return (
    <View style={styles.ligneInfo}>
      <View style={[styles.iconeInfo, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valeur}>{valeur}</Text>
      </View>
    </View>
  );
}

export default function TaskDetailScreen({ route, navigation }) {
  const { id } = route.params;              // paramètre reçu depuis la liste
  const { getTache, supprimerTache, basculerStatut } = useTasks();
  const tache = getTache(id);

  // La tâche a pu être supprimée entre-temps
  if (!tache) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texteGris}>Cette tâche n'existe plus.</Text>
      </View>
    );
  }

  const priorite = PRIORITES[tache.priorite];
  const statut = STATUTS[tache.statut];
  const terminee = tache.statut === 'terminee';

  const onSupprimer = () =>
    confirmer('Supprimer la tâche', `Voulez-vous vraiment supprimer « ${tache.titre} » ?`, () => {
      supprimerTache(tache.id);
      navigation.goBack();
    });

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      {/* Carte principale teintée selon la priorité */}
      <View style={[styles.hero, { backgroundColor: priorite.bg }]}>
        <View style={[styles.iconeHero, { backgroundColor: priorite.color }]}>
          <Ionicons name={terminee ? 'checkmark-done' : 'flag'} size={22} color="#fff" />
        </View>
        <Text style={[styles.titre, terminee && styles.barre]}>{tache.titre}</Text>
        <View style={styles.ligneBadges}>
          <Badge label={priorite.label} color={priorite.color} bg="#fff" />
          <Badge label={statut.label} color={statut.color} bg="#fff" />
        </View>
      </View>

      <View style={styles.carte}>
        <Text style={styles.titreSection}>Description</Text>
        <Text style={styles.description}>{tache.description || 'Aucune description.'}</Text>
      </View>

      <View style={styles.carte}>
        <LigneInfo icon="calendar-clear-outline" label="Date de création"
          valeur={formaterDate(tache.dateCreation)} />
        <View style={styles.separateur} />
        <LigneInfo icon={priorite.icon} label="Priorité" valeur={priorite.label} color={priorite.color} />
        <View style={styles.separateur} />
        <LigneInfo icon={statut.icon} label="Statut" valeur={statut.label} color={statut.color} />
      </View>

      <GradientButton
        title={terminee ? 'Marquer « À faire »' : 'Marquer comme terminée'}
        icon={terminee ? 'refresh' : 'checkmark-circle-outline'}
        colors={terminee ? GRADIENTS.primary : GRADIENTS.success}
        onPress={() => basculerStatut(tache.id)}
      />

      <View style={styles.ligneBoutons}>
        <GradientButton style={{ flex: 1 }} variant="soft" title="Modifier" icon="create-outline"
          onPress={() => navigation.navigate('EditTask', { id: tache.id })} />
        <GradientButton style={{ flex: 1 }} variant="soft" color={COLORS.danger}
          title="Supprimer" icon="trash-outline" onPress={onSupprimer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.background },
  contenu: { padding: 18, gap: 14, paddingBottom: 40 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  texteGris: { color: COLORS.textLight },
  hero: { borderRadius: RADIUS.xl, padding: 20, gap: 12 },
  iconeHero: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 },
  barre: { textDecorationLine: 'line-through', color: COLORS.textLight },
  ligneBadges: { flexDirection: 'row', gap: 8 },
  carte: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, gap: 8, ...SHADOW },
  titreSection: { fontSize: 13, color: COLORS.textLight, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  description: { fontSize: 15.5, color: COLORS.text, lineHeight: 23 },
  ligneInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeInfo: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12.5, color: COLORS.textLight, fontWeight: '600' },
  valeur: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
  separateur: { height: 1, backgroundColor: COLORS.border, marginVertical: 4, marginLeft: 50 },
  ligneBoutons: { flexDirection: 'row', gap: 12 },
});
