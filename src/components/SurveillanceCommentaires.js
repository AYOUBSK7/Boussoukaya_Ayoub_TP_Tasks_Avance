// Composant invisible : toutes les 10 secondes, il demande au serveur s'il y a
// de NOUVEAUX commentaires (écrits par d'autres) sur les tâches que j'observe.
//   GET /notifications?email=moi@…&depuis=<date de la dernière vérification>
// Pour chacun : notification (téléphone) ou bannière (web), puis on recharge les tâches.
import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useProfil } from '../context/ProfilContext';
import { chargerNotifications } from '../utils/api';
import { notifierMaintenant } from '../utils/rappels';

const INTERVALLE = 10000; // 10 secondes

export default function SurveillanceCommentaires() {
  const { rafraichir } = useTasks();
  const { profil, complet } = useProfil();
  const depuis = useRef(null); // date (heure du serveur) de la dernière vérification

  useEffect(() => {
    if (!complet) return undefined;
    depuis.current = null; // nouvel e-mail : on repart de maintenant

    const verifier = async () => {
      try {
        const { notifications, maintenant } = await chargerNotifications(profil.email, depuis.current);
        depuis.current = maintenant;
        for (const n of notifications) {
          notifierMaintenant(
            `Nouveau commentaire · ${n.titre}`,
            `${n.commentaire.auteur} : ${n.commentaire.texte}`,
            'chatbubble-ellipses'
          );
        }
        if (notifications.length > 0) rafraichir(); // afficher le commentaire dans l'app
      } catch (e) {
        // serveur injoignable : on réessaiera au prochain tour
      }
    };

    verifier();
    const minuteur = setInterval(verifier, INTERVALLE);
    return () => clearInterval(minuteur);
  }, [complet, profil.email, rafraichir]);

  return null;
}
