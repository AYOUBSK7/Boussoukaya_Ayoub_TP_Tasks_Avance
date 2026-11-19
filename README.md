# MyTasks — Version avancée

**Ayoub Boussoukaya — L3 DSI — ISET Djerba** · TP React Native (Expo SDK 58) + API Express

Application de gestion de tâches. Les tâches sont enregistrées sur un serveur **Express** (API REST).
Cette version ajoute : **caméra**, **fichiers** (envoi et téléchargement), **rappels** à une date et à un lieu
(carte **OpenStreetMap**), **observateurs** et **commentaires avec notification**.

> Autres dépôts du TP : `Boussoukaya_Ayoub_TP_Tasks_Local`, `..._API`, `..._Hybride`.

---

## 1. Lancer le projet

**Terminal 1 — le serveur** (port 3000)
```bash
cd server
npm install
npm start
```

**Terminal 2 — l'application**
```bash
npm install
npx expo start -c      # a = émulateur Android, w = navigateur, QR code = Expo Go
```

| L'app tourne sur… | Adresse du serveur (`src/config.js`) |
|---|---|
| Émulateur Android | `http://10.0.2.2:3000` (10.0.2.2 = le PC) |
| Navigateur | `http://localhost:3000` |
| Vrai téléphone | `EXPO_PUBLIC_API_URL=http://<IP du PC>:3000 npx expo start` |

---

## 2. Les 6 fonctionnalités demandées

Toutes se trouvent dans l'écran **Détails** d'une tâche, rangées en 3 onglets : **Fichiers · Rappels · Suivi**.

| # | Demande | Comment c'est fait | Fichiers |
|---|---|---|---|
| 1 | **Communiquer avec la caméra** | Téléphone : `expo-image-picker` (`launchCameraAsync`). Navigateur : webcam du PC avec `getUserMedia` + capture dans un `<canvas>` | `SectionPiecesJointes.js`, `CameraWeb.web.js` |
| 2 | **Ajouter un fichier** | `expo-document-picker` → envoi en **FormData** (`POST /tasks/:id/fichiers`) → **multer** range le fichier dans `server/uploads/` | `utils/api.js`, `server/index.js` |
| 3 | **Appeler une API pour récupérer un fichier** | Bouton ⬇ → `GET /tasks/:id/fichiers/:fid` (le serveur répond avec `res.download`). Téléphone : `expo-file-system` enregistre puis `expo-sharing` ouvre / partage. Navigateur : `fetch` → Blob → téléchargement | `utils/telechargement.js` / `.web.js` |
| 4 | **Rappel à une date et une heure** | Sélecteur date + heure (ou « Dans 1 min / 1 h / Demain 9 h ») → `rappelDate` sur le serveur → notification locale programmée (`expo-notifications`) | `SectionRappels.js`, `utils/rappels.js` |
| 5 | **Rappel à une position (carte)** | Carte **OpenStreetMap** (Leaflet dans une WebView) : on touche la carte ou « Ma position », on choisit un rayon. L'app suit la position (`expo-location`) et notifie en entrant dans la zone (formule de **haversine**) | `LieuScreen.js`, `CarteOSM.js`, `SurveillanceRappels.js` |
| 6 | **Observateurs + commentaires + notification** | Observateurs (nom + e-mail). Commentaires sur la tâche (ajouter / modifier / supprimer les siens). Toutes les 10 s, l'app appelle `GET /notifications` : chaque nouveau commentaire écrit par quelqu'un d'autre sur une tâche observée → **notification** (bannière sur le web) | `SectionObservateurs.js`, `SectionCommentaires.js`, `SurveillanceCommentaires.js` |

**Mon identité** (onglet Profil) : nom + e-mail enregistrés sur l'appareil (AsyncStorage). Ils signent les commentaires,
et c'est cet e-mail qui reçoit les notifications quand il est dans la liste des observateurs.

---

