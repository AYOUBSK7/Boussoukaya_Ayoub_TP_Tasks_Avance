// API REST de MyTasks — Express + stockage dans un fichier JSON (data/tasks.json)
// Les fichiers joints (photos, documents) sont rangés dans le dossier uploads/.
//
//   GET    /tasks                     → liste des tâches
//   GET    /tasks/:id                 → une tâche
//   POST   /tasks                     → créer une tâche
//   PUT    /tasks/:id                 → modifier (titre, statut, rappels, observateurs…)
//   DELETE /tasks/:id                 → supprimer (et ses fichiers)
//   POST   /tasks/:id/fichiers        → joindre un fichier (champ « fichier », multipart)
//   DELETE /tasks/:id/fichiers/:fid   → retirer un fichier joint
//   GET    /uploads/<nom>             → télécharger / afficher un fichier joint
//   POST   /reset                     → remettre les tâches d'exemple
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const INITIALES = require('./initial');

const PORT = process.env.PORT || 3000;
const FICHIER = process.env.DATA_FILE || path.join(__dirname, 'data', 'tasks.json');
const DOSSIER_UPLOADS = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
const PRIORITES = ['faible', 'moyenne', 'elevee'];
const STATUTS = ['a_faire', 'terminee'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

fs.mkdirSync(DOSSIER_UPLOADS, { recursive: true });

// ---------- persistance (lecture / écriture du fichier JSON) ----------
// Une tâche ancienne (sans les nouveaux champs) est complétée avec des valeurs vides
const completer = (t) => ({
  piecesJointes: [], rappelDate: null, rappelLieu: null, observateurs: [], ...t,
});

function lire() {
  try {
    return JSON.parse(fs.readFileSync(FICHIER, 'utf8')).map(completer);
  } catch {
    ecrire(INITIALES); // premier lancement : on crée le fichier
    return INITIALES.map(completer);
  }
}
function ecrire(taches) {
  fs.mkdirSync(path.dirname(FICHIER), { recursive: true });
  fs.writeFileSync(FICHIER, JSON.stringify(taches, null, 2));
}
const nouvelId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

// Supprime du disque le fichier d'une pièce jointe
function effacerFichier(piece) {
  fs.rm(path.join(DOSSIER_UPLOADS, path.basename(piece.url)), { force: true }, () => {});
}

// ---------- validation ----------
function valider(corps, partiel = false) {
  const e = [];
  const { titre, description, priorite, statut, rappelDate, rappelLieu, observateurs } = corps;
  if (!partiel || titre !== undefined) {
    if (typeof titre !== 'string' || titre.trim().length < 3) e.push('titre : au moins 3 caractères');
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 200)) {
    e.push('description : 200 caractères maximum');
  }
  if (priorite !== undefined && !PRIORITES.includes(priorite)) e.push('priorite invalide');
  if (statut !== undefined && !STATUTS.includes(statut)) e.push('statut invalide');
  // rappel à une date : chaîne ISO ou null
  if (rappelDate !== undefined && rappelDate !== null && Number.isNaN(Date.parse(rappelDate))) {
    e.push('rappelDate : date invalide');
  }
  // rappel à un lieu : { latitude, longitude, rayon, nom } ou null
  if (rappelLieu !== undefined && rappelLieu !== null) {
    const { latitude, longitude, rayon } = rappelLieu;
    if (typeof latitude !== 'number' || Math.abs(latitude) > 90
      || typeof longitude !== 'number' || Math.abs(longitude) > 180) e.push('rappelLieu : coordonnées invalides');
    if (typeof rayon !== 'number' || rayon < 20 || rayon > 5000) e.push('rappelLieu : rayon entre 20 et 5000 m');
  }
  // observateurs : [{ id, nom, email }]
  if (observateurs !== undefined) {
    if (!Array.isArray(observateurs)) e.push('observateurs : tableau attendu');
    else if (observateurs.some((o) => !o || typeof o.nom !== 'string' || !o.nom.trim() || !EMAIL.test(o.email || ''))) {
      e.push('observateurs : nom et e-mail valides obligatoires');
    }
  }
  return e;
}

