/*
  Warnings:

  - You are about to drop the column `COMENTARIOS_MASTER_PR_SOL` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_BASE_BRANCH` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to drop the column `GITHUB_REPOSITORY` on the `SOLICITUDES_CAMBIO` table. All the data in the column will be lost.
  - You are about to alter the column `GITHUB_REPO_URL` on the `SOLICITUDES_CAMBIO` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `GITHUB_BRANCH_NAME` on the `SOLICITUDES_CAMBIO` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(200)`.
  - You are about to alter the column `GITHUB_PR_URL` on the `SOLICITUDES_CAMBIO` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- DropIndex
DROP INDEX "SOLICITUDES_CAMBIO_GITHUB_BRANCH_NAME_idx";

-- DropIndex
DROP INDEX "SOLICITUDES_CAMBIO_GITHUB_PR_NUMBER_idx";

-- DropIndex
DROP INDEX "SOLICITUDES_CAMBIO_GITHUB_REPOSITORY_idx";

-- AlterTable
ALTER TABLE "SOLICITUDES_CAMBIO" DROP COLUMN "COMENTARIOS_MASTER_PR_SOL",
DROP COLUMN "GITHUB_BASE_BRANCH",
DROP COLUMN "GITHUB_REPOSITORY",
ALTER COLUMN "GITHUB_REPO_URL" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "GITHUB_BRANCH_NAME" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "GITHUB_PR_URL" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "USUARIOS" ADD COLUMN     "GITHUB_TOKEN" VARCHAR(255);
