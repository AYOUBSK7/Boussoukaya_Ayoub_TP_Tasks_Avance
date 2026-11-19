// Mon identité (nom + e-mail), enregistrée sur le téléphone avec AsyncStorage.
// Elle sert à signer les commentaires et à recevoir les notifications
// des tâches que j'observe (mon e-mail est dans la liste des observateurs).
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLE = '@mytasks/profil';
const ProfilContext = createContext(null);

export function ProfilProvider({ children }) {
  const [profil, setProfil] = useState({ nom: 'Ayoub Boussoukaya', email: '' });

  useEffect(() => {
    AsyncStorage.getItem(CLE)
      .then((json) => { if (json) setProfil(JSON.parse(json)); })
      .catch(() => {});
  }, []);

  const enregistrerProfil = async (nouveau) => {
    const p = { nom: nouveau.nom.trim(), email: nouveau.email.trim().toLowerCase() };
    setProfil(p);
    await AsyncStorage.setItem(CLE, JSON.stringify(p));
  };

  // Profil complet = on peut commenter et recevoir des notifications
  const complet = profil.nom.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profil.email);

  return (
    <ProfilContext.Provider value={{ profil, complet, enregistrerProfil }}>
      {children}
    </ProfilContext.Provider>
  );
}

export const useProfil = () => useContext(ProfilContext);
