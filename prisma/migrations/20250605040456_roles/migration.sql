-- AlterEnum
ALTER TYPE "RolCuenta" ADD VALUE 'ESTUDIANTE';

-- CreateTable
CREATE TABLE "Curso" (
    "ID_CUR" UUID NOT NULL,
    "NOM_CUR" VARCHAR(200) NOT NULL,
    "DES_CUR" VARCHAR(500) NOT NULL,
    "DUR_CUR" SMALLINT NOT NULL,
    "FEC_INI_CUR" DATE NOT NULL,
    "FEC_FIN_CUR" DATE NOT NULL,
    "ID_CAT_CUR" UUID NOT NULL,
    "CED_ORG_CUR" VARCHAR(10) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("ID_CUR")
);

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_ID_CAT_CUR_fkey" FOREIGN KEY ("ID_CAT_CUR") REFERENCES "CategoriaEvento"("ID_CAT") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_CED_ORG_CUR_fkey" FOREIGN KEY ("CED_ORG_CUR") REFERENCES "Organizador"("CED_ORG") ON DELETE RESTRICT ON UPDATE CASCADE;