// ---------- envoi de fichiers (multer) ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: DOSSIER_UPLOADS,
    // nom unique sur le disque, en gardant l'extension d'origine
    filename: (_req, file, cb) => cb(null, nouvelId() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo maximum
});

// ---------- application ----------
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });
app.use('/uploads', express.static(DOSSIER_UPLOADS));

app.get('/', (_req, res) => res.json({ nom: 'MyTasks API', routes: ['/tasks', '/tasks/:id/fichiers', '/uploads', '/reset'] }));

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
  const id = typeof req.body.id === 'string' && req.body.id ? req.body.id : nouvelId();
  const tache = {
    id,
    titre: req.body.titre.trim(),
    description: (req.body.description || '').trim(),
    priorite: req.body.priorite || 'moyenne',
    statut: req.body.statut || 'a_faire',
    dateCreation: req.body.dateCreation || new Date().toISOString(),
    piecesJointes: [],
    rappelDate: req.body.rappelDate || null,
    rappelLieu: req.body.rappelLieu || null,
    observateurs: req.body.observateurs || [],
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
  const { titre, description, priorite, statut, rappelDate, rappelLieu, observateurs } = req.body;
  const maj = { ...taches[i] };
  if (titre !== undefined) maj.titre = titre.trim();
  if (description !== undefined) maj.description = description.trim();
  if (priorite !== undefined) maj.priorite = priorite;
  if (statut !== undefined) maj.statut = statut;
  if (rappelDate !== undefined) maj.rappelDate = rappelDate;
  if (rappelLieu !== undefined) maj.rappelLieu = rappelLieu;
  if (observateurs !== undefined) {
    maj.observateurs = observateurs.map((o) => ({
      id: o.id || nouvelId(), nom: o.nom.trim(), email: o.email.trim().toLowerCase(),
    }));
  }
  taches[i] = maj;
  ecrire(taches);
  res.json(maj);
});

app.delete('/tasks/:id', (req, res) => {
  const taches = lire();
  const tache = taches.find((x) => x.id === req.params.id);
  if (!tache) return res.status(404).json({ erreur: 'Tâche introuvable' });
  tache.piecesJointes.forEach(effacerFichier);
  ecrire(taches.filter((x) => x.id !== req.params.id));
  res.status(204).end();
});

// Joindre un fichier (photo de la caméra, image de la galerie ou document)
app.post('/tasks/:id/fichiers', upload.single('fichier'), (req, res) => {
  if (!req.file) return res.status(400).json({ erreur: 'Aucun fichier reçu (champ « fichier »)' });
  const taches = lire();
  const tache = taches.find((x) => x.id === req.params.id);
  if (!tache) {
    fs.rm(req.file.path, { force: true }, () => {});
    return res.status(404).json({ erreur: 'Tâche introuvable' });
  }
  const piece = {
    id: nouvelId(),
    nom: req.body.nom || req.file.originalname,
    type: req.file.mimetype.startsWith('image/') ? 'image' : 'fichier',
    mime: req.file.mimetype,
    taille: req.file.size,
    url: '/uploads/' + req.file.filename,
    dateAjout: new Date().toISOString(),
  };
  tache.piecesJointes.push(piece);
  ecrire(taches);
  res.status(201).json(tache);
});

app.delete('/tasks/:id/fichiers/:fid', (req, res) => {
  const taches = lire();
  const tache = taches.find((x) => x.id === req.params.id);
  const piece = tache && tache.piecesJointes.find((p) => p.id === req.params.fid);
  if (!piece) return res.status(404).json({ erreur: 'Fichier introuvable' });
  effacerFichier(piece);
  tache.piecesJointes = tache.piecesJointes.filter((p) => p.id !== piece.id);
  ecrire(taches);
  res.json(tache);
});

app.post('/reset', (_req, res) => {
  lire().forEach((t) => t.piecesJointes.forEach(effacerFichier));
  ecrire(INITIALES);
  res.json(INITIALES.map(completer));
});

// Erreurs d'envoi (fichier trop gros…)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ erreur: err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop gros (10 Mo max)' : err.message });
  }
  console.error(err);
  res.status(500).json({ erreur: 'Erreur serveur' });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => console.log(`MyTasks API sur http://localhost:${PORT}`));
}
module.exports = app;
