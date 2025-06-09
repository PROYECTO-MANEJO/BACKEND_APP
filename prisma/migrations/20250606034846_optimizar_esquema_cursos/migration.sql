/*
  Warnings:

  - You are about to drop the column `ASI_PAR_CUR` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `EST_PAR_CUR` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `NOT_PAR_CUR` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - Added the required column `APROBADO` to the `PARTICIPACIONES_CURSO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ASISTENCIA_PORCENTAJE` to the `PARTICIPACIONES_CURSO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NOTA_FINAL` to the `PARTICIPACIONES_CURSO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PARTICIPACIONES_CURSO" DROP COLUMN "ASI_PAR_CUR",
DROP COLUMN "EST_PAR_CUR",
DROP COLUMN "NOT_PAR_CUR",
ADD COLUMN     "APROBADO" BOOLEAN NOT NULL,
ADD COLUMN     "ASISTENCIA_PORCENTAJE" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "FECHA_EVALUACION" TIMESTAMP,
ADD COLUMN     "NOTA_FINAL" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "OBSERVACIONES" TEXT,
ADD COLUMN     "RESPONSABLE" VARCHAR(100);
