const express = require('express');
const bcrypt = require('bcrypt');
const { db, initDb } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

// Strip passwordHash before ever sending a user back to the client.
function toSafeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

router.get('/basic', requireAuth, async (req, res) => {
  await initDb();

  const basicUsers = db.data.users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    role: u.role,
  }));

  res.json({ users: basicUsers });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  await initDb();
  res.json({ users: db.data.users.map(toSafeUser) });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { fullName, matricule, role, filiere, niveau, email } = req.body;

  if (!fullName || !matricule || !role) {
    return res.status(400).json({ error: 'Nom, matricule et rôle sont requis.' });
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  await initDb();

  const matriculeTaken = db.data.users.some((u) => u.matricule === matricule);
  if (matriculeTaken) {
    return res.status(409).json({ error: 'Ce matricule est déjà utilisé.' });
  }

  const defaultPasswordHash = await bcrypt.hash('password', 10);

  const newUser = {
    id: `u${Date.now()}`,
    fullName,
    matricule,
    passwordHash: defaultPasswordHash,
    role,
    ...(filiere && { filiere }),
    ...(niveau && { niveau }),
    ...(email && { email }),
    ...(role === 'student' && { status: 'inscrit' }),
  };

  db.data.users.push(newUser);
  await db.write();

  res.status(201).json({ user: toSafeUser(newUser) });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { fullName, filiere, niveau, email, status } = req.body;

  await initDb();

  const user = db.data.users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (filiere !== undefined) user.filiere = filiere;
  if (niveau !== undefined) user.niveau = niveau;
  if (email !== undefined) user.email = email;
  if (status !== undefined) user.status = status;

  await db.write();

  res.json({ user: toSafeUser(user) });
});

module.exports = router;