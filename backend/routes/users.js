const express = require('express');
const bcrypt = require('bcrypt');
const { prisma } = require('../prisma-client');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

function toSafeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Any authenticated user — name/role only, for resolving "posted by" labels.
router.get('/basic', requireAuth, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, role: true },
  });

  res.json({ users });
});

// Admin only — full records.
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users: users.map(toSafeUser) });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { fullName, matricule, role, filiere, niveau, email } = req.body;

  if (!fullName || !matricule || !role) {
    return res.status(400).json({ error: 'Nom, matricule et rôle sont requis.' });
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  const defaultPasswordHash = await bcrypt.hash('password', 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        fullName,
        matricule,
        passwordHash: defaultPasswordHash,
        role,
        ...(filiere && { filiere }),
        ...(niveau && { niveau }),
        ...(email && { email }),
        ...(role === 'student' && { status: 'inscrit' }),
      },
    });

    res.status(201).json({ user: toSafeUser(newUser) });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ce matricule est déjà utilisé.' });
    }
    throw err;
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { fullName, filiere, niveau, email, status } = req.body;

  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(filiere !== undefined && { filiere }),
      ...(niveau !== undefined && { niveau }),
      ...(email !== undefined && { email }),
      ...(status !== undefined && { status }),
    },
  });

  res.json({ user: toSafeUser(updatedUser) });
});

module.exports = router;