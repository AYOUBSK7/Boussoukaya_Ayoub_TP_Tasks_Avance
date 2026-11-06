// Gestion de l'état global des tâches — VERSION API (en ligne)
// Les données vivent sur le serveur. Chaque action met à jour l'écran tout de suite
// (mise à jour « optimiste »), envoie la requête au serveur, et si elle échoue
// on recharge la liste du serveur pour revenir à l'état réel.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../utils/api';
import { genererId } from '../utils/helpers';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [taches, setTaches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null); // message si le serveur est injoignable

  // Charger (ou recharger) la liste depuis le serveur
  const rafraichir = useCallback(async () => {
    try {
      setTaches(await api.chargerTaches());
      setErreur(null);
    } catch (e) {
      setErreur('Serveur injoignable. Vérifiez que l’API est lancée.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { rafraichir(); }, [rafraichir]);

  // Envoie une requête ; en cas d'échec : message + rechargement de la vraie liste
  const envoyer = async (requete) => {
    try {
      await requete();
      setErreur(null);
    } catch (e) {
      setErreur('Action non enregistrée : serveur injoignable.');
      rafraichir();
    }
  };

  // ---------- Opérations CRUD ----------
  const ajouterTache = ({ titre, description, priorite }) => {
    const nouvelle = {
      id: genererId(),
      titre: titre.trim(),
      description: description.trim(),
      priorite,
      statut: 'a_faire',
      dateCreation: new Date().toISOString(),
    };
    setTaches((prev) => [nouvelle, ...prev]);
    envoyer(() => api.creerTache(nouvelle));
  };

  const getTache = (id) => taches.find((t) => t.id === id);

  const modifierTache = (id, modifications) => {
    setTaches((prev) => prev.map((t) => (t.id === id ? { ...t, ...modifications } : t)));
    envoyer(() => api.majTache(id, modifications));
  };

  const supprimerTache = (id) => {
    setTaches((prev) => prev.filter((t) => t.id !== id));
    envoyer(() => api.supprimerTacheApi(id));
  };

  const basculerStatut = (id) => {
    const t = taches.find((x) => x.id === id);
    if (t) modifierTache(id, { statut: t.statut === 'a_faire' ? 'terminee' : 'a_faire' });
  };

  const reinitialiser = async () => {
    try {
      setTaches(await api.reinitialiserApi());
      setErreur(null);
    } catch (e) {
      setErreur('Réinitialisation impossible : serveur injoignable.');
    }
  };

  const stats = useMemo(() => {
    const terminees = taches.filter((t) => t.statut === 'terminee').length;
    return { total: taches.length, terminees, aFaire: taches.length - terminees };
  }, [taches]);

  const valeur = {
    taches, chargement, erreur, stats, rafraichir,
    ajouterTache, getTache, modifierTache, supprimerTache, basculerStatut, reinitialiser,
  };

  return <TaskContext.Provider value={valeur}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks doit être utilisé dans <TaskProvider>');
  return ctx;
}
