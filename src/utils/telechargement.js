// Récupérer un fichier depuis l'API — version Android / iOS
// 1) GET /tasks/:id/fichiers/:fid  → le serveur renvoie le fichier
// 2) expo-file-system l'enregistre dans le dossier de l'application
// 3) expo-sharing ouvre le menu « Ouvrir avec / Enregistrer / Partager »
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { urlTelechargement } from './api';

export async function telechargerFichier(tacheId, piece) {
  const nomPropre = piece.nom.replace(/[\\/:*?"<>|]/g, '_'); // caractères interdits dans un nom de fichier
  const destination = new File(Paths.document, nomPropre);
  const fichier = await File.downloadFileAsync(urlTelechargement(tacheId, piece), destination, { idempotent: true });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fichier.uri, { mimeType: piece.mime, dialogTitle: piece.nom });
  }
  return fichier.uri;
}
