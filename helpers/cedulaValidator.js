/**
 * Validador de Cédula Ecuatoriana
 * Implementa el algoritmo oficial del Registro Civil del Ecuador
 * Válido para las 24 provincias de Ecuador
 */

/**
 * Códigos de provincias ecuatorianas (primeros 2 dígitos de la cédula)
 * 01-24: Provincias válidas
 * 30: Ecuatorianos en el exterior
 */
const PROVINCIAS_ECUADOR = [
  { codigo: '01', nombre: 'Azuay' },
  { codigo: '02', nombre: 'Bolívar' },
  { codigo: '03', nombre: 'Cañar' },
  { codigo: '04', nombre: 'Carchi' },
  { codigo: '05', nombre: 'Cotopaxi' },
  { codigo: '06', nombre: 'Chimborazo' },
  { codigo: '07', nombre: 'El Oro' },
  { codigo: '08', nombre: 'Esmeraldas' },
  { codigo: '09', nombre: 'Guayas' },
  { codigo: '10', nombre: 'Imbabura' },
  { codigo: '11', nombre: 'Loja' },
  { codigo: '12', nombre: 'Los Ríos' },
  { codigo: '13', nombre: 'Manabí' },
  { codigo: '14', nombre: 'Morona Santiago' },
  { codigo: '15', nombre: 'Napo' },
  { codigo: '16', nombre: 'Pastaza' },
  { codigo: '17', nombre: 'Pichincha' },
  { codigo: '18', nombre: 'Tungurahua' },
  { codigo: '19', nombre: 'Zamora Chinchipe' },
  { codigo: '20', nombre: 'Galápagos' },
  { codigo: '21', nombre: 'Sucumbíos' },
  { codigo: '22', nombre: 'Orellana' },
  { codigo: '23', nombre: 'Santo Domingo de los Tsáchilas' },
  { codigo: '24', nombre: 'Santa Elena' },
  { codigo: '30', nombre: 'Ecuatorianos en el exterior' }
];

/**
 * Valida si una cédula ecuatoriana es válida
 * @param {string} cedula - Cédula a validar (10 dígitos)
 * @returns {Object} - { isValid: boolean, error?: string, provincia?: string }
 */
function validarCedulaEcuatoriana(cedula) {
  // Validar que sea string y remover espacios
  if (typeof cedula !== 'string') {
    return { isValid: false, error: 'La cédula debe ser una cadena de texto' };
  }
  
  cedula = cedula.trim();
  
  // Validar longitud
  if (cedula.length !== 10) {
    return { isValid: false, error: 'La cédula debe tener exactamente 10 dígitos' };
  }
  
  // Validar que solo contenga números
  if (!/^\d{10}$/.test(cedula)) {
    return { isValid: false, error: 'La cédula solo debe contener números' };
  }
  
  // Validar provincia (primeros 2 dígitos)
  const codigoProvincia = cedula.substring(0, 2);
  const provincia = PROVINCIAS_ECUADOR.find(p => p.codigo === codigoProvincia);
  
  if (!provincia) {
    return { isValid: false, error: `Código de provincia inválido: ${codigoProvincia}. Debe estar entre 01-24 o 30` };
  }
  
  // Validar tercer dígito (debe ser menor a 6 para personas naturales)
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito >= 6) {
    return { isValid: false, error: 'El tercer dígito debe ser menor a 6 para personas naturales' };
  }
  
  // Algoritmo de validación del dígito verificador
  const digitos = cedula.split('').map(d => parseInt(d));
  const digitoVerificador = digitos[9];
  
  // Coeficientes para el algoritmo de validación
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto >= 10) {
      producto = producto - 9;
    }
    suma += producto;
  }
  
  // Calcular dígito verificador esperado
  const residuo = suma % 10;
  const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;
  
  if (digitoCalculado !== digitoVerificador) {
    return { 
      isValid: false, 
      error: `Dígito verificador inválido. Esperado: ${digitoCalculado}, Recibido: ${digitoVerificador}` 
    };
  }
  
  return { 
    isValid: true, 
    provincia: provincia.nombre,
    codigoProvincia: provincia.codigo
  };
}

/**
 * Middleware personalizado para express-validator
 * @param {string} value - Valor de la cédula
 * @returns {boolean} - true si es válida, throw Error si no
 */
function validarCedulaMiddleware(value) {
  const resultado = validarCedulaEcuatoriana(value);
  
  if (!resultado.isValid) {
    throw new Error(resultado.error);
  }
  
  return true;
}

/**
 * Función para obtener información de una provincia por código
 * @param {string} codigo - Código de provincia (01-24, 30)
 * @returns {Object|null} - Información de la provincia o null si no existe
 */
function obtenerProvincia(codigo) {
  return PROVINCIAS_ECUADOR.find(p => p.codigo === codigo) || null;
}

/**
 * Función para obtener todas las provincias
 * @returns {Array} - Array con todas las provincias
 */
function obtenerTodasLasProvincias() {
  return PROVINCIAS_ECUADOR;
}

module.exports = {
  validarCedulaEcuatoriana,
  validarCedulaMiddleware,
  obtenerProvincia,
  obtenerTodasLasProvincias,
  PROVINCIAS_ECUADOR
};
