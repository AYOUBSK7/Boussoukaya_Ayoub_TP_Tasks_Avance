# MyTasks — Version 2 : EN LIGNE (API Express)

**Ayoub Boussoukaya — L3 DSI — ISET Djerba** · TP React Native (Expo SDK 58)

> Ce dépôt fait partie d'un TP en 3 versions de la même application :
> 1. **Local** : AsyncStorage, sans serveur.
> 2. **API** (ce dépôt) : les tâches sont uniquement sur le serveur Express ; sans serveur l'application n'a pas de données.
> 3. **Hybride** : stockage local + synchronisation avec le serveur.

## 1. Installation et lancement

**Terminal 1 — le serveur** (port 3000) :
```bash
cd server
npm install
npm start
```

**Terminal 2 — l'application** :
```bash
npm install
npx expo start        # puis a (Android), w (web) ou QR code avec Expo Go
```

Adresse du serveur (`src/config.js`) :

| Où tourne l'app | Adresse utilisée |
|---|---|
| Émulateur Android | `http://10.0.2.2:3000` (10.0.2.2 = le PC) |
| Web / simulateur iOS | `http://localhost:3000` |
| Vrai téléphone | IP du PC : `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start` |

## Routes de l'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/tasks` | liste des tâches |
| GET | `/tasks/:id` | une tâche |
| POST | `/tasks` | créer (titre ≥ 3 caractères) |
| PUT | `/tasks/:id` | modifier |
| DELETE | `/tasks/:id` | supprimer (et ses fichiers) |
| POST | `/tasks/:id/fichiers` | joindre un fichier (multipart, champ `fichier`, 10 Mo max) |
| PUT | `/tasks/:id/fichiers/:fid` | renommer un fichier joint |
| DELETE | `/tasks/:id/fichiers/:fid` | retirer un fichier joint |
| GET | `/uploads/<nom>` | afficher / télécharger un fichier joint |
| POST | `/reset` | remettre les tâches d'exemple |

Les données sont enregistrées dans `server/data/tasks.json`, les fichiers joints dans `server/uploads/`.

## Fonctionnement côté application

- Au démarrage, `TaskContext` charge la liste avec `GET /tasks` (écran de chargement pendant ce temps).
- Chaque action (ajout, modification, suppression, statut) met l'écran à jour **tout de suite**, puis envoie la requête. Si elle échoue, la liste est rechargée depuis le serveur et un message apparaît dans l'onglet **Profil** (état « Connecté / Hors ligne » + bouton « Actualiser »).
- Sans connexion, rien n'est conservé sur le téléphone : c'est la différence avec les versions 1 et 3.

## Partie 2 — Nouvelles fonctionnalités

Tout se trouve dans l'écran **Détails** d'une tâche (sections sous les boutons) :

| Fonction | Comment | Bibliothèque |
|---|---|---|
| **Photo (caméra)** | bouton « Caméra » : caméra du téléphone, ou **webcam du PC** sur le web (`CameraWeb.web.js`, `getUserMedia`) | `expo-image-picker` |
| **Image (galerie)** | bouton « Galerie » ; toucher une image = plein écran | `expo-image-picker` |
| **Fichier** | bouton « Fichier » (PDF, Word…) ; toucher = ouvrir / télécharger | `expo-document-picker` |
| **Modifier / supprimer un fichier** | ✏️ renommer, 🗑 supprimer (aussi effacé du disque du serveur) | — |
| **Rappel à une date** | « Choisir date et heure » ou raccourcis (Dans 1 min, Dans 1 h, Demain 9 h) → notification | `@react-native-community/datetimepicker`, `expo-notifications` |
| **Rappel de lieu** | « Choisir sur la carte » : toucher la carte ou « Ma position actuelle », nom du lieu (ex. Bureau), rayon → notification en entrant dans la zone | `expo-location` |
| **Carte** | OpenStreetMap avec Leaflet, affichée dans une WebView (iframe sur le web) | `react-native-webview` |
| **Observateurs** | ajouter (nom + e-mail), ✏️ modifier, 🗑 supprimer ; bouton « Prévenir » = e-mail à tous | — |

