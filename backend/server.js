// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// if (!process.env.JWT_SECRET) {
//   console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
//   process.exit(1);
// }

// const authRoutes = require('./routes/auth');
// const moduleRoutes = require('./routes/modules');
// const documentRoutes = require('./routes/documents');
// const announcementRoutes = require('./routes/announcements');
// const departmentRoutes = require('./routes/departments');
// const filiereRoutes = require('./routes/filieres');
// const userRoutes = require('./routes/users');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.json({ status: 'FreeBosh API is running' });
// });

// app.use('/auth', authRoutes);
// app.use('/modules', moduleRoutes);
// app.use('/documents', documentRoutes);
// app.use('/announcements', announcementRoutes);
// app.use('/departments', departmentRoutes);
// app.use('/filieres', filiereRoutes);
// app.use('/users', userRoutes);

// app.listen(PORT,'0.0.0.0', () => {
//   console.log(`FreeBosh API listening on port ${PORT}`);
// });


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
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Explicit CORS Configuration for Vercel + Local Dev
const allowedOrigins = [
  'https://free-bosh.vercel.app',
  'http://localhost:4200'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Express explicitly handles preflight OPTIONS requests for all routes
app.options('*', cors());

// 2. Increase Payload Size Limits (Fixes silent document upload failures)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Healthcheck Endpoint
app.get('/', (req, res) => {
  res.json({ status: 'FreeBosh API is running' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/modules', moduleRoutes);
app.use('/documents', documentRoutes);
app.use('/announcements', announcementRoutes);
app.use('/departments', departmentRoutes);
app.use('/filieres', filiereRoutes);
app.use('/users', userRoutes);

// Start Server bound to 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FreeBosh API listening on port ${PORT}`);
});