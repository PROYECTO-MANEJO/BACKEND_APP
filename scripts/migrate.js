const { exec } = require('child_process');

console.log('🚀 Iniciando migración de la base de datos...');

// Generar el cliente de Prisma
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al generar el cliente de Prisma:', error);
    return;
  }
  
  console.log('✅ Cliente de Prisma generado exitosamente');
  console.log(stdout);
  
  // Ejecutar la migración
  exec('npx prisma db push', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al ejecutar la migración:', error);
      return;
    }
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log(stdout);
    
    console.log('\n🎉 ¡Base de datos actualizada correctamente!');
    console.log('\nLa tabla SOLICITUDES_CAMBIO ha sido creada con:');
    console.log('- Todos los campos necesarios para el control de cambios');
    console.log('- Relaciones con la tabla de usuarios');
    console.log('- Enums para tipos, prioridades y estados');
    console.log('\nYa puedes usar la API de solicitudes de cambio.');
  });
}); 