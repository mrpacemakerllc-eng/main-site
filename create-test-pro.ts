import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'testpro@test.com';
  const password = 'test123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Test Pro User',
      password: hashedPassword,
      role: 'student',
    },
  });

  console.log('User created/found:', user.email);

  // Create active ECG Vault subscription
  const subscription = await prisma.subscription.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId: 'ecg_vault',
      },
    },
    update: {
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    create: {
      userId: user.id,
      productId: 'ecg_vault',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Subscription created:', subscription.status);
  console.log('\n--- TEST ACCOUNT ---');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Status: PRO (active subscription)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
