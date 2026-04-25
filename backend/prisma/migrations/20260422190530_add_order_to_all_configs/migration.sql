-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ambiente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Ambiente" ("createdAt", "id", "localizacao", "nome") SELECT "createdAt", "id", "localizacao", "nome" FROM "Ambiente";
DROP TABLE "Ambiente";
ALTER TABLE "new_Ambiente" RENAME TO "Ambiente";
CREATE UNIQUE INDEX "Ambiente_nome_key" ON "Ambiente"("nome");
CREATE TABLE "new_ResponsavelSetor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ResponsavelSetor" ("createdAt", "id", "nome") SELECT "createdAt", "id", "nome" FROM "ResponsavelSetor";
DROP TABLE "ResponsavelSetor";
ALTER TABLE "new_ResponsavelSetor" RENAME TO "ResponsavelSetor";
CREATE UNIQUE INDEX "ResponsavelSetor_nome_key" ON "ResponsavelSetor"("nome");
CREATE TABLE "new_Tecnico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Tecnico" ("createdAt", "id", "nome") SELECT "createdAt", "id", "nome" FROM "Tecnico";
DROP TABLE "Tecnico";
ALTER TABLE "new_Tecnico" RENAME TO "Tecnico";
CREATE UNIQUE INDEX "Tecnico_nome_key" ON "Tecnico"("nome");
CREATE TABLE "new_TipoServico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TipoServico" ("createdAt", "id", "nome") SELECT "createdAt", "id", "nome" FROM "TipoServico";
DROP TABLE "TipoServico";
ALTER TABLE "new_TipoServico" RENAME TO "TipoServico";
CREATE UNIQUE INDEX "TipoServico_nome_key" ON "TipoServico"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
