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

module.exports = router;