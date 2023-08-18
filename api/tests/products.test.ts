import request from 'supertest';
import app from '../src';
import {server} from '../src/server';
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

describe('Product Routes', () => {
  const testSkusToDelete = ['test-sku', 'test-sku-2'];

  afterAll(async () => {
    // cleanup
    await prisma.products.deleteMany({
        where: {
          sku: {
            in: testSkusToDelete,
          },
        },
      });
      await prisma.$disconnect();

      await server.close();
  });

  beforeAll(async () => {
    // cleanup old test skus
    await prisma.products.deleteMany({
      where: {
        sku: {
          in: testSkusToDelete,
        },
      },
    });
  });

  it('should get a product by SKU', async () => {
    const product = await prisma.products.create({
      data: {
        id: 'test-id',
        sku: 'test-sku',
        name: 'Test Product',
        type: 'test-type',
        description: 'Test description',
        color: 'test-color',
        price: 100.0,
      },
    });

    const response = await request(app).get(`/api/v1/products/${product.sku}`);

    expect(response.status).toBe(200);
    expect(response.body.sku).toBe('test-sku');
    expect(response.body.id).toBeDefined();
  });

  it('should update a product by SKU', async () => {
    const product = await prisma.products.create({
      data: {
        id: 'test-id-2',
        sku: 'test-sku-2',
        name: 'Test Product 2',
        type: 'test-type',
        description: 'Test description',
        color: 'test-color',
        price: 150.0,
      },
    });

    const updatedData = {
      name: 'Test Product (updated)',
      price: 200.0,
    };

    const response = await request(app)
      .put(`/api/v1/products/${product.sku}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Product (updated)');
    expect(response.body.price).toBe(200.0);
    expect(response.body.id).toBeDefined();
  });
});

