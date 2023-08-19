// importFixtures.ts
import { PrismaClient } from '../generated/client';
import products from '../db/fixtures/products.json';

const prisma = new PrismaClient();

async function main() {
  for (const product of products) {
    await prisma.products.deleteMany();
    
    await prisma.products.create({
      data: product,
    });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });