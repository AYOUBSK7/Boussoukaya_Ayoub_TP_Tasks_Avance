// Récupérer un fichier depuis l'API — version web
// 1) fetch(GET /tasks/:id/fichiers/:fid) → on reçoit le fichier (Blob)
// 2) on crée un lien temporaire et on « clique » dessus → le navigateur l'enregistre
import { urlTelechargement } from './api';

export async function telechargerFichier(tacheId, piece) {
  const reponse = await fetch(urlTelechargement(tacheId, piece));
  if (!reponse.ok) throw new Error(`Erreur serveur (${reponse.status})`);
  const blob = await reponse.blob();
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = piece.nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
  return piece.nom;
}
