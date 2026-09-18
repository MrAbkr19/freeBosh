const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  prisma  = require('../prisma-client');
const { requireAuth } = require('../middleware/auth-middleware');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { matricule, password } = req.body;

  if (!matricule || !password) {
    return res.status(400).json({ error: 'Matricule et mot de passe requis.' });
  }

  const user = await prisma.user.findUnique({ where: { matricule } });

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

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe sont requis.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  res.json({ message: 'Mot de passe mis à jour avec succès.' });
});

module.exports = router;