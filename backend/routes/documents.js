const express = require('express');
const { db, initDb } = require('../db');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  await initDb();

  const requester = db.data.users.find((u) => u.id === req.user.id);

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  let documents;

  switch (requester.role) {
    case 'student': {
      const accessibleModuleIds = db.data.modules
        .filter((m) => m.faculty === requester.filiere && m.level === requester.niveau)
        .map((m) => m.id);

      documents = db.data.documents.filter((d) => accessibleModuleIds.includes(d.courseModuleId));
      break;
    }

    case 'teacher': {
      const accessibleModuleIds = db.data.modules
        .filter((m) => m.teacherIds.includes(requester.id))
        .map((m) => m.id);

      documents = db.data.documents.filter((d) => accessibleModuleIds.includes(d.courseModuleId));
      break;
    }

    case 'admin':
      documents = db.data.documents;
      break;

    default:
      return res.status(403).json({ error: 'Rôle non reconnu.' });
  }

  res.json({ documents });
});

router.post('/', requireAuth, async (req, res) => {
  const { title, description, courseModuleId, fileName, fileSize } = req.body;

  if (!title || !courseModuleId || !fileName) {
    return res.status(400).json({ error: 'Titre, module et fichier sont requis.' });
  }

  await initDb();

  const requester = db.data.users.find((u) => u.id === req.user.id);

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (requester.role !== 'teacher' && requester.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les enseignants et administrateurs peuvent publier des documents.' });
  }

  const targetModule = db.data.modules.find((m) => m.id === courseModuleId);

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  // A teacher can only publish into modules they actually teach.
  // Admins are exempt from this check — they can publish anywhere.
  if (requester.role === 'teacher' && !targetModule.teacherIds.includes(requester.id)) {
    return res.status(403).json({ error: "Vous n'enseignez pas ce module." });
  }

  const newDocument = {
    id: `d${Date.now()}`,
    title,
    description: description || '',
    fileUrl: fileName, // placeholder only — matches the mock frontend's metadata-only approach
    fileSize: fileSize || 0,
    courseModuleId,
    teacherId: requester.id,
    createdAt: new Date().toISOString(),
  };

  db.data.documents.push(newDocument);
  await db.write();

  res.status(201).json({ document: newDocument });
});
module.exports = router;