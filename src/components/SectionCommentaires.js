// Section « Commentaires » : discussion autour de la tâche.
// Chaque nouveau commentaire est signalé (notification) aux OBSERVATEURS de la tâche.
// On peut modifier ou supprimer SES propres commentaires.
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Section, { MiniBouton } from './Section';
import { useTasks } from '../context/TaskContext';
import { useProfil } from '../context/ProfilContext';
import { COLORS, RADIUS } from '../constants/theme';
import { confirmer, formaterDateHeure } from '../utils/helpers';

const initiales = (nom) => nom.split(' ').filter(Boolean).slice(0, 2).map((m) => m[0].toUpperCase()).join('');

export default function SectionCommentaires({ tache, navigation }) {
  const { ajouterCommentaire, modifierCommentaire, supprimerCommentaire } = useTasks();
  const { profil, complet } = useProfil();
  const [texte, setTexte] = useState('');
  const [enEdition, setEnEdition] = useState(null); // id du commentaire modifié
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const commentaires = tache.commentaires ?? [];
  const nbObservateurs = (tache.observateurs ?? []).length;

  const envoyer = async () => {
    const t = texte.trim();
    if (!t) return;
    setEnvoi(true);
    setErreur(null);
    try {
      if (enEdition) await modifierCommentaire(tache.id, enEdition, t);        // UPDATE
      else await ajouterCommentaire(tache.id, { auteur: profil.nom, email: profil.email, texte: t }); // CREATE
      setTexte('');
      setEnEdition(null);
    } catch (e) {
      setErreur('Envoi impossible : vérifiez que le serveur est lancé.');
    } finally {
      setEnvoi(false);
    }
  };

  const modifier = (c) => {
    setEnEdition(c.id);
    setTexte(c.texte);
  };

  const supprimer = (c) =>
    confirmer('Supprimer le commentaire', 'Ce commentaire sera supprimé.', () =>
      supprimerCommentaire(tache.id, c.id).catch(() => setErreur('Suppression impossible.')));

  return (
    <Section titre={`Commentaires (${commentaires.length})`} icon="chatbubbles-outline">
      <View style={styles.note}>
        <Ionicons name="notifications-outline" size={15} color={COLORS.primary} />
        <Text style={styles.texteNote}>
          {nbObservateurs > 0
            ? `${nbObservateurs} observateur(s) seront notifiés à chaque nouveau commentaire.`
            : 'Ajoutez des observateurs pour qu’ils soient notifiés des commentaires.'}
        </Text>
      </View>

      {commentaires.length === 0 && <Text style={styles.gris}>Aucun commentaire pour l’instant.</Text>}

      {/* Fil de discussion */}
      {commentaires.map((c) => {
        const moi = c.email === profil.email;
        return (
          <View key={c.id} style={[styles.ligne, moi && styles.ligneMoi]}>
            {!moi && <View style={styles.avatar}><Text style={styles.initiales}>{initiales(c.auteur)}</Text></View>}
            <View style={[styles.bulle, moi ? styles.bulleMoi : styles.bulleAutre]}>
              <View style={styles.enteteBulle}>
                <Text style={[styles.auteur, moi && { color: '#fff' }]}>{moi ? 'Moi' : c.auteur}</Text>
                <Text style={[styles.date, moi && { color: '#E0E7FF' }]}>
                  {formaterDateHeure(c.date)}{c.modifie ? ' · modifié' : ''}
                </Text>
              </View>
              <Text style={[styles.texte, moi && { color: '#fff' }]}>{c.texte}</Text>
              {moi && (
                <View style={styles.actions}>
                  <Pressable onPress={() => modifier(c)} hitSlop={8} accessibilityLabel="Modifier le commentaire">
                    <Ionicons name="create-outline" size={17} color="#fff" />
                  </Pressable>
                  <Pressable onPress={() => supprimer(c)} hitSlop={8} accessibilityLabel="Supprimer le commentaire">
                    <Ionicons name="trash-outline" size={17} color="#fff" />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Zone de saisie */}
      {complet ? (
        <View style={styles.saisie}>
          {!!enEdition && (
            <View style={styles.bandeauEdition}>
              <Text style={styles.texteEdition}>Modification du commentaire</Text>
              <Pressable onPress={() => { setEnEdition(null); setTexte(''); }}>
                <Text style={styles.annuler}>Annuler</Text>
              </Pressable>
            </View>
          )}
          <View style={styles.ligneSaisie}>
            <TextInput style={styles.champ} value={texte} onChangeText={setTexte} multiline maxLength={500}
              placeholder="Écrire un commentaire…" placeholderTextColor="#94A3B8" />
            <Pressable onPress={envoyer} disabled={envoi || !texte.trim()} accessibilityLabel="Envoyer le commentaire"
              style={[styles.envoyer, (!texte.trim() || envoi) && { opacity: 0.4 }]}>
              {envoi ? <ActivityIndicator color="#fff" /> : <Ionicons name={enEdition ? 'checkmark' : 'send'} size={18} color="#fff" />}
            </Pressable>
          </View>
          <Text style={styles.signature}>Signé : {profil.nom} ({profil.email})</Text>
        </View>
      ) : (
        <View style={styles.note}>
          <Text style={styles.texteNote}>Pour commenter, indiquez votre nom et votre e-mail dans le Profil.</Text>
          <MiniBouton icon="person-circle-outline" label="Profil" onPress={() => navigation.navigate('Profil')} />
        </View>
      )}
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
    </Section>
  );
}

const styles = StyleSheet.create({
  gris: { color: COLORS.textLight, fontSize: 13 },
  note: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.sm, padding: 10,
  },
  texteNote: { flex: 1, color: COLORS.primaryDark, fontSize: 12.5, fontWeight: '600' },
  ligne: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  ligneMoi: { justifyContent: 'flex-end' },
  avatar: {
    width: 32, height: 32, borderRadius: 11, backgroundColor: COLORS.input,
    alignItems: 'center', justifyContent: 'center',
  },
  initiales: { color: COLORS.textLight, fontWeight: '800', fontSize: 12 },
  bulle: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, gap: 3 },
  bulleAutre: { backgroundColor: COLORS.input, borderBottomLeftRadius: 4 },
  bulleMoi: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  enteteBulle: { flexDirection: 'row', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' },
  auteur: { fontWeight: '800', fontSize: 13, color: COLORS.text },
  date: { fontSize: 11, color: COLORS.textLight },
  texte: { fontSize: 14.5, color: COLORS.text, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 14, alignSelf: 'flex-end', marginTop: 2 },
  saisie: { gap: 6, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  bandeauEdition: { flexDirection: 'row', justifyContent: 'space-between' },
  texteEdition: { color: COLORS.success, fontWeight: '700', fontSize: 12.5 },
  annuler: { color: COLORS.textLight, fontWeight: '700', fontSize: 12.5 },
  ligneSaisie: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  champ: {
    flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: COLORS.input, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: COLORS.text, outlineStyle: 'none',
  },
  envoyer: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  signature: { color: '#94A3B8', fontSize: 11.5 },
  erreur: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
});