La liste des tâches affiche aussi de petites icônes (📎 fichiers, ⏰ date, 📍 lieu, 👁 observateurs).

**Comment ça marche :**
- Les fichiers sont envoyés avec `FormData` (`src/utils/api.js`) et rangés par **multer** dans `server/uploads/`.
- Les rappels sont enregistrés sur le serveur (`rappelDate`, `rappelLieu`) ; le composant invisible `SurveillanceRappels` programme les notifications sur le téléphone.
- Rappel de lieu : l'app suit la position (`watchPositionAsync`) et calcule la distance avec la formule de **haversine** (`src/utils/rappels.js`). Une seule notification par entrée dans la zone.
- ⚠️ Avec **Expo Go**, le rappel de lieu marche seulement **quand l'application est ouverte** (le suivi en arrière-plan demande un build Android). Expo Go peut aussi afficher un avertissement sur les notifications *push* : il ne concerne pas nos notifications locales.
- La carte charge Leaflet et les tuiles OpenStreetMap depuis Internet : le téléphone / l'émulateur doit être connecté.

**Tester sur l'émulateur Android :**
1. Rappel date : bouton « Dans 1 min », attendre → notification.
2. Caméra : l'émulateur fournit une caméra virtuelle (scène 3D). Sur le web (`w`), le navigateur demande l'accès à la webcam du PC.
3. Rappel de lieu : choisir un lieu sur la carte, puis dans l'émulateur `⋯` (Extended controls) → **Location** → placer le point dans la zone → **Set location** → notification.

## 2. Arborescence

```
boussoukaya_ayoub_tp_tasks_api/
├── App.js, index.js, app.json, package.json   ← application Expo
├── server/                      ← API Express
│   ├── index.js                 ← routes REST + fichiers (multer) + stockage dans data/tasks.json
│   ├── initial.js               ← tâches d'exemple
│   └── package.json
└── src/
    ├── config.js                ← adresse du serveur (API_URL)
    ├── utils/api.js             ← appels fetch vers l'API (remplace AsyncStorage)
    ├── utils/helpers.js         ← format de date, id unique, confirmation
    ├── utils/rappels.js         ← notifications + distance GPS (haversine)
    ├── context/TaskContext.js   ← état global + CRUD relié à l'API + fichiers joints
    ├── components/
    │   ├── SectionPiecesJointes.js  ← caméra, galerie, fichiers
    │   ├── SectionRappels.js        ← rappel date + rappel lieu
    │   ├── SectionObservateurs.js   ← observateurs
    │   ├── CarteOSM.js              ← carte OpenStreetMap (Leaflet)
    │   ├── BoutonDate.js / .web.js  ← choix date et heure (mobile / web)
    │   └── SurveillanceRappels.js   ← programme les notifications, suit la position
    ├── screens/LieuScreen.js    ← choisir le lieu du rappel sur la carte
    └── constants/, navigation/, autres screens/   ← interface de base
```

## 3. Modèle d'une tâche

```js
{
  id: '1',
  titre: 'Préparer la présentation',
  description: 'Réaliser les diapositives…',
  priorite: 'elevee',        // 'faible' | 'moyenne' | 'elevee'
  statut: 'a_faire',         // 'a_faire' | 'terminee'
  dateCreation: '2025-04-12T09:00:00.000Z',
  piecesJointes: [{ id, nom: 'photo.jpg', type: 'image', mime, taille, url: '/uploads/…' }],
  rappelDate: '2026-11-20T08:00:00.000Z',              // ou null
  rappelLieu: { latitude, longitude, rayon: 200, nom: 'Bureau' }, // ou null
  observateurs: [{ id, nom: 'Prof', email: 'prof@iset.tn' }]
}
```
