const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addComentariosInternosField() {
  try {
    console.log('Agregando campo comentarios_internos_sol...');
    
    // Ejecutar SQL directo para agregar la columna
    await prisma.$executeRaw`
      ALTER TABLE "SOLICITUDES_CAMBIO" 
      ADD COLUMN IF NOT EXISTS "COMENTARIOS_INTERNOS_SOL" TEXT;
    `;
    
    console.log('✅ Campo comentarios_internos_sol agregado exitosamente');
    
    // Verificar que el campo se agregó
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'SOLICITUDES_CAMBIO' 
      AND column_name = 'COMENTARIOS_INTERNOS_SOL';
    `;
    
    if (result.length > 0) {
      console.log('✅ Verificación exitosa: El campo existe en la base de datos');
    } else {
      console.log('❌ Error: El campo no se pudo agregar');
    }
    
  } catch (error) {
    console.error('Error al agregar el campo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addComentariosInternosField(); 