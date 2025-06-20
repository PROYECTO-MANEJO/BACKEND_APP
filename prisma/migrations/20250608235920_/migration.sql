-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('FINANZAS', 'USUARIOS', 'CURSOS', 'EVENTOS');

-- CreateTable
CREATE TABLE "REPORTES" (
    "ID_REP" UUID NOT NULL,
    "TIPO" "TipoReporte" NOT NULL,
    "NOMBRE_ARCHIVO" VARCHAR(255) NOT NULL,
    "ARCHIVO_PDF" BYTEA NOT NULL,
    "FECHA_GENERADO" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "REPORTES_pkey" PRIMARY KEY ("ID_REP")
);
