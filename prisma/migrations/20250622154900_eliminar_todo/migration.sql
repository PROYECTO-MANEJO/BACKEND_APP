/*
  Warnings:

  - You are about to drop the column `ENL_CER_PAR` on the `PARTICIPACIONES` table. All the data in the column will be lost.
  - You are about to drop the column `ENL_CER_PAR_CUR` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `OBSERVACIONES` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the column `RESPONSABLE` on the `PARTICIPACIONES_CURSO` table. All the data in the column will be lost.
  - You are about to drop the `SOLICITUDES_CAMBIO` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "EstadoPago" ADD VALUE 'CANCELADO';

-- DropForeignKey
ALTER TABLE "SOLICITUDES_CAMBIO" DROP CONSTRAINT "SOLICITUDES_CAMBIO_ID_ADMIN_RESP_SOL_fkey";

-- DropForeignKey
ALTER TABLE "SOLICITUDES_CAMBIO" DROP CONSTRAINT "SOLICITUDES_CAMBIO_ID_USUARIO_SOL_fkey";

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

-- DropTable
DROP TABLE "SOLICITUDES_CAMBIO";

-- DropEnum
DROP TYPE "EstadoSolicitud";

-- DropEnum
DROP TYPE "PrioridadSolicitud";

-- DropEnum
DROP TYPE "TipoCambio";
