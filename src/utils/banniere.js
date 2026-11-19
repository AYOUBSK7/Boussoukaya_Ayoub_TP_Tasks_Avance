// Petit système de « bannière » (message en haut de l'écran) utilisable partout :
//   afficherBanniere({ titre, texte, icon })
// Le composant <Banniere /> (dans App.js) écoute ces messages et les affiche.
let ecouteur = null;

export function ecouterBannieres(fonction) {
  ecouteur = fonction;
  return () => { ecouteur = null; };
}

export function afficherBanniere(message) {
  if (ecouteur) ecouteur(message);
}
