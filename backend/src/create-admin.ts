import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      nome: 'Administrador',
      email,
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created/updated:');
  console.log(`Email: ${admin.email}`);
  console.log(`Senha: ${password}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
