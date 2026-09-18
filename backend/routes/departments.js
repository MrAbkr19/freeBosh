const express = require('express');
const { prisma } = require('../prisma-client');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const departments = await prisma.department.findMany();
  res.json({ departments });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom du département est requis.' });
  }

  const newDepartment = await prisma.department.create({
    data: {
      name,
      filiereCount: 0,
      icon: 'domain',
    },
  });

  res.status(201).json({ department: newDepartment });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const existing = await prisma.department.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ error: 'Département introuvable.' });
  }

  await prisma.department.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

module.exports = router;