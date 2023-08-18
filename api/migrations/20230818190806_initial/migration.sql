-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "price" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
