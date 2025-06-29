/*
  Warnings:

  - You are about to drop the column `CARTA_MOTIVACION` on the `CURSOS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CURSOS" DROP COLUMN "CARTA_MOTIVACION";

-- AlterTable
ALTER TABLE "INSCRIPCIONES_CURSO" ADD COLUMN     "CARTA_MOTIVACION" VARCHAR(500);
