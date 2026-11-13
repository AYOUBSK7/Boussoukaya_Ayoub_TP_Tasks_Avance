// Bouton « Choisir date et heure » — version web : champ HTML datetime-local
import React from 'react';
import { COLORS, RADIUS } from '../constants/theme';

// Date → "AAAA-MM-JJTHH:MM" (format attendu par le champ HTML, heure locale)
function versChamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function BoutonDate({ valeur, onChoisir }) {
  return React.createElement('input', {
    type: 'datetime-local',
    defaultValue: versChamp(valeur),
    min: versChamp(new Date()),
    onChange: (e) => { if (e.target.value) onChoisir(new Date(e.target.value)); },
    style: {
      fontSize: 15, padding: 10, borderRadius: RADIUS.md, border: `1.5px solid ${COLORS.border}`,
      color: COLORS.text, fontFamily: 'inherit', alignSelf: 'flex-start',
    },
  });
}
