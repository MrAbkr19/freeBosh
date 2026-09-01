const express = require('express');
const { db, initDb } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

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

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { code, name, faculty, level, teacherIds } = req.body;

  if (!code || !name || !faculty || !level) {
    return res.status(400).json({ error: 'Code, nom, filière et niveau sont requis.' });
  }

  await initDb();

  const newModule = {
    id: `m${Date.now()}`,
    code,
    name,
    faculty,
    level,
    teacherIds: Array.isArray(teacherIds) ? teacherIds : [],
  };

  db.data.modules.push(newModule);
  await db.write();

  res.status(201).json({ module: newModule });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { code, name, faculty, level, teacherIds } = req.body;

  await initDb();

  const targetModule = db.data.modules.find((m) => m.id === req.params.id);

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  if (code !== undefined) targetModule.code = code;
  if (name !== undefined) targetModule.name = name;
  if (faculty !== undefined) targetModule.faculty = faculty;
  if (level !== undefined) targetModule.level = level;
  if (teacherIds !== undefined) targetModule.teacherIds = teacherIds;

  await db.write();

  res.json({ module: targetModule });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await initDb();

  const exists = db.data.modules.some((m) => m.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  db.data.modules = db.data.modules.filter((m) => m.id !== req.params.id);
  await db.write();

  res.status(204).send();
});

module.exports = router;