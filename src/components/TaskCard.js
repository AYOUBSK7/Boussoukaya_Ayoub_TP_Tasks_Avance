// Partie 1 — Composant TaskCard avec Props et styles
// Le composant ne connaît rien de la liste : il reçoit TOUT par ses props.
//   tache          : l'objet tâche à afficher
//   onPress        : fonction appelée quand on touche la carte
//   onToggleStatut : fonction appelée quand on touche la case ronde (changer le statut)
//   compact        : affichage réduit (dans la liste) ou complet
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import { COLORS, PRIORITES, STATUTS, RADIUS, SHADOW } from '../constants/theme';
import { formaterDate } from '../utils/helpers';

function Indicateur({ icon, texte }) {
  return (
    <View style={styles.indicateur}>
      <Ionicons name={icon} size={13} color={COLORS.primary} />
      {texte !== undefined && <Text style={styles.texteIndicateur}>{texte}</Text>}
    </View>
  );
}

export default function TaskCard({ tache, onPress, onToggleStatut, compact = false }) {
  const priorite = PRIORITES[tache.priorite];
  const statut = STATUTS[tache.statut];
  const terminee = tache.statut === 'terminee';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      {/* Barre d'accent à gauche : couleur de la priorité */}
      <View style={[styles.accent, { backgroundColor: priorite.color }]} />

      {/* Case ronde : touche = changer le statut */}
      <Pressable onPress={onToggleStatut} disabled={!onToggleStatut} hitSlop={10}
        style={[styles.check, terminee && styles.checkActif]}>
        {terminee && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Pressable>

      <View style={styles.contenu}>
        <Text numberOfLines={compact ? 1 : 3}
          style={[styles.titre, compact && styles.titreCompact, terminee && styles.barre]}>
          {tache.titre}
        </Text>

        {!!tache.description && (
          <Text numberOfLines={compact ? 1 : 4} style={styles.description}>{tache.description}</Text>
        )}

        <View style={styles.meta}>
          <Badge label={priorite.label} color={priorite.color} bg={priorite.bg} small />
          {!compact && <Badge label={statut.label} color={statut.color} bg={statut.bg} small />}
          <View style={styles.date}>
            <Ionicons name="calendar-clear-outline" size={13} color={COLORS.textLight} />
            <Text style={styles.texteDate}>
              {compact ? formaterDate(tache.dateCreation) : `Créée le ${formaterDate(tache.dateCreation)}`}
            </Text>
          </View>
        </View>
        {/* Petites icônes : fichiers, rappel date, rappel lieu, observateurs */}
        {(tache.piecesJointes?.length > 0 || !!tache.rappelDate || !!tache.rappelLieu || tache.observateurs?.length > 0) && (
          <View style={styles.icones}>
            {tache.piecesJointes?.length > 0 && <Indicateur icon="attach" texte={tache.piecesJointes.length} />}
            {!!tache.rappelDate && <Indicateur icon="alarm-outline" />}
            {!!tache.rappelLieu && <Indicateur icon="location-outline" />}
            {tache.observateurs?.length > 0 && <Indicateur icon="eye-outline" texte={tache.observateurs.length} />}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    paddingVertical: 14, paddingLeft: 18, paddingRight: 12, marginBottom: 12,
    overflow: 'hidden', ...SHADOW,
  },
  accent: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: 4 },
  check: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#CBD5E1',
    alignItems: 'center', justifyContent: 'center',
  },
  checkActif: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  contenu: { flex: 1, gap: 5 },
  titre: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },
  titreCompact: { fontSize: 15.5, fontWeight: '700' },
  barre: { textDecorationLine: 'line-through', color: '#94A3B8' },
  description: { fontSize: 13.5, color: COLORS.textLight, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' },
  date: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  texteDate: { fontSize: 12, color: COLORS.textLight },
  icones: { flexDirection: 'row', gap: 6, marginTop: 2 },
  indicateur: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.primarySoft, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  texteIndicateur: { fontSize: 11.5, fontWeight: '700', color: COLORS.primary },
});
