/**
 * User Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de usuario según la estructura existente
 */
import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
export interface UserData {
    id?: string;
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: Date;
    phoneNumber?: string;
    password?: string;
    careerId?: string;
    githubToken?: string;
    githubUsername?: string;
}
export interface UserProfileData {
    id_usu: string;
    ced_usu: string;
    nom_usu1: string;
    nom_usu2?: string;
    ape_usu1: string;
    ape_usu2?: string;
    fec_nac_usu: Date;
    num_tel_usu?: string;
    id_car_per?: string;
    github_token?: string;
    github_username?: string;
    email?: string;
    rol?: string;
    carrera?: {
        id_car: string;
        nom_car: string;
    };
    cuentas?: any[];
}
export declare class PrismaUserRepository implements IUserRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(userData: UserData): Promise<UserData>;
    findByCedula(cedula: string): Promise<UserData | null>;
    findById(id: string): Promise<UserData | null>;
    findProfileById(id: string): Promise<UserProfileData | null>;
    findByEmail(email: string): Promise<UserData | null>;
    findAll(): Promise<UserData[]>;
    findByRole(role: string): Promise<UserData[]>;
    update(id: string, userData: Partial<UserData>): Promise<UserData>;
    delete(id: string): Promise<void>;
    private mapToUserData;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map