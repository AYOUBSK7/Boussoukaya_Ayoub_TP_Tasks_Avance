// API REST de MyTasks — Express + stockage dans un fichier JSON (data/tasks.json)
//
//   GET    /tasks        → liste des tâches
//   GET    /tasks/:id    → une tâche
//   POST   /tasks        → créer une tâche
//   PUT    /tasks/:id    → modifier une tâche
//   DELETE /tasks/:id    → supprimer une tâche
//   POST   /reset        → remettre les tâches d'exemple
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const INITIALES = require('./initial');

const PORT = process.env.PORT || 3000;
const FICHIER = process.env.DATA_FILE || path.join(__dirname, 'data', 'tasks.json');
const PRIORITES = ['faible', 'moyenne', 'elevee'];
const STATUTS = ['a_faire', 'terminee'];

// ---------- persistance (lecture / écriture du fichier JSON) ----------
function lire() {
  try {
    return JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
  } catch {
    ecrire(INITIALES); // premier lancement : on crée le fichier
    return [...INITIALES];
  }
}
function ecrire(taches) {
  fs.mkdirSync(path.dirname(FICHIER), { recursive: true });
  fs.writeFileSync(FICHIER, JSON.stringify(taches, null, 2));
}

// ---------- validation ----------
function valider(corps, partiel = false) {
  const e = [];
  const { titre, description, priorite, statut } = corps;
  if (!partiel || titre !== undefined) {
    if (typeof titre !== 'string' || titre.trim().length < 3) e.push('titre : au moins 3 caractères');
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 200)) {
    e.push('description : 200 caractères maximum');
  }
  if (priorite !== undefined && !PRIORITES.includes(priorite)) e.push('priorite invalide');
  if (statut !== undefined && !STATUTS.includes(statut)) e.push('statut invalide');
  return e;
}

// ---------- application ----------
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

app.get('/', (_req, res) => res.json({ nom: 'MyTasks API', routes: ['/tasks', '/reset'] }));

app.get('/tasks', (_req, res) => res.json(lire()));

app.get('/tasks/:id', (req, res) => {
  const t = lire().find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ erreur: 'Tâche introuvable' });
  res.json(t);
});

app.post('/tasks', (req, res) => {
  const erreurs = valider(req.body);
  if (erreurs.length) return res.status(400).json({ erreurs });
  const taches = lire();
  const id = typeof req.body.id === 'string' && req.body.id ? req.body.id
    : Date.now().toString() + Math.random().toString(36).slice(2, 7);
  const tache = {
    id,
    titre: req.body.titre.trim(),
    description: (req.body.description || '').trim(),
    priorite: req.body.priorite || 'moyenne',
    statut: req.body.statut || 'a_faire',
    dateCreation: req.body.dateCreation || new Date().toISOString(),
  };
  ecrire([tache, ...taches.filter((x) => x.id !== id)]);
  res.status(201).json(tache);
});

app.put('/tasks/:id', (req, res) => {
  const erreurs = valider(req.body, true);
  if (erreurs.length) return res.status(400).json({ erreurs });
  const taches = lire();
  const i = taches.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ erreur: 'Tâche introuvable' });
  const { titre, description, priorite, statut } = req.body;
  const maj = { ...taches[i] };
  if (titre !== undefined) maj.titre = titre.trim();
  if (description !== undefined) maj.description = description.trim();
  if (priorite !== undefined) maj.priorite = priorite;
  if (statut !== undefined) maj.statut = statut;
  taches[i] = maj;
  ecrire(taches);
  res.json(maj);
});

app.delete('/tasks/:id', (req, res) => {
  const taches = lire();
  if (!taches.some((x) => x.id === req.params.id)) return res.status(404).json({ erreur: 'Tâche introuvable' });
  ecrire(taches.filter((x) => x.id !== req.params.id));
  res.status(204).end();
});

app.post('/reset', (_req, res) => {
  ecrire(INITIALES);
  res.json(INITIALES);
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => console.log(`MyTasks API sur http://localhost:${PORT}`));
}
module.exports = app;
