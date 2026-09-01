const express = require('express');
const { db, initDb } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  await initDb();
  res.json({ filieres: db.data.filieres });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, departmentId, degreeLevel, description } = req.body;

  if (!name || !departmentId || !degreeLevel) {
    return res.status(400).json({ error: 'Nom, département et niveau sont requis.' });
  }

  await initDb();

  const targetDepartment = db.data.departments.find((d) => d.id === departmentId);
  if (!targetDepartment) {
    return res.status(404).json({ error: 'Département introuvable.' });
  }

  const newFiliere = {
    id: `fil${Date.now()}`,
    name,
    departmentId,
    degreeLevel,
    description: description || '',
  };

  db.data.filieres.push(newFiliere);
  await db.write();

  res.status(201).json({ filiere: newFiliere });
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, departmentId, degreeLevel, description } = req.body;

  await initDb();

  const filiere = db.data.filieres.find((f) => f.id === req.params.id);

  if (!filiere) {
    return res.status(404).json({ error: 'Filière introuvable.' });
  }

  if (departmentId) {
    const targetDepartment = db.data.departments.find((d) => d.id === departmentId);
    if (!targetDepartment) {
      return res.status(404).json({ error: 'Département introuvable.' });
    }
  }

  if (name !== undefined) filiere.name = name;
  if (departmentId !== undefined) filiere.departmentId = departmentId;
  if (degreeLevel !== undefined) filiere.degreeLevel = degreeLevel;
  if (description !== undefined) filiere.description = description;

  await db.write();

  res.json({ filiere });
});

module.exports = router;