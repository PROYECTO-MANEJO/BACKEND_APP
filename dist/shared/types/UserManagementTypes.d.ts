/**
 * DTOs para User Management
 * Principio SRP: Solo definición de tipos de transferencia
 */
export interface UpdateUserProfileDto {
    firstName?: string;
    secondName?: string;
    lastName?: string;
    secondLastName?: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    careerId?: number;
    githubToken?: string;
}
export interface CreateUserDto {
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: Date;
    phoneNumber?: string;
    email: string;
    password: string;
    careerId?: number;
    role: "ESTUDIANTE" | "USUARIO" | "ADMINISTRADOR" | "MASTER" | "DESARROLLADOR";
}
export interface UserProfileResponse {
    id: number;
    cedula: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    secondLastName?: string;
    dateOfBirth: Date;
    phoneNumber?: string;
    careerId?: number;
    career?: {
        id: number;
        name: string;
        code: string;
    };
    account: {
        id: number;
        email: string;
        role: string;
        isVerified: boolean;
    };
    githubToken?: string;
    githubUsername?: string;
}
export interface CreateCareerDto {
    name: string;
    code: string;
    faculty: string;
    isActive?: boolean;
}
export interface UpdateCareerDto {
    name?: string;
    code?: string;
    faculty?: string;
    isActive?: boolean;
}
//# sourceMappingURL=UserManagementTypes.d.ts.map