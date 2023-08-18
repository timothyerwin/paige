import { Request, Response } from 'express';
import { PrismaClient } from '../../../../generated/client';

import app from '../../../server';

const prisma = new PrismaClient();

app.get('/api/v1/products', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const skip = (page - 1) * limit;
  
  const products = await prisma.products.findMany({
    skip,
    take: limit,
  });
  
  const total = await prisma.products.count();
  const pages = Math.ceil(total / limit);
  
  res.json({
    page,
    limit,
    pages,
    total,
    products,
  });
});

app.get('/api/v1/products/:sku', async (req: Request, res: Response) => {
  const { sku } = req.params;

  try {
    const product = await prisma.products.findUnique({
      where: {
        sku: sku,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/v1/products/:sku', async (req: Request, res: Response) => {
  const { sku } = req.params;
  const update = req.body;

  try {
    const existing = await prisma.products.findUnique({
      where: {
        sku: sku,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await prisma.products.update({
      where: {
        sku: sku,
      },
      data: update,
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});