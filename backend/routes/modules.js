const express = require('express');
const { prisma } = require('../prisma-client');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });

  // const requester = db.data.users.find((u) => u.id === req.user.id);

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  let modules;

  switch (requester.role) {

    case 'student':
      modules = await prisma.courseModule.findMany({
        where: { faculty: requester.filiere, level: requester.niveau },
      });
      break;

    case 'teacher':
          modules = await prisma.courseModule.findMany({
        where: { teacherIds: { has: requester.id } },
      });
      break;
    case 'admin':
      modules = await prisma.courseModule.findMany();
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

  // await initDb();


  const newModule = await prisma.courseModule.create({
    data: {
      code,
      name,
      faculty,
      level,
      teacherIds: Array.isArray(teacherIds) ? teacherIds : [],
    },
  });

  // db.data.modules.push(newModule);
  // await db.write();

  res.status(201).json({ module: newModule });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { code, name, faculty, level, teacherIds } = req.body;

  await initDb();

  const targetModule = await prisma.courseModule.findUnique({ where: { id: req.params.id } });

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  const updatedModule = await prisma.courseModule.update({
    where: { id: req.params.id },
    data: {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(faculty !== undefined && { faculty }),
      ...(level !== undefined && { level }),
      ...(teacherIds !== undefined && { teacherIds }),
    },
  });

  res.json({ module: updatedModule });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {

  const exists = await prisma.courseModule.findUnique({ where: { id: req.params.id } });

  if (!exists) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  await prisma.courseModule.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

module.exports = router;