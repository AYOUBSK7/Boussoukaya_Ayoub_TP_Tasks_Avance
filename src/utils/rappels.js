// Rappels : notifications locales (expo-notifications) + calcul de distance (rappel de lieu)
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { afficherBanniere } from './banniere';

const WEB = Platform.OS === 'web'; // pas de notifications locales sur le web

// Comment afficher une notification quand l'application est ouverte
if (!WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
    }),
  });
}

// Demande l'autorisation (une seule fois) + canal Android
export async function initNotifications() {
  if (WEB) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rappels', {
      name: 'Rappels de tâches',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Planifie un rappel à une date précise pour chaque tâche « à faire ».
// Simple : on annule tout, puis on replanifie à partir de la liste du serveur.
// Les appels sont mis à la file (un seul à la fois) pour éviter les doublons.
let file = Promise.resolve();
export function planifierRappelsDate(taches) {
  file = file.then(() => planifier(taches)).catch((e) => console.log('Rappels date :', e.message));
  return file;
}

async function planifier(taches) {
  if (WEB) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const maintenant = Date.now();
  for (const t of taches) {
    if (t.statut !== 'a_faire' || !t.rappelDate) continue;
    const date = new Date(t.rappelDate);
    if (date.getTime() <= maintenant) continue; // date déjà passée
    await Notifications.scheduleNotificationAsync({
      content: { title: `⏰ Rappel : ${t.titre}`, body: t.description || 'Tâche à faire', data: { id: t.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'rappels' },
    });
  }
}

// Notification immédiate (rappel de lieu, nouveau commentaire)
// Sur le web : bannière dans l'application (pas de notifications locales)
export async function notifierMaintenant(titre, corps, icon = 'notifications') {
  if (WEB) {
    afficherBanniere({ titre, texte: corps, icon });
    return;
  }
  await Notifications.scheduleNotificationAsync({ content: { title: titre, body: corps }, trigger: null });
}

// Distance en mètres entre deux points GPS (formule de haversine)
export function distanceMetres(a, b) {
  const R = 6371000; // rayon de la Terre en mètres
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
