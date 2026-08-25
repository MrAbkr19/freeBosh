const bcrypt = require('bcrypt');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const hashedPassword = await bcrypt.hash('password', 10); 

  db.data.users =[
    {
    id: 'u1',
    fullName: 'Jean Mbarga',
    matricule: '2024-001',
    passwordHash: hashedPassword,
    role: 'student',
    filiere: 'Génie Informatique',
    niveau: 'Niveau 3',
  },
      {
      id: 'u2',
      fullName: 'Dr. Ateba Rigobert',
      matricule: 'ens-014',
      passwordHash: hashedPassword,
      role: 'teacher',
    },
    {
      id: 'u3',
      fullName: 'Admin FreeBosh',
      matricule: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  ];

  db.data.modules = [
    {
      id: 'm1',
      code: 'IF310',
      name: 'Réseaux',
      faculty: 'Génie Informatique',
      level: 'Niveau 3',
      teacherIds: ['u2'],
    },
    {
      id: 'm2',
      code: 'IF322',
      name: 'Bases de données avancées',
      faculty: 'Génie Informatique',
      level: 'Niveau 3',
      teacherIds: ['u2'],
    },
  ];


  await db.write();
  console.log('Seeded 1 user with a hashed password.');
}

seed();