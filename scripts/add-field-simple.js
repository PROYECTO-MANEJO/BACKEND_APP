const { Client } = require('pg');

async function addField() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Cursos_Fisei',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'SOLICITUDES_CAMBIO' 
      AND column_name = 'COMENTARIOS_INTERNOS_SOL'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna COMENTARIOS_INTERNOS_SOL ya existe');
    } else {
      // Agregar la columna
      await client.query(`
        ALTER TABLE "SOLICITUDES_CAMBIO" 
        ADD COLUMN "COMENTARIOS_INTERNOS_SOL" TEXT
      `);
      console.log('✅ Columna COMENTARIOS_INTERNOS_SOL agregada exitosamente');
    }

    // Verificar nuevamente
    const verify = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'SOLICITUDES_CAMBIO' 
      AND column_name = 'COMENTARIOS_INTERNOS_SOL'
    `);

    if (verify.rows.length > 0) {
      console.log('✅ Verificación exitosa: La columna existe');
    } else {
      console.log('❌ Error: La columna no se pudo agregar');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

addField(); 