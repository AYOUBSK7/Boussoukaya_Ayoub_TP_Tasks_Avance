// Composant invisible (il n'affiche rien) qui gère les rappels en arrière-plan de l'interface :
//  1) rappels à une date : replanifiés à chaque changement de la liste des tâches
//  2) rappels de lieu : on suit la position GPS tant que l'application est ouverte,
//     et on envoie une notification quand on entre dans la zone d'une tâche.
import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useTasks } from '../context/TaskContext';
import { initNotifications, planifierRappelsDate, notifierMaintenant, distanceMetres } from '../utils/rappels';

export default function SurveillanceRappels() {
  const { taches } = useTasks();
  const tachesRef = useRef(taches);
  const dansLaZone = useRef(new Set()); // id des tâches déjà notifiées (on est dans la zone)
  tachesRef.current = taches;

  // Autorisation des notifications au démarrage
  useEffect(() => { initNotifications(); }, []);

  // 1) Rappels à une date
  useEffect(() => {
    planifierRappelsDate(taches);
  }, [taches]);

  // 2) Rappels de lieu : actif seulement s'il existe au moins une tâche avec un lieu
  const avecLieu = taches.some((t) => t.statut === 'a_faire' && t.rappelLieu);

  useEffect(() => {
    if (!avecLieu) return undefined;
    let abonnement = null;
    let annule = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || annule) return;
      abonnement = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15, timeInterval: 10000 },
        ({ coords }) => verifierPosition(coords)
      );
      if (annule) abonnement.remove();
    })();

    function verifierPosition(position) {
      for (const t of tachesRef.current) {
        if (t.statut !== 'a_faire' || !t.rappelLieu) continue;
        const d = distanceMetres(position, t.rappelLieu);
        const lieu = t.rappelLieu.nom || 'le lieu choisi';
        if (d <= t.rappelLieu.rayon && !dansLaZone.current.has(t.id)) {
          dansLaZone.current.add(t.id); // on ne notifie qu'une fois par entrée dans la zone
          notifierMaintenant(`📍 Vous êtes à : ${lieu}`, `N'oubliez pas : ${t.titre}`);
        } else if (d > t.rappelLieu.rayon * 1.2) {
          dansLaZone.current.delete(t.id); // sorti de la zone : on pourra notifier à nouveau
        }
      }
    }

    return () => {
      annule = true;
      if (abonnement) abonnement.remove();
    };
  }, [avecLieu]);

  return null;
}
