/*
  Warnings:

  - A unique constraint covering the columns `[idcontato]` on the table `Telefone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Telefone_idcontato_key" ON "Telefone"("idcontato");
