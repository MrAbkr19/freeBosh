const bcrypt = require('bcrypt');
const { prisma } = require('./prisma-client');

async function seed() {
  const hashedPassword = await bcrypt.hash('password', 10);

  // Clear existing data first, in dependency order (children before parents)
  await prisma.announcement.deleteMany();
  await prisma.courseDocument.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.filiere.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const student = await prisma.user.create({
    data: {
      fullName: 'Jean Mbarga',
      matricule: '2024-001',
      passwordHash: hashedPassword,
      role: 'student',
      filiere: 'Génie Informatique',
      niveau: 'Niveau 3',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      fullName: 'Dr. Ateba Rigobert',
      matricule: 'ens-014',
      passwordHash: hashedPassword,
      role: 'teacher',
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Admin FreeBosh',
      matricule: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  const module1 = await prisma.courseModule.create({
    data: {
      code: 'IF310',
      name: 'Réseaux',
      faculty: 'Génie Informatique',
      level: 'Niveau 3',
      teacherIds: [teacher.id],
    },
  });

  await prisma.courseModule.create({
    data: {
      code: 'IF322',
      name: 'Bases de données avancées',
      faculty: 'Génie Informatique',
      level: 'Niveau 3',
      teacherIds: [teacher.id],
    },
  });

  await prisma.courseDocument.create({
    data: {
      title: 'Chapitre 1 - Introduction aux réseaux',
      description: 'Notions de base sur les couches OSI',
      fileUrl: '/assets/mock-files/if310-chap1.pdf',
      fileSize: 2457600,
      courseModuleId: module1.id,
      teacherId: teacher.id,
    },
  });

  await prisma.courseDocument.create({
    data: {
      title: 'TP1 - Configuration IP',
      description: "Travaux pratiques sur l'adressage IPv4",
      fileUrl: '/assets/mock-files/if310-tp1.pdf',
      fileSize: 1048576,
      courseModuleId: module1.id,
      teacherId: teacher.id,
    },
  });

  await prisma.announcement.create({
    data: {
      teacherId: teacher.id,
      courseModuleId: module1.id,
      content: 'Le TP1 est repoussé à la semaine prochaine.',
    },
  });

  const dep1 = await prisma.department.create({
    data: { name: 'Sciences et Technologies', filiereCount: 12, icon: 'science' },
  });
  const dep2 = await prisma.department.create({
    data: { name: 'Lettres et Sciences Humaines', filiereCount: 8, icon: 'menu_book' },
  });
  await prisma.department.create({
    data: { name: 'Droit et Sciences Politiques', filiereCount: 5, icon: 'account_balance' },
  });

  await prisma.filiere.create({
    data: {
      name: 'Génie Informatique',
      departmentId: dep1.id,
      degreeLevel: 'Licence',
      description: 'Formation en conception, développement et maintenance de systèmes logiciels.',
    },
  });

  await prisma.filiere.create({
    data: {
      name: 'Réseaux et Télécoms',
      departmentId: dep1.id,
      degreeLevel: 'Master',
      description: '',
    },
  });

  await prisma.filiere.create({
    data: {
      name: 'Mathématiques Appliquées',
      departmentId: dep2.id,
      degreeLevel: 'Licence',
      description: '',
    },
  });

  console.log('Database seeded successfully.');
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());