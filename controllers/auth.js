const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateJWT, generateAdminJWT } = require('../helpers/jwt');

const prisma = new PrismaClient();

// Controlador para registrar un nuevo usuario
const register = async (req, res) => {
    const { email, password, nombre, nombre2, apellido, apellido2, ced_usu, fec_nac_usu } = req.body;

    try {
        // Verificar si ya existe un usuario con ese correo o cédula
        const existingAccount = await prisma.cuenta.findFirst({
            where: {
                cor_cue: email
            }
        });

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una cuenta con ese correo electrónico'
            });
        }

        const existingUserByCedula = await prisma.usuario.findFirst({
            where: {
                ced_usu
            }
        });

        if (existingUserByCedula) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con esa cédula'
            });
        }

        // Verificar que la cédula está presente
        if (!ced_usu) {
            return res.status(400).json({
                success: false,
                message: 'La cédula es obligatoria'
            });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let rolAsignado = '';
        if (email && email.endsWith('@uta.edu.ec')) {
            rolAsignado = 'ESTUDIANTE'; // estudiante
        } else {
            rolAsignado = 'USUARIO'; // externo
        }

        // Validar y convertir fecha de nacimiento (OPCIONAL)
        let fechaNacimiento = null;
        if (fec_nac_usu) {
            try {
                fechaNacimiento = new Date(fec_nac_usu);
                if (isNaN(fechaNacimiento.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha de nacimiento es inválida. Usa formato YYYY-MM-DD'
                    });
                }
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha de nacimiento inválida'
                });
            }
        } else {
            // Si no se proporciona fecha, usar una fecha por defecto
            fechaNacimiento = new Date('2000-01-01');
        }

        // Crear el usuario y la cuenta en una transacción
        const result = await prisma.$transaction(async (prisma) => {
            // Crear el usuario
            const newUser = await prisma.usuario.create({
                data: {
                    ced_usu,
                    nom_usu1: nombre,
                    nom_usu2: nombre2 || '',
                    ape_usu1: apellido,
                    ape_usu2: apellido2 || '',
                    pas_usu: hashedPassword,
                    fec_nac_usu: fechaNacimiento
                }
            });

            // Crear la cuenta asociada al usuario
            const newAccount = await prisma.cuenta.create({
                data: {
                    cor_cue: email,
                    rol_cue: rolAsignado,
                    id_usu_per: newUser.id_usu
                }
            });

            return { user: newUser, account: newAccount };
        });

        // Generar el token JWT para el nuevo usuario
        const token = await generateJWT(result.user.id_usu);

        // Respuesta exitosa
        res.status(201).json({
            success: true,
            user: {
                id: result.user.id_usu,
                nombre1: result.user.nom_usu1,
                nombre2: result.user.nom_usu2,
                apellido1: result.user.ape_usu1,
                apellido2: result.user.ape_usu2,
                rol: rolAsignado
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor, contacte al administrador'
        });
    }
};

