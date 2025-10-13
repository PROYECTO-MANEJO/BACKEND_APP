export interface IUserRepository {
    findById(id: string): Promise<any | null>;
    findByEmail(email: string): Promise<any | null>;
    findByCedula(cedula: string): Promise<any | null>;
    create(userData: any): Promise<any>;
    update(id: string, userData: any): Promise<any | null>;
    delete(id: string): Promise<void>;
    findAll(): Promise<any[]>;
    findByRole(role: string): Promise<any[]>;
}
export interface UserFilters {
    role?: string;
    verified?: boolean;
    career?: number;
    search?: string;
}
//# sourceMappingURL=IUserRepository.d.ts.map