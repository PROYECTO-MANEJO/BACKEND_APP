/*
  Warnings:

  - The `ENL_CED_PDF` column on the `USUARIOS` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ENL_MAT_PDF` column on the `USUARIOS` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "USUARIOS" ADD COLUMN     "CEDULA_FILENAME" VARCHAR(255),
ADD COLUMN     "CEDULA_SIZE" INTEGER,
ADD COLUMN     "MATRICULA_FILENAME" VARCHAR(255),
ADD COLUMN     "MATRICULA_SIZE" INTEGER,
DROP COLUMN "ENL_CED_PDF",
ADD COLUMN     "ENL_CED_PDF" BYTEA,
DROP COLUMN "ENL_MAT_PDF",
ADD COLUMN     "ENL_MAT_PDF" BYTEA;