//Creaciono para el adminsitrador 
const adminCreateUser = async (req, res) => {
    try {
        const { ced_usu, nom_usu1, nom_usu2 , ape_usu1, ape_usu2 , fec_nac_usu, num_tel_usu, pas_usu, id_car_per, cor_cue } = req.body;

        // Verificar si ya existe un usuario con esa cédula o correo
        const existingUserByCedula = await prisma.usuario.findFirst({
            where: {
                ced_usu
            }
        });

        if (existingUserByCedula) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con esa cédula'
            });
        }

        const existingAccountByEmail = await prisma.cuenta.findFirst({
            where: {
                cor_cue
            }
        });

        if (existingAccountByEmail) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una cuenta con ese correo electrónico'
            });
        }

        // Validar formato de fecha
        let fechaNacimiento;
        try {
            fechaNacimiento = new Date(fec_nac_usu);
            if (isNaN(fechaNacimiento.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato de fecha de nacimiento es inválido. Use YYYY-MM-DD'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'El formato de fecha de nacimiento es inválido. Use YYYY-MM-DD'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(pas_usu, 10);

        // Crear transacción para asegurar que ambas operaciones se completen juntas
        const result = await prisma.$transaction(async (prisma) => {
            // Crear el usuario
            const newUser = await prisma.usuario.create({
                data: {
                    ced_usu,
                    nom_usu1,
                    nom_usu2,
                    ape_usu1,
                    ape_usu2,
                    fec_nac_usu: fechaNacimiento,
                    num_tel_usu,
                    pas_usu: hashedPassword,
                    id_car_per
                }
            });

            // Crear cuenta asociada con rol de administrador
            const newAccount = await prisma.cuenta.create({
                data: {
                    cor_cue,
                    rol_cue: 'ADMINISTRADOR', // Usar el enum RolCuenta definido en schema
                    id_usu_per: newUser.id_usu
                }
            });

            return { user: newUser, account: newAccount };
        });

        // Generar el token para el nuevo administrador
        const token = await generateAdminJWT(result.user.id_usu);

        res.status(201).json({
            success: true,
            message: 'Usuario administrador creado exitosamente',
            data: {
                usuario: {
                    id: result.user.id_usu,
                    cedula: result.user.ced_usu,
                    nombre: result.user.nom_usu1,
                    apellido: result.user.ape_usu1,
                    rol: 'ADMINISTRADOR'
                },
                token
            }
        });
    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
        
        // Manejo de errores específicos
        if (error.code === 'P2002') {
            return res.status(409).json({ 
                success: false, 
                message: 'El usuario ya existe. La cédula, contraseña o correo ya están registrados.' 
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario administrador',
            error: error.message
        });
    }
};

// Controlador para el login de usuarios (normales y administradores)
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar la cuenta por el correo electrónico
        const cuenta = await prisma.cuenta.findFirst({
            where: {
                cor_cue: email
            },
            include: {
                usuario: true
            }
        });

        // Verificar si la cuenta existe
        if (!cuenta) {
            return res.status(400).json({
                success: false,
                message: 'Correo electrónico no encontrado'
            });
        }

        // Verificar si el usuario existe
        if (!cuenta.usuario) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(password, cuenta.usuario.pas_usu);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        // Generar el token JWT según el rol
        let token;
        if (cuenta.rol_cue === 'ADMINISTRADOR' || cuenta.rol_cue === 'MASTER') {
            token = await generateAdminJWT(cuenta.usuario.id_usu);
        } else {
            token = await generateJWT(cuenta.usuario.id_usu);
        }

        // Respuesta exitosa
        res.json({
            success: true,
            user: {
                id: cuenta.usuario.id_usu,
                nombre: cuenta.usuario.nom_usu1,
                apellido: cuenta.usuario.ape_usu1,
                rol: cuenta.rol_cue
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor, contacte al administrador'
        });
    }
};

// Controlador para renovar el token
const renewToken = async (req, res) => {
    try {
        // Obtener el usuario del request (establecido por el middleware validateJWT)
        const usuario = req.usuario;

        // Buscar la cuenta del usuario
        const cuenta = await prisma.cuenta.findFirst({
            where: {
                id_usu_per: usuario.id_usu
            }
        });

        // Generar un nuevo token según el rol
        let token;
        if (cuenta && (cuenta.rol_cue === 'ADMINISTRADOR' || cuenta.rol_cue === 'MASTER')) {
            token = await generateAdminJWT(usuario.id_usu);
        } else {
            token = await generateJWT(usuario.id_usu);
        }

        // Respuesta exitosa
        res.json({
            success: true,
            user: {
                id: usuario.id_usu,
                nombre: usuario.nom_usu1,
                apellido: usuario.ape_usu1,
                rol: cuenta ? cuenta.rol_cue : 'USUARIO'
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor, contacte al administrador'
        });
    }
};

module.exports = {
    login,
    renewToken,
    register,
    adminCreateUser
};