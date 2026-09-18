const express = require('express');
const { prisma } = require('../prisma-client');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  let announcements;

  switch (requester.role) {
    case 'student': {
      const accessibleModules = await prisma.courseModule.findMany({
        where: { faculty: requester.filiere, level: requester.niveau },
        select: { id: true },
      });
      const accessibleModuleIds = accessibleModules.map((m) => m.id);

      announcements = await prisma.announcement.findMany({
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

      announcements = await prisma.announcement.findMany({
        where: { courseModuleId: { in: accessibleModuleIds } },
      });
      break;
    }

    case 'admin':
      announcements = await prisma.announcement.findMany();
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

  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!requester) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (requester.role !== 'teacher' && requester.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les enseignants et administrateurs peuvent publier des annonces.' });
  }

  const targetModule = await prisma.courseModule.findUnique({ where: { id: courseModuleId } });

  if (!targetModule) {
    return res.status(404).json({ error: 'Module introuvable.' });
  }

  if (requester.role === 'teacher' && !targetModule.teacherIds.includes(requester.id)) {
    return res.status(403).json({ error: "Vous n'enseignez pas ce module." });
  }

  const newAnnouncement = await prisma.announcement.create({
    data: {
      teacherId: requester.id,
      courseModuleId,
      content,
    },
  });

  res.status(201).json({ announcement: newAnnouncement });
});

module.exports = router;