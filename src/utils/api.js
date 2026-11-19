// Appels HTTP vers l'API Express (remplace AsyncStorage du dépôt « local »)
import { Platform } from 'react-native';
import { API_URL } from '../config';

async function requete(chemin, { delai = 8000, ...options } = {}) {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), delai); // abandon après le délai
  // JSON → on précise le Content-Type ; FormData (fichier) → fetch le met tout seul
  const headers = typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {};
  try {
    const reponse = await fetch(API_URL + chemin, { headers, signal: controle.signal, ...options });
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

// ---------- Fichiers joints ----------
// fichier = { uri, nom, mime, file } (file existe seulement sur le web)
export async function envoyerFichier(id, { uri, nom, mime, file }) {
  const form = new FormData();
  if (Platform.OS === 'web') {
    // sur le web il faut un vrai Blob / File
    const blob = file || (await (await fetch(uri)).blob());
    form.append('fichier', blob, nom);
  } else {
    // sur Android / iOS : objet { uri, name, type } lu par React Native
    form.append('fichier', { uri, name: nom, type: mime || 'application/octet-stream' });
  }
  form.append('nom', nom);
  return requete(`/tasks/${id}/fichiers`, { method: 'POST', body: form, delai: 60000 });
}

export const renommerFichierApi = (id, fid, nom) =>
  requete(`/tasks/${id}/fichiers/${fid}`, { method: 'PUT', body: JSON.stringify({ nom }) });

export const supprimerFichierApi = (id, fid) => requete(`/tasks/${id}/fichiers/${fid}`, { method: 'DELETE' });

// Adresse d'un fichier joint pour l'AFFICHER (miniature, plein écran)
export const urlFichier = (piece) => API_URL + piece.url;

// Adresse de la route API qui RENVOIE le fichier à télécharger (GET)
export const urlTelechargement = (id, piece) => `${API_URL}/tasks/${id}/fichiers/${piece.id}`;

// ---------- Commentaires ----------
export const ajouterCommentaireApi = (id, commentaire) =>
  requete(`/tasks/${id}/commentaires`, { method: 'POST', body: JSON.stringify(commentaire) });

export const modifierCommentaireApi = (id, cid, texte) =>
  requete(`/tasks/${id}/commentaires/${cid}`, { method: 'PUT', body: JSON.stringify({ texte }) });

export const supprimerCommentaireApi = (id, cid) =>
  requete(`/tasks/${id}/commentaires/${cid}`, { method: 'DELETE' });

// Nouveaux commentaires pour un observateur depuis une date → { notifications, maintenant }
export const chargerNotifications = (email, depuis) =>
  requete(`/notifications?email=${encodeURIComponent(email)}${depuis ? `&depuis=${encodeURIComponent(depuis)}` : ''}`);
