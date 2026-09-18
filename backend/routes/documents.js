const express = require('express');
const { prisma } = require('../prisma-client');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  let documents;

  switch (requester.role) {
    case 'student': {
      const accessibleModules = await prisma.courseModule.findMany({
        where: { faculty: requester.filiere, level: requester.niveau },
        select: { id: true },
      });
      const accessibleModuleIds = accessibleModules.map((m) => m.id);

      documents = await prisma.courseDocument.findMany({
        where: { courseModuleId: { in: accessibleModuleIds } },
      });
      break;
    }

    case 'teacher': {
      const accessibleModules = await prisma.courseModule.findMany({
        where: { teacherIds: { has: requester.id } },
        select: { id: true },
      });
      const accessibleModuleIds = accessibleModules.map((m) => m.id);

      documents = await prisma.courseDocument.findMany({
        where: { courseModuleId: { in: accessibleModuleIds } },
      });
      break;
    }

    case 'admin':
      documents = await prisma.courseDocument.findMany();
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

  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (requester.role !== 'teacher' && requester.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les enseignants et administrateurs peuvent publier des documents.' });
  }

  const targetModule = await prisma.courseModule.findUnique({ where: { id: courseModuleId } });

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  if (requester.role === 'teacher' && !targetModule.teacherIds.includes(requester.id)) {
    return res.status(403).json({ error: "Vous n'enseignez pas ce module." });
  }

  const newDocument = await prisma.courseDocument.create({
    data: {
      title,
      description: description || '',
      fileUrl: fileName,
      fileSize: fileSize || 0,
      courseModuleId,
      teacherId: requester.id,
    },
  });

  res.status(201).json({ document: newDocument });
});

module.exports = router;