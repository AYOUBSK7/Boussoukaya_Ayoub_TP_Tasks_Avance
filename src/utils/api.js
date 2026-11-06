// Appels HTTP vers l'API Express (remplace AsyncStorage du dépôt « local »)
import { API_URL } from '../config';

async function requete(chemin, options = {}) {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), 8000); // abandon après 8 s
  try {
    const reponse = await fetch(API_URL + chemin, {
      headers: { 'Content-Type': 'application/json' },
      signal: controle.signal,
      ...options,
    });
    if (!reponse.ok) throw new Error(`Erreur serveur (${reponse.status})`);
    return reponse.status === 204 ? null : await reponse.json();
  } finally {
    clearTimeout(minuteur);
  }
}

export const chargerTaches = () => requete('/tasks');
export const creerTache = (tache) => requete('/tasks', { method: 'POST', body: JSON.stringify(tache) });
export const majTache = (id, modifs) => requete(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(modifs) });
export const supprimerTacheApi = (id) => requete(`/tasks/${id}`, { method: 'DELETE' });
export const reinitialiserApi = () => requete('/reset', { method: 'POST' });
