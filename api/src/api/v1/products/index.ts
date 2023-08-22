import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/client";

import {
  validate,
  ProductValidationResult,
} from "shared/src/validation/product";

import app from "../../../server";

const prisma = new PrismaClient();

app.get("/api/v1/products", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const colorFilter = req.query.color as string | undefined;
  let colorFilters: string[] | undefined = undefined;

  if (colorFilter) {
    colorFilters = colorFilter.split(",");
  }

  const products = await prisma.products.findMany({
    skip,
    take: limit,
    where: {
      color: colorFilters ? { in: colorFilters } : undefined,
    },
  });

  const formattedProducts = products.map((product) => ({
    ...product,
    price_formatted: product.price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  }));

  const distinctColors = await prisma.products.findMany({
    select: {
      color: true,
    },
    distinct: ["color"],
  });

  const total = await prisma.products.count({
    where: {
      color: colorFilters ? { in: colorFilters } : undefined,
    },
  });
  
  const pages = Math.ceil(total / limit);

  res.json({
    page,
    limit,
    pages,
    total,
    products: formattedProducts,
    filters: {
      colors: distinctColors.map((item: any) => item.color),
    },
  });
});

app.get("/api/v1/products/:sku", async (req: Request, res: Response) => {
  const { sku } = req.params;

  try {
    const product = await prisma.products.findUnique({
      where: {
        sku: sku,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/v1/products/:sku", async (req: Request, res: Response) => {
  const { sku } = req.params;
  const update = req.body;

  const validations = validate(update);

  if (validations.length > 0) {
    res.status(400).json(validations);
    return;
  }

  try {
    const existing = await prisma.products.findUnique({
      where: {
        sku: sku,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const result = await prisma.products.update({
      where: {
        sku: sku,
      },
      data: update,
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/v1/products/:sku", async (req: Request, res: Response) => {
  const { sku } = req.params;

  try {
    const product = await prisma.products.delete({
      where: {
        sku: sku,
      },
    });

    res.json({ message: "success", product });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
