/**
 * User Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de usuario según la estructura existente
 */
import { PrismaClient } from "@prisma/client";
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
export declare class PrismaUserRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(userData: UserData): Promise<UserData>;
    findByCedula(cedula: string): Promise<UserData | null>;
    findById(id: string): Promise<UserData | null>;
    findByEmail(email: string): Promise<UserData | null>;
    findAll(): Promise<UserData[]>;
    update(id: string, userData: Partial<UserData>): Promise<UserData>;
    delete(id: string): Promise<void>;
    private mapToUserData;
}
//# sourceMappingURL=PrismaUserRepository.d.ts.map