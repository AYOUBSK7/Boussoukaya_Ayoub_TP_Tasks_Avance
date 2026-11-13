// Bouton « Choisir date et heure » — version Android / iOS
// (le fichier BoutonDate.web.js est utilisé automatiquement sur le web)
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MiniBouton } from './Section';

export default function BoutonDate({ valeur, onChoisir }) {
  const [ouvert, setOuvert] = useState(false); // iOS : sélecteur affiché dans la page
  const [temp, setTemp] = useState(valeur);

  const ouvrir = () => {
    if (Platform.OS === 'android') {
      // Android : d'abord la date, puis l'heure (deux boîtes de dialogue)
      DateTimePickerAndroid.open({
        value: valeur, mode: 'date', minimumDate: new Date(),
        onChange: (e, jour) => {
          if (e.type !== 'set' || !jour) return;
          DateTimePickerAndroid.open({
            value: jour, mode: 'time', is24Hour: true,
            onChange: (e2, heure) => { if (e2.type === 'set' && heure) onChoisir(heure); },
          });
        },
      });
    } else {
      setTemp(valeur);
      setOuvert(true);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <MiniBouton icon="calendar-outline" label="Choisir date et heure" onPress={ouvrir} />
      {ouvert && (
        <>
          <DateTimePicker value={temp} mode="datetime" display="inline" minimumDate={new Date()}
            onChange={(_e, d) => d && setTemp(d)} />
          <MiniBouton icon="checkmark" label="Valider" onPress={() => { setOuvert(false); onChoisir(temp); }} />
        </>
      )}
    </View>
  );
}
