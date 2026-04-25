-- CreateTable
CREATE TABLE "Chamado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroChamado" TEXT,
    "nomeSolicitante" TEXT NOT NULL,
    "emailSolicitante" TEXT NOT NULL,
    "dataSolicitacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataOcorrencia" DATETIME NOT NULL,
    "localOcorrencia" TEXT NOT NULL,
    "responsavelAmbiente" TEXT NOT NULL,
    "patrimonio" TEXT NOT NULL,
    "serieOriginal" TEXT NOT NULL,
    "descricaoProblema" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aberto',
    "horaInicioAtendimento" DATETIME,
    "horaConclusaoAtendimento" DATETIME,
    "dataSolucao" DATETIME,
    "solucaoAplicada" TEXT,
    "serieNova" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
