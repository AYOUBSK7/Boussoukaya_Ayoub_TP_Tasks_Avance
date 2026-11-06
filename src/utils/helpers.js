import { Alert, Platform } from 'react-native';

// Formate une date ISO en jj/mm/aaaa (ex : 12/04/2025)
export function formaterDate(iso) {
  const d = new Date(iso);
  const jour = String(d.getDate()).padStart(2, '0');
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}/${d.getFullYear()}`;
}

// Génère un identifiant unique simple
export function genererId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

// Boîte de confirmation qui marche sur mobile (Alert) ET sur le web (window.confirm)
export function confirmer(titre, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titre}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
  ]);
}
