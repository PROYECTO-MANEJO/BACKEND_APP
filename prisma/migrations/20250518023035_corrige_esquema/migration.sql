-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "permisos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_nombreUsuario_key" ON "Administrador"("nombreUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_correo_key" ON "Administrador"("correo");
