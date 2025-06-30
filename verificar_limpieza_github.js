const fs = require('fs');
const path = require('path');

/**
 * 🧹 VERIFICADOR DE LIMPIEZA DE GITHUB
 * 
 * Este script verifica que no queden rastros de la implementación de GitHub
 * en el código del backend después de la limpieza.
 */

function buscarPatronesEnArchivo(filePath, patronesBuscar) {
    try {
        const contenido = fs.readFileSync(filePath, 'utf8');
        const resultados = [];
        
        patronesBuscar.forEach(patron => {
            const lineas = contenido.split('\n');
            lineas.forEach((linea, index) => {
                if (linea.toLowerCase().includes(patron.toLowerCase())) {
                    resultados.push({
                        patron,
                        linea: index + 1,
                        contenido: linea.trim()
                    });
                }
            });
        });
        
        return resultados;
    } catch (error) {
        return [];
    }
}

function explorarDirectorio(dirPath, patronesBuscar, excluirDirs = []) {
    const resultados = [];
    
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (!excluirDirs.includes(item)) {
                    resultados.push(...explorarDirectorio(fullPath, patronesBuscar, excluirDirs));
                }
            } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.json') || item.endsWith('.env'))) {
                const coincidencias = buscarPatronesEnArchivo(fullPath, patronesBuscar);
                if (coincidencias.length > 0) {
                    resultados.push({
                        archivo: fullPath,
                        coincidencias
                    });
                }
            }
        });
    } catch (error) {
        // Directorio no accesible, continuar
    }
    
    return resultados;
}

async function verificarLimpiezaGitHub() {
    console.log('🧹 VERIFICACIÓN DE LIMPIEZA DE GITHUB\n');
    
    const patronesBuscar = [
        'github',
        'GITHUB',
        'GitHub',
        'octokit',
        'github_token',
        'github_branch',
        'github_pr',
        'github_repo',
        'github_commits',
        'github_last_sync'
    ];
    
    const directoriosExcluir = [
        'node_modules',
        '.git',
        'dist',
        'build'
    ];
    
    console.log('Buscando patrones relacionados con GitHub...');
    console.log(`Patrones: ${patronesBuscar.join(', ')}`);
    console.log(`Excluyendo directorios: ${directoriosExcluir.join(', ')}\n`);
    
    const resultados = explorarDirectorio('.', patronesBuscar, directoriosExcluir);
    
    if (resultados.length === 0) {
        console.log('✅ ¡LIMPIEZA EXITOSA!');
        console.log('No se encontraron rastros de GitHub en el código del backend.\n');
        return true;
    } else {
        console.log('⚠️  SE ENCONTRARON RASTROS DE GITHUB:\n');
        
        resultados.forEach((resultado, index) => {
            console.log(`${index + 1}. Archivo: ${resultado.archivo}`);
            resultado.coincidencias.forEach(coincidencia => {
                console.log(`   Línea ${coincidencia.linea}: ${coincidencia.contenido}`);
                console.log(`   Patrón: "${coincidencia.patron}"`);
            });
            console.log('');
        });
        
        return false;
    }
}

// Ejecutar verificación
verificarLimpiezaGitHub()
    .then(limpio => {
        if (limpio) {
            console.log('🎉 El backend está completamente limpio de GitHub.');
            console.log('Puedes proceder con una nueva implementación desde cero.');
        } else {
            console.log('🔧 Hay algunos rastros que necesitas limpiar manualmente.');
        }
        process.exit(limpio ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    });
