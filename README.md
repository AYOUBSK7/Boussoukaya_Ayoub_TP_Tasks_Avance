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
| DELETE | `/tasks/:id` | supprimer |
| POST | `/reset` | remettre les tâches d'exemple |

Les données sont enregistrées dans `server/data/tasks.json`.

## Fonctionnement côté application

- Au démarrage, `TaskContext` charge la liste avec `GET /tasks` (écran de chargement pendant ce temps).
- Chaque action (ajout, modification, suppression, statut) met l'écran à jour **tout de suite**, puis envoie la requête. Si elle échoue, la liste est rechargée depuis le serveur et un message apparaît dans l'onglet **Profil** (état « Connecté / Hors ligne » + bouton « Actualiser »).
- Sans connexion, rien n'est conservé sur le téléphone : c'est la différence avec les versions 1 et 3.

## 2. Arborescence

```
boussoukaya_ayoub_tp_tasks_api/
├── App.js, index.js, app.json, package.json   ← application Expo
├── server/                      ← API Express
│   ├── index.js                 ← routes REST + stockage dans data/tasks.json
│   ├── initial.js               ← tâches d'exemple
│   └── package.json
└── src/
    ├── config.js                ← adresse du serveur (API_URL)
    ├── utils/api.js             ← appels fetch vers l'API (remplace AsyncStorage)
    ├── utils/helpers.js         ← format de date, id unique, confirmation
    ├── context/TaskContext.js   ← état global + CRUD relié à l'API
    ├── constants/theme.js, components/, navigation/, screens/   ← interface (identique à la version locale)
```

## 3. Modèle d'une tâche

```js
{
  id: '1',
  titre: 'Préparer la présentation',
  description: 'Réaliser les diapositives…',
  priorite: 'elevee',        // 'faible' | 'moyenne' | 'elevee'
  statut: 'a_faire',         // 'a_faire' | 'terminee'
  dateCreation: '2025-04-12T09:00:00.000Z'
}
```
