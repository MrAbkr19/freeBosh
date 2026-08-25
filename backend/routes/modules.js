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

  let modules;

  switch (requester.role) {
    case 'student':
      modules = db.data.modules.filter(
        (m) => m.faculty === requester.filiere && m.level === requester.niveau
      );
      break;

    case 'teacher':
      modules = db.data.modules.filter((m) => m.teacherIds.includes(requester.id));
      break;

    case 'admin':
      modules = db.data.modules;
      break;

    default:
      return res.status(403).json({ error: 'Rôle non reconnu.' });
  }

  res.json({ modules });
});

module.exports = router;