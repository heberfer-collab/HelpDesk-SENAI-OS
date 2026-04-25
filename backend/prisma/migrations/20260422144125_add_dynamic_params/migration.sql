-- AlterTable
ALTER TABLE "Chamado" ADD COLUMN "tecnicoResponsavel" TEXT;

-- CreateTable
CREATE TABLE "Status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TipoServico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ResponsavelSetor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tecnico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_nome_key" ON "Status"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoServico_nome_key" ON "TipoServico"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelSetor_nome_key" ON "ResponsavelSetor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnico_nome_key" ON "Tecnico"("nome");
