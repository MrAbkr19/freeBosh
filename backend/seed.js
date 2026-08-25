const bcrypt = require('bcrypt');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const hashedPassword = await bcrypt.hash('password', 10); 
  db.data.users.push({
    id: 'u1',
    fullName: 'Jean Mbarga',
    matricule: '2024-001',
    passwordHash: hashedPassword,
    role: 'student',
    filiere: 'Génie Informatique',
    niveau: 'Niveau 3',
  });

  await db.write();
  console.log('Seeded 1 user with a hashed password.');
}

seed();