## 3. Routes de l'API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/tasks` | liste des tâches |
| POST | `/tasks` | créer une tâche |
| PUT | `/tasks/:id` | modifier (titre, statut, rappels, observateurs) |
| DELETE | `/tasks/:id` | supprimer la tâche et ses fichiers |
| POST | `/tasks/:id/fichiers` | envoyer un fichier (multipart, champ `fichier`, 10 Mo max) |
| **GET** | **`/tasks/:id/fichiers/:fid`** | **récupérer (télécharger) le fichier** |
| PUT | `/tasks/:id/fichiers/:fid` | renommer un fichier |
| DELETE | `/tasks/:id/fichiers/:fid` | supprimer un fichier |
| POST | `/tasks/:id/commentaires` | ajouter un commentaire `{ auteur, email, texte }` |
| PUT | `/tasks/:id/commentaires/:cid` | modifier un commentaire |
| DELETE | `/tasks/:id/commentaires/:cid` | supprimer un commentaire |
| GET | `/notifications?email=…&depuis=…` | nouveaux commentaires pour un observateur |
| GET | `/uploads/<nom>` | afficher un fichier (miniatures) |
| POST | `/reset` | remettre les tâches d'exemple |

Données : `server/data/tasks.json` · fichiers : `server/uploads/`.

---

## 4. Modèle d'une tâche

```js
{
  id, titre, description, priorite, statut, dateCreation,
  piecesJointes: [{ id, nom, type: 'image' | 'fichier', mime, taille, url }],
  rappelDate: '2026-11-20T08:00:00.000Z',                          // ou null
  rappelLieu: { latitude, longitude, rayon: 200, nom: 'Bureau' }, // ou null
  observateurs: [{ id, nom, email }],
  commentaires: [{ id, auteur, email, texte, date, modifie? }]
}
```

---

## 5. Démo rapide

1. **Profil** : saisir son nom + e-mail → « Enregistrer mon profil ».
2. Ouvrir une tâche → onglet **Fichiers** : Caméra (photo), Fichier (PDF), ⬇ pour le télécharger via l'API.
3. Onglet **Rappels** : « Dans 1 min » → notification. « Choisir sur la carte » → Bureau, 200 m → Enregistrer.
   Émulateur : `⋯` → **Location** → placer le point dans le cercle → **Set location** → notification.
4. Onglet **Suivi** : ajouter un observateur, écrire un commentaire.
5. **Notification de commentaire** : ouvrir l'app sur 2 appareils (ex. navigateur + émulateur) avec 2 profils.
   L'un « Suit cette tâche », l'autre commente → en 10 s le premier reçoit la notification.

⚠️ Avec **Expo Go**, le rappel de lieu et les notifications de commentaires fonctionnent quand l'app est ouverte
(en arrière-plan, il faudrait un build Android + `expo-task-manager` / notifications push).

---

## 6. Arborescence

```
├── App.js                      Providers + surveillances (rappels, commentaires) + bannière
├── server/index.js             API Express : tâches, fichiers (multer), commentaires, notifications
└── src/
    ├── config.js               adresse du serveur
    ├── context/                TaskContext (tâches + API) · ProfilContext (mon nom + e-mail)
    ├── utils/                  api.js · rappels.js · telechargement.js (.web.js) · banniere.js · helpers.js
    ├── screens/                Accueil · Liste · Détails (onglets) · Formulaire · Lieu (carte) · Profil
    └── components/             SectionPiecesJointes · SectionRappels · SectionObservateurs ·
                                SectionCommentaires · CarteOSM · CameraWeb · BoutonDate · Onglets ·
                                SurveillanceRappels · SurveillanceCommentaires · Banniere · …
```

## 7. Bibliothèques

`expo-image-picker` (caméra, galerie) · `expo-document-picker` (fichier) · `expo-file-system` + `expo-sharing`
(téléchargement) · `expo-notifications` (rappels) · `expo-location` (position) · `react-native-webview` (carte
Leaflet / OpenStreetMap) · `@react-native-community/datetimepicker` · `@react-native-async-storage/async-storage`
(profil) · serveur : `express`, `cors`, `multer`.
