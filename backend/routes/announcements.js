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

module.exports = router;