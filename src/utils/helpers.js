import { Alert, Platform } from 'react-native';

// Formate une date ISO en jj/mm/aaaa (ex : 12/04/2025)
export function formaterDate(iso) {
  const d = new Date(iso);
  const jour = String(d.getDate()).padStart(2, '0');
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  return `${jour}/${mois}/${d.getFullYear()}`;
}

// Formate une date ISO en jj/mm/aaaa à hh:mm (ex : 12/04/2025 à 09:30)
export function formaterDateHeure(iso) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${formaterDate(iso)} à ${h}:${m}`;
}

// Taille lisible d'un fichier (ex : 1,2 Mo)
export function formaterTaille(octets = 0) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
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
