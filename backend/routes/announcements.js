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

  let announcements;

  switch (requester.role) {
    case 'student': {
      const accessibleModuleIds = db.data.modules
        .filter((m) => m.faculty === requester.filiere && m.level === requester.niveau)
        .map((m) => m.id);

      announcements = db.data.announcements.filter((a) =>
        accessibleModuleIds.includes(a.courseModuleId)
      );
      break;
    }

    case 'teacher': {
      const accessibleModuleIds = db.data.modules
        .filter((m) => m.teacherIds.includes(requester.id))
        .map((m) => m.id);

      announcements = db.data.announcements.filter((a) =>
        accessibleModuleIds.includes(a.courseModuleId)
      );
      break;
    }

    case 'admin':
      announcements = db.data.announcements;
      break;

    default:
      return res.status(403).json({ error: 'Rôle non reconnu.' });
  }

  res.json({ announcements });
});

router.post('/', requireAuth, async (req, res) => {
  const { content, courseModuleId } = req.body;

  if (!content || !courseModuleId) {
    return res.status(400).json({ error: 'Contenu et module sont requis.' });
  }

  await initDb();

  const requester = db.data.users.find((u) => u.id === req.user.id);

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (requester.role !== 'teacher' && requester.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les enseignants et administrateurs peuvent publier des annonces.' });
  }

  const targetModule = db.data.modules.find((m) => m.id === courseModuleId);

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  if (requester.role === 'teacher' && !targetModule.teacherIds.includes(requester.id)) {
    return res.status(403).json({ error: "Vous n'enseignez pas ce module." });
  }

  const newAnnouncement = {
    id: `a${Date.now()}`,
    teacherId: requester.id,
    courseModuleId,
    content,
    createdAt: new Date().toISOString(),
  };

  db.data.announcements.push(newAnnouncement);
  await db.write();

  res.status(201).json({ announcement: newAnnouncement });
});
module.exports = router;