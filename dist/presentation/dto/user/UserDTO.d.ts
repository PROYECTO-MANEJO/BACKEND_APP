export interface CreateUserRequestDTO {
    cedula: string;
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
    rol?: string;
}
export interface UpdateUserRequestDTO {
    nombres?: string;
    apellidos?: string;
    email?: string;
    telefono?: string;
    rol?: string;
}
export interface UserResponseDTO {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono?: string;
    rol: string;
    fechaCreacion: Date;
    estado: boolean;
}
export interface UserListResponseDTO {
    users: UserResponseDTO[];
    total: number;
    page: number;
    pageSize: number;
}
export interface LoginRequestDTO {
    email: string;
    password: string;
}
export interface LoginResponseDTO {
    token: string;
    user: UserResponseDTO;
    expiresIn: number;
}
export interface PasswordResetRequestDTO {
    email: string;
}
export interface PasswordResetConfirmDTO {
    token: string;
    newPassword: string;
}
export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=UserDTO.d.ts.map