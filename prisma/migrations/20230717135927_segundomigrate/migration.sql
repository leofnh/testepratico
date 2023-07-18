-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Telefone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idcontato" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    CONSTRAINT "Telefone_idcontato_fkey" FOREIGN KEY ("idcontato") REFERENCES "Contato" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Telefone" ("id", "idcontato", "numero") SELECT "id", "idcontato", "numero" FROM "Telefone";
DROP TABLE "Telefone";
ALTER TABLE "new_Telefone" RENAME TO "Telefone";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
