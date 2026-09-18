const express = require('express');
const { prisma } = require('../prisma-client');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const filieres = await prisma.filiere.findMany();
  res.json({ filieres });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, departmentId, degreeLevel, description } = req.body;

  if (!name || !departmentId || !degreeLevel) {
    return res.status(400).json({ error: 'Nom, département et niveau sont requis.' });
  }

  const targetDepartment = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!targetDepartment) {
    return res.status(404).json({ error: 'Département introuvable.' });
  }

  const newFiliere = await prisma.filiere.create({
    data: {
      name,
      departmentId,
      degreeLevel,
      description: description || '',
    },
  });

  res.status(201).json({ filiere: newFiliere });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, departmentId, degreeLevel, description } = req.body;

  const existing = await prisma.filiere.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ error: 'Filière introuvable.' });
  }

  if (departmentId !== undefined) {
    const targetDepartment = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!targetDepartment) {
      return res.status(404).json({ error: 'Département introuvable.' });
    }
  }

  const updatedFiliere = await prisma.filiere.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(departmentId !== undefined && { departmentId }),
      ...(degreeLevel !== undefined && { degreeLevel }),
      ...(description !== undefined && { description }),
    },
  });

  res.json({ filiere: updatedFiliere });
});

module.exports = router;