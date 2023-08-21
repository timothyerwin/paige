import { PrismaClient } from '../generated/client';
import products from '../db/fixtures/products.json';

const prisma = new PrismaClient();

async function main() {
  await prisma.products.deleteMany();

  for (const product of products) {
    console.log('creating product', product.sku);
    
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