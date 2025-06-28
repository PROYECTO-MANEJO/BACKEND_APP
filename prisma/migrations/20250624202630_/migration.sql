/*
  Warnings:

  - You are about to drop the column `ENL_CER_PAR` on the `PARTICIPACIONES` table. All the data in the column will be lost.
  - You are about to drop the column `ENL_CER_PAR_CUR` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `OBSERVACIONES` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `RESPONSABLE` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CURSOS" ADD COLUMN     "CARTA_MOTIVACION" VARCHAR(500);

-- AlterTable
ALTER TABLE "PARTICIPACIONES" DROP COLUMN "ENL_CER_PAR",
ADD COLUMN     "CERTIFICADO_FILENAME" VARCHAR(255),
ADD COLUMN     "CERTIFICADO_PDF" BYTEA,
ADD COLUMN     "CERTIFICADO_SIZE" INTEGER;

-- AlterTable
ALTER TABLE "PARTICIPACIONES_CURSO" DROP COLUMN "ENL_CER_PAR_CUR",
DROP COLUMN "OBSERVACIONES",
DROP COLUMN "RESPONSABLE",
ADD COLUMN     "CERTIFICADO_FILENAME" VARCHAR(255),
ADD COLUMN     "CERTIFICADO_PDF" BYTEA,
ADD COLUMN     "CERTIFICADO_SIZE" INTEGER;
