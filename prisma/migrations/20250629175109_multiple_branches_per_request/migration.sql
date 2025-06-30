/*
  Warnings:

  - You are about to drop the column `GITHUB_BRANCH_NAME` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_LAST_SYNC` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_MERGED_AT` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_PR_NUMBER` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_PR_STATE` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_PR_URL` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_REPO_URL` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RepositoryType" AS ENUM ('FRONTEND', 'BACKEND');

-- CreateEnum
CREATE TYPE "PRStatus" AS ENUM ('PENDING', 'OPEN', 'APPROVED', 'REJECTED', 'MERGED');

-- AlterTable
ALTER TABLE "SOLICITUDES_CAMBIO" DROP COLUMN "GITHUB_BRANCH_NAME",
DROP COLUMN "GITHUB_LAST_SYNC",
DROP COLUMN "GITHUB_MERGED_AT",
DROP COLUMN "GITHUB_PR_NUMBER",
DROP COLUMN "GITHUB_PR_STATE",
DROP COLUMN "GITHUB_PR_URL",
DROP COLUMN "GITHUB_REPO_URL";

-- AlterTable
ALTER TABLE "USUARIOS" ADD COLUMN     "GITHUB_USERNAME" VARCHAR(100);

-- CreateTable
CREATE TABLE "SOLICITUDES_RAMAS" (
    "ID" UUID NOT NULL,
    "ID_SOLICITUD" UUID NOT NULL,
    "REPOSITORY_TYPE" "RepositoryType" NOT NULL,
    "BRANCH_NAME" VARCHAR(255) NOT NULL,
    "PR_NUMBER" INTEGER,
    "PR_URL" VARCHAR(500),
    "PR_STATE" VARCHAR(50),
    "PR_STATUS" "PRStatus" NOT NULL DEFAULT 'PENDING',
    "CREATED_AT" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UPDATED_AT" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MERGED_AT" TIMESTAMP,
    "LAST_SYNC" TIMESTAMP,

    CONSTRAINT "SOLICITUDES_RAMAS_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "SOLICITUDES_RAMAS_ID_SOLICITUD_REPOSITORY_TYPE_key" ON "SOLICITUDES_RAMAS"("ID_SOLICITUD", "REPOSITORY_TYPE");

-- AddForeignKey
ALTER TABLE "SOLICITUDES_RAMAS" ADD CONSTRAINT "SOLICITUDES_RAMAS_ID_SOLICITUD_fkey" FOREIGN KEY ("ID_SOLICITUD") REFERENCES "SOLICITUDES_CAMBIO"("ID_SOL") ON DELETE CASCADE ON UPDATE CASCADE;
