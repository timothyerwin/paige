import request from "supertest";
import app from "../src";
import { server } from "../src/server";
import { PrismaClient } from "../generated/client";
import { ProductValidationResult } from "root/shared/src/validation/product";

const prisma = new PrismaClient();

describe("Product Routes", () => {
  const testSkusToDelete = [
    "test-sku",
    "test-sku-2",
    "test-sku-3",
    "test-sku-4",
    "test-sku-5",
    "test-sku-delete",
  ];

  afterAll(async () => {
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
    await prisma.products.deleteMany({
      where: {
        sku: {
          in: testSkusToDelete,
        },
      },
    });
  });

  it("should get a product by SKU", async () => {
    const product = await prisma.products.create({
      data: {
        id: "test-id",
        sku: "test-sku",
        name: "Test Product",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 100.0,
      },
    });

    const response = await request(app).get(`/api/v1/products/${product.sku}`);

    expect(response.status).toBe(200);
    expect(response.body.sku).toBe("test-sku");
    expect(response.body.id).toBeDefined();
  });

  it("should update a product by SKU", async () => {
    const insert = {
      data: {
        id: "test-id-2",
        sku: "test-sku-2",
        name: "Test Product 2",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 150.0,
      },
    };

    const product = await prisma.products.create(insert);

    const updatedData = {
      ...insert.data,
      name: "Test Product (updated)",
      price: 200.0,
    };

    const response = await request(app)
      .put(`/api/v1/products/${product.sku}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test Product (updated)");
    expect(response.body.price).toBe(200.0);
    expect(response.body.id).toBeDefined();
  });

  it("should return validation errors for invalid price", async () => {
    const product = await prisma.products.create({
      data: {
        id: "test-id-3",
        sku: "test-sku-3",
        name: "Test Product 3",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 150.0,
      },
    });

    const invalidPriceUpdate = {
      price: -10.0,
      type: "new-type",
      description: "new-description",
      color: "new-color",
    };

    const response = await request(app)
      .put(`/api/v1/products/${product.sku}`)
      .send(invalidPriceUpdate);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Array);

    const errorFields = response.body.map(
      (error: ProductValidationResult) => error.field
    );
    expect(errorFields).toContain("price");
  });

  it("should return validation errors for empty type", async () => {
    const product = await prisma.products.create({
      data: {
        id: "test-id-4",
        sku: "test-sku-4",
        name: "Test Product 4",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 150.0,
      },
    });

    const invalidTypeUpdate = {
      type: "",
      description: "new-description",
      color: "new-color",
    };

    const response = await request(app)
      .put(`/api/v1/products/${product.sku}`)
      .send(invalidTypeUpdate);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Array);

    const errorFields = response.body.map(
      (error: ProductValidationResult) => error.field
    );
    expect(errorFields).toContain("type");
  });

  it("should return validation errors for description exceeding max length", async () => {
    const product = await prisma.products.create({
      data: {
        id: "test-id-5",
        sku: "test-sku-5",
        name: "Test Product 5",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 150.0,
      },
    });

    const invalidDescriptionUpdate = {
      price: 100.0,
      description: "a".repeat(57),
      color: "new-color",
    };

    const response = await request(app)
      .put(`/api/v1/products/${product.sku}`)
      .send(invalidDescriptionUpdate);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Array);

    const errorFields = response.body.map(
      (error: ProductValidationResult) => error.field
    );
    expect(errorFields).toContain("description");
  });

  it("should delete a product by SKU", async () => {
    const product = await prisma.products.create({
      data: {
        id: "test-id-delete",
        sku: "test-sku-delete",
        name: "Product to Delete",
        type: "test-type",
        description: "Test description",
        color: "test-color",
        price: 100.0,
      },
    });

    const response = await request(app).delete(
      `/api/v1/products/${product.sku}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("success");
    expect(response.body.product.sku).toBe("test-sku-delete");

    const deleted = await prisma.products.findUnique({
      where: {
        sku: product.sku,
      },
    });

    expect(deleted).toBeNull();
  });
});
