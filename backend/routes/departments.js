const express = require('express');
const { db, initDb } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  await initDb();
  res.json({ departments: db.data.departments });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom du département est requis.' });
  }

  await initDb();

  const newDepartment = {
    id: `dep${Date.now()}`,
    name,
    filiereCount: 0,
    icon: 'domain',
  };

  db.data.departments.push(newDepartment);
  await db.write();

  res.status(201).json({ department: newDepartment });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await initDb();

  const exists = db.data.departments.some((d) => d.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ error: 'Département introuvable.' });
  }

  db.data.departments = db.data.departments.filter((d) => d.id !== req.params.id);
  await db.write();

  res.status(204).send();
});

module.exports = router;