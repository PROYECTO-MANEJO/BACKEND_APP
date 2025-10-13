"use strict";
/**
 * User Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de usuario según la estructura existente
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userData) {
        const usuario = await this.prisma.usuario.create({
            data: {
                ced_usu: userData.cedula,
                nom_usu1: userData.firstName,
                nom_usu2: userData.secondName || "",
                ape_usu1: userData.lastName,
                ape_usu2: userData.secondLastName || "",
                fec_nac_usu: userData.dateOfBirth,
                num_tel_usu: userData.phoneNumber || null,
                pas_usu: userData.password || null,
                id_car_per: userData.careerId || null,
                github_token: userData.githubToken || null,
                github_username: userData.githubUsername || null,
            },
            include: {
                carrera: true,
            },
        });
        return this.mapToUserData(usuario);
    }
    async findByCedula(cedula) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { ced_usu: cedula },
            include: {
                carrera: true,
                cuentas: true,
            },
        });
        if (!usuario)
            return null;
        return this.mapToUserData(usuario);
    }
    async findById(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id_usu: id },
            include: {
                carrera: true,
                cuentas: true,
            },
        });
        if (!usuario)
            return null;
        return this.mapToUserData(usuario);
    }
    async findProfileById(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id_usu: id },
            include: {
                carrera: true,
                cuentas: true,
            },
        });
        if (!usuario)
            return null;
        const account = usuario.cuentas[0];
        return {
            id_usu: usuario.id_usu,
            ced_usu: usuario.ced_usu,
            nom_usu1: usuario.nom_usu1,
            nom_usu2: usuario.nom_usu2,
            ape_usu1: usuario.ape_usu1,
            ape_usu2: usuario.ape_usu2,
            fec_nac_usu: usuario.fec_nac_usu,
            num_tel_usu: usuario.num_tel_usu || undefined,
            id_car_per: usuario.id_car_per || undefined,
            github_token: usuario.github_token || undefined,
            github_username: usuario.github_username || undefined,
            email: account?.cor_cue,
            rol: account?.rol_cue,
            carrera: usuario.carrera
                ? { id_car: usuario.carrera.id_car, nom_car: usuario.carrera.nom_car }
                : undefined,
            cuentas: usuario.cuentas,
        };
    }
    async findByEmail(email) {
        const cuenta = await this.prisma.cuenta.findFirst({
            where: { cor_cue: email },
            include: {
                usuario: {
                    include: {
                        carrera: true,
                    },
                },
            },
        });
        if (!cuenta || !cuenta.usuario)
            return null;
        return this.mapToUserData(cuenta.usuario);
    }
    async findAll() {
        const usuarios = await this.prisma.usuario.findMany({
            include: {
                carrera: true,
                cuentas: true,
            },
        });
        return usuarios.map((usuario) => this.mapToUserData(usuario));
    }
    async findByRole(role) {
        const cuentas = await this.prisma.cuenta.findMany({
            where: { rol_cue: role },
            include: {
                usuario: {
                    include: {
                        carrera: true
                    }
                }
            }
        });
        return cuentas
            .filter((cuenta) => cuenta.usuario)
            .map((cuenta) => this.mapToUserData(cuenta.usuario));
    }
    async update(id, userData) {
        const usuario = await this.prisma.usuario.update({
            where: { id_usu: id },
            data: {
                nom_usu1: userData.firstName,
                nom_usu2: userData.secondName,
                ape_usu1: userData.lastName,
                ape_usu2: userData.secondLastName,
                fec_nac_usu: userData.dateOfBirth,
                num_tel_usu: userData.phoneNumber,
                pas_usu: userData.password,
                id_car_per: userData.careerId,
                github_token: userData.githubToken,
                github_username: userData.githubUsername,
            },
            include: {
                carrera: true,
                cuentas: true,
            },
        });
        return this.mapToUserData(usuario);
    }
    async delete(id) {
        await this.prisma.usuario.delete({
            where: { id_usu: id },
        });
    }
    mapToUserData(usuario) {
        return {
            id: usuario.id_usu,
            cedula: usuario.ced_usu,
            firstName: usuario.nom_usu1,
            secondName: usuario.nom_usu2 || undefined,
            lastName: usuario.ape_usu1,
            secondLastName: usuario.ape_usu2 || undefined,
            dateOfBirth: usuario.fec_nac_usu,
            phoneNumber: usuario.num_tel_usu || undefined,
            password: usuario.pas_usu || undefined,
            careerId: usuario.id_car_per || undefined,
            githubToken: usuario.github_token || undefined,
            githubUsername: usuario.github_username || undefined,
        };
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=PrismaUserRepository.js.map