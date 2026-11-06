// Thème visuel moderne : couleurs, dégradés, rayons, ombres
export const COLORS = {
  primary: '#6366F1',        // indigo
  primaryDark: '#4F46E5',
  primarySoft: '#EEF2FF',
  success: '#10B981',        // émeraude
  successSoft: '#D1FAE5',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  background: '#F6F7FB',     // fond des écrans
  card: '#FFFFFF',
  input: '#F1F5F9',          // fond des champs
  text: '#0F172A',           // texte principal (slate 900)
  textLight: '#64748B',      // texte secondaire (slate 500)
  border: '#E2E8F0',
};

// Dégradés (expo-linear-gradient)
export const GRADIENTS = {
  primary: ['#6366F1', '#8B5CF6'],   // indigo → violet
  success: ['#10B981', '#059669'],
  danger: ['#F87171', '#EF4444'],
};

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28 };

// Ombre douce réutilisable (iOS + Android + web)
export const SHADOW = {
  shadowColor: '#1E1B4B',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

// Les 3 niveaux de priorité
export const PRIORITES = {
  faible: { label: 'Faible', color: '#10B981', bg: '#D1FAE5', icon: 'arrow-down' },
  moyenne: { label: 'Moyenne', color: '#F59E0B', bg: '#FEF3C7', icon: 'remove' },
  elevee: { label: 'Élevée', color: '#EF4444', bg: '#FEE2E2', icon: 'arrow-up' },
};

// Les 2 statuts
export const STATUTS = {
  a_faire: { label: 'À faire', color: '#6366F1', bg: '#EEF2FF', icon: 'time-outline' },
  terminee: { label: 'Terminée', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle' },
};

export const FILTRES = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'a_faire', label: 'À faire' },
  { key: 'terminee', label: 'Terminées' },
];
