const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { matricule, password } = req.body;

  if (!matricule || !password) {
    return res.status(400).json({ error: 'Matricule et mot de passe requis.' });
  }

  await initDb();
  const user = db.data.users.find((u) => u.matricule === matricule);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const { passwordHash, ...safeUser } = user;

  const token = jwt.sign(
    { id: safeUser.id, role: safeUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ user: safeUser, token });
});
const { requireAuth } = require('../middleware/auth-middleware');
router.get('/me', requireAuth, async (req, res) => {
  await initDb();
  const user = db.data.users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});
module.exports = router;