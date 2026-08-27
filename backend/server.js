const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const documentRoutes = require('./routes/documents');
const announcementRoutes = require('./routes/announcements');
const departmentRoutes = require('./routes/departments');
const filiereRoutes = require('./routes/filieres');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'FreeBosh API is running' });
});

app.use('/auth', authRoutes);
app.use('/modules', moduleRoutes);
app.use('/documents', documentRoutes);
app.use('/announcements', announcementRoutes);
app.use('/departments', departmentRoutes);
app.use('/filieres', filiereRoutes);

app.listen(PORT, () => {
  console.log(`FreeBosh API listening on port ${PORT}`);
